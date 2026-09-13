import events, {
  BonusEventData,
  DrowsyEventData,
} from "../../../pokesleep-tool/src/data/events";
import pokemons, {
  IngredientNames,
  type PokemonData,
  PokemonTypes,
} from "../../../pokesleep-tool/src/data/pokemons";
import bundledEventJson from "../vendor/upstream-data/event.json";
import bundledPokemonJson from "../vendor/upstream-data/pokemon.json";

const sourceBase =
  "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data";
const cacheKey = "upstream-data-pack.v1";
const refreshInterval = 6 * 60 * 60 * 1000;
const bundledPokemonCount = pokemons.length;
const supportedSkills = new Set([
  "Ingredient Magnet S",
  "Ingredient Magnet S (Plus)",
  "Ingredient Magnet S (Present)",
  "Charge Energy S",
  "Charge Energy S (Moonlight)",
  "Charge Strength S",
  "Charge Strength S (Random)",
  "Charge Strength S (Stockpile)",
  "Charge Strength M",
  "Charge Strength M (Bad Dreams)",
  "Dream Shard Magnet S",
  "Dream Shard Magnet S (Random)",
  "Dream Shard Magnet S (Aura Sphere)",
  "Energizing Cheer S",
  "Energizing Cheer S (Nuzzle)",
  "Energizing Cheer S (Heal Pulse)",
  "Metronome",
  "Energy for Everyone S",
  "Energy for Everyone S (Lunar Blessing)",
  "Energy for Everyone S (Berry Juice)",
  "Extra Helpful S",
  "Cooking Power-Up S",
  "Cooking Power-Up S (Minus)",
  "Tasty Chance S",
  "Helper Boost",
  "Berry Burst",
  "Berry Burst (Disguise)",
  "Skill Copy",
  "Skill Copy (Transform)",
  "Skill Copy (Mimic)",
  "Ingredient Draw S",
  "Ingredient Draw S (Super Luck)",
  "Ingredient Draw S (Hyper Cutter)",
  "Cooking Assist S",
  "Cooking Assist S (Bulk Up)",
  "Versatile",
  "Berry Burst (Draco Meteor)",
]);
const supportedForms = new Set([
  undefined,
  "Halloween",
  "Holiday",
  "Alola",
  "Paldea",
  "Amped",
  "Low Key",
  "Small",
  "Medium",
  "Large",
  "Jumbo",
  "Captain",
]);
const supportedIngredients = new Set<string>([
  ...IngredientNames,
  "unknown",
  "unknown1",
  "unknown2",
  "unknown3",
]);
const supportedTypes = new Set<string>(PokemonTypes);
const supportedSpecialties = new Set([
  "Berries",
  "Ingredients",
  "Skills",
  "All",
]);
const supportedSleepTypes = new Set([
  "dozing",
  "snozing",
  "snoozing",
  "slumbering",
  "unknown",
]);
const supportedExp = new Set([600, 900, 1080, 1320]);
const supportedEventEffectKeys = new Set([
  "skillTrigger",
  "skillLevel",
  "berry",
  "ingredient",
  "dreamShard",
  "ingredientMagnet",
  "ingredientDraw",
  "skillIngredient",
  "berryBurst",
  "dish",
  "energyFromDish",
  "potSize",
  "carryLimitAdd",
  "carryLimitMul",
  "fixedBerries",
  "fixedAreas",
]);
const supportedNumericEventEffects: Record<string, ReadonlySet<number>> = {
  skillTrigger: new Set([1, 1.25, 1.5]),
  skillLevel: new Set([0, 1, 2, 3, 5]),
  berry: new Set([0, 1]),
  ingredient: new Set([0, 1, 1.5]),
  dreamShard: new Set([1, 1.5, 2]),
  ingredientMagnet: new Set([1, 1.5]),
  ingredientDraw: new Set([1, 1.5]),
  skillIngredient: new Set([1, 1.25]),
  berryBurst: new Set([1, 1.4]),
  dish: new Set([1, 1.1, 1.25, 1.5]),
  energyFromDish: new Set([0, 5]),
  potSize: new Set([1, 1.6, 2]),
  carryLimitAdd: new Set([0, 8, 15]),
  carryLimitMul: new Set([1, 1.5]),
};

type JsonObject = Record<string, unknown>;

export interface UpstreamDataIssue {
  kind: "pokemon" | "event" | "pack";
  name: string;
  reason: string;
}

export interface ValidatedUpstreamDataPack {
  pokemon: PokemonData[];
  drowsy: ConstructorParameters<typeof DrowsyEventData>[0][];
  bonus: ConstructorParameters<typeof BonusEventData>[0][];
  issues: UpstreamDataIssue[];
}

interface CachedUpstreamDataPack {
  checkedAt: number;
  pokemon: unknown;
  event: unknown;
}

export interface UpstreamDataStatus {
  source: "bundled" | "cached" | "network";
  checkedAt: number | null;
  pokemonCount: number;
  issues: UpstreamDataIssue[];
  fallbackPokemonNames: string[];
}

let currentStatus: UpstreamDataStatus = {
  source: "bundled",
  checkedAt: null,
  pokemonCount: pokemons.length,
  issues: [],
  fallbackPokemonNames: [],
};

function object(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validIngredient(value: unknown, slots: readonly string[]): boolean {
  const item = object(value);
  return (
    item !== null &&
    supportedIngredients.has(String(item.name)) &&
    slots.every((slot) => finite(item[slot]) && Number(item[slot]) >= 0)
  );
}

function validatePokemon(value: unknown): PokemonData | string {
  const item = object(value);
  if (item === null) return "not an object";
  if (!Number.isInteger(item.id) || typeof item.name !== "string")
    return "invalid identity";
  if (!supportedForms.has(item.form as PokemonData["form"]))
    return "unsupported form";
  if (!supportedSleepTypes.has(String(item.sleepType)))
    return "unsupported sleep type";
  if (!supportedExp.has(Number(item.exp))) return "unsupported EXP type";
  if (!supportedTypes.has(String(item.type))) return "unsupported type";
  if (!supportedSpecialties.has(String(item.specialty)))
    return "unsupported specialty";
  if (!supportedSkills.has(item.skill as PokemonData["skill"]))
    return "unsupported main skill";
  if (
    typeof item.arrival !== "string" ||
    !finite(item.fp) ||
    !finite(item.frequency) ||
    !finite(item.ingRate) ||
    !finite(item.skillRate) ||
    !finite(item.carryLimit)
  )
    return "invalid numeric properties";
  if (
    !(item.ancestor === null || Number.isInteger(item.ancestor)) ||
    ![-1, 0, 1, 2].includes(Number(item.evolutionCount)) ||
    ![0, 1, 2].includes(Number(item.evolutionLeft)) ||
    typeof item.isFullyEvolved !== "boolean"
  )
    return "invalid evolution properties";
  if (
    !validIngredient(item.ing1, ["c1", "c2", "c3"]) ||
    !validIngredient(item.ing2, ["c2", "c3"]) ||
    !(item.ing3 === undefined || validIngredient(item.ing3, ["c3"]))
  )
    return "unsupported ingredient";
  if (item.mythIng !== undefined) {
    if (
      !Array.isArray(item.mythIng) ||
      !item.mythIng.every((ingredient) =>
        validIngredient(ingredient, ["c1", "c2", "c3"]),
      )
    )
      return "unsupported mythical ingredients";
  }
  return {
    ...item,
    sleepType: item.sleepType === "snozing" ? "snoozing" : item.sleepType,
  } as unknown as PokemonData;
}

function validateDrowsyEvent(
  value: unknown,
): ConstructorParameters<typeof DrowsyEventData>[0] | string {
  const item = object(value);
  if (
    item === null ||
    typeof item.name !== "string" ||
    typeof item.day !== "string" ||
    !finite(item.bonus)
  )
    return "invalid drowsy event";
  return item as unknown as ConstructorParameters<typeof DrowsyEventData>[0];
}

function validateBonusEvent(
  value: unknown,
): ConstructorParameters<typeof BonusEventData>[0] | string {
  const item = object(value);
  if (
    item === null ||
    typeof item.name !== "string" ||
    typeof item.start !== "string" ||
    typeof item.end !== "string"
  )
    return "invalid bonus event";
  const target = object(item.target);
  const effects = object(item.effects);
  if (target === null || effects === null) return "invalid event details";
  if (
    target.specialty !== undefined &&
    !supportedSpecialties.has(String(target.specialty))
  )
    return "unsupported target specialty";
  if (
    target.type !== undefined &&
    !(
      supportedTypes.has(String(target.type)) ||
      (Array.isArray(target.type) &&
        target.type.every((type) => supportedTypes.has(String(type))))
    )
  )
    return "unsupported target type";
  for (const [key, effect] of Object.entries(effects)) {
    if (!supportedEventEffectKeys.has(key)) return `unsupported effect ${key}`;
    if (key === "fixedBerries") {
      if (
        !Array.isArray(effect) ||
        !effect.every(
          (type) => type === null || supportedTypes.has(String(type)),
        )
      )
        return "unsupported fixed berries";
    } else if (key === "fixedAreas") {
      if (!Array.isArray(effect) || !effect.every(Number.isInteger))
        return "invalid fixed areas";
    } else if (
      !finite(effect) ||
      !supportedNumericEventEffects[key]?.has(effect)
    )
      return `unsupported effect value ${key}`;
  }
  return item as unknown as ConstructorParameters<typeof BonusEventData>[0];
}

export function validateUpstreamDataPack(
  pokemonJson: unknown,
  eventJson: unknown,
): ValidatedUpstreamDataPack {
  if (
    !Array.isArray(pokemonJson) ||
    pokemonJson.length < Math.floor(bundledPokemonCount * 0.9)
  )
    throw new TypeError("Pokémon data is missing or truncated");
  const eventObject = object(eventJson);
  if (
    eventObject === null ||
    !Array.isArray(eventObject.drowsy) ||
    !Array.isArray(eventObject.bonus) ||
    eventObject.drowsy.length === 0 ||
    eventObject.bonus.length === 0
  )
    throw new TypeError("Event data is missing or invalid");
  const issues: UpstreamDataIssue[] = [];
  const pokemon: PokemonData[] = [];
  for (const value of pokemonJson) {
    const validated = validatePokemon(value);
    if (typeof validated === "string") {
      const item = object(value);
      issues.push({
        kind: "pokemon",
        name: typeof item?.name === "string" ? item.name : "(unknown)",
        reason: validated,
      });
    } else pokemon.push(validated);
  }
  const drowsy: ValidatedUpstreamDataPack["drowsy"] = [];
  for (const value of eventObject.drowsy) {
    const validated = validateDrowsyEvent(value);
    if (typeof validated === "string")
      issues.push({ kind: "event", name: "(drowsy)", reason: validated });
    else drowsy.push(validated);
  }
  const bonus: ValidatedUpstreamDataPack["bonus"] = [];
  for (const value of eventObject.bonus) {
    const validated = validateBonusEvent(value);
    if (typeof validated === "string") {
      const item = object(value);
      issues.push({
        kind: "event",
        name: typeof item?.name === "string" ? item.name : "(unknown)",
        reason: validated,
      });
    } else bonus.push(validated);
  }
  return { pokemon, drowsy, bonus, issues };
}

export function applyUpstreamDataPack(
  pack: ValidatedUpstreamDataPack,
  source: UpstreamDataStatus["source"],
  checkedAt: number,
): UpstreamDataStatus {
  pokemons.splice(0, pokemons.length, ...pack.pokemon);
  events.drowsy.splice(
    0,
    events.drowsy.length,
    ...pack.drowsy.map((event) => new DrowsyEventData(event)),
  );
  events.bonus.splice(
    0,
    events.bonus.length,
    ...pack.bonus.map((event) => new BonusEventData(event)),
  );
  currentStatus = {
    source,
    checkedAt,
    pokemonCount: pack.pokemon.length,
    issues: pack.issues,
    fallbackPokemonNames: pack.pokemon.map((pokemon) => pokemon.name),
  };
  return currentStatus;
}

export function getUpstreamDataStatus(): UpstreamDataStatus {
  return currentStatus;
}

export function isUpstreamEventSupported(event: string | null): boolean {
  return (
    event === null ||
    event === "none" ||
    event === "custom" ||
    events.bonus.some((candidate) => candidate.name === event)
  );
}

async function readCache(): Promise<CachedUpstreamDataPack | null> {
  const stored = await chrome.storage.local.get(cacheKey);
  const value = stored[cacheKey];
  const candidate = object(value);
  if (
    candidate === null ||
    !finite(candidate.checkedAt) ||
    candidate.pokemon === undefined ||
    candidate.event === undefined
  )
    return null;
  return candidate as unknown as CachedUpstreamDataPack;
}

async function fetchJson(file: string): Promise<unknown> {
  const response = await fetch(`${sourceBase}/${file}`, {
    cache: "no-cache",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function prepareUpstreamDataPack(
  now = Date.now(),
): Promise<UpstreamDataStatus> {
  try {
    applyUpstreamDataPack(
      validateUpstreamDataPack(bundledPokemonJson, bundledEventJson),
      "bundled",
      0,
    );
  } catch (cause) {
    console.error(
      "[Pokémon Sleep Tool Extension] Bundled upstream data is invalid",
      cause,
    );
  }
  let cached: CachedUpstreamDataPack | null = null;
  try {
    cached = await readCache();
    if (cached !== null) {
      const pack = validateUpstreamDataPack(cached.pokemon, cached.event);
      applyUpstreamDataPack(pack, "cached", cached.checkedAt);
      if (now - cached.checkedAt < refreshInterval) return currentStatus;
    }
  } catch (cause) {
    console.warn(
      "[Pokémon Sleep Tool Extension] Cached data was ignored",
      cause,
    );
  }
  try {
    const [pokemon, event] = await Promise.all([
      fetchJson("pokemon.json"),
      fetchJson("event.json"),
    ]);
    const pack = validateUpstreamDataPack(pokemon, event);
    const value: CachedUpstreamDataPack = { checkedAt: now, pokemon, event };
    await chrome.storage.local.set({ [cacheKey]: value });
    return applyUpstreamDataPack(pack, "network", now);
  } catch (cause) {
    console.warn(
      "[Pokémon Sleep Tool Extension] Latest upstream data was unavailable; bundled data remains active",
      cause,
    );
    return currentStatus;
  }
}
