import PokemonIv from "@upstream/util/PokemonIv";
import PokemonStrength, {
  createStrengthParameter,
} from "@upstream/util/PokemonStrength";
import { beforeEach, describe, expect, it } from "vitest";
import eventJson from "../vendor/upstream-data/event.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

describe("upstream data pack", () => {
  let baseline: ReturnType<typeof validateUpstreamDataPack>;

  beforeEach(() => {
    baseline = validateUpstreamDataPack(pokemonJson, eventJson);
    applyUpstreamDataPack(baseline, "bundled", 0);
  });

  it("accepts and applies the synchronized upstream data", () => {
    expect(baseline.issues).toEqual([]);
    expect(baseline.pokemon).toHaveLength(pokemonJson.length);
    expect(baseline.pokemon.some((pokemon) => pokemon.name === "Mewtwo")).toBe(
      true,
    );
    expect(
      baseline.bonus.filter((event) => event.name.startsWith("pursue mewtwo")),
    ).toHaveLength(2);
  });

  it("uses upstream big-berry and skill calculations for the new event", () => {
    const iv = new PokemonIv({ pokemonName: "Mewtwo", level: 60 });
    const ordinary = new PokemonStrength(
      iv,
      createStrengthParameter({ event: "none" }),
    ).calculate();
    const event = new PokemonStrength(
      iv,
      createStrengthParameter({ event: "pursue mewtwo 2nd week" }),
    ).calculate();

    expect(event.bigBerryStrength).toBeGreaterThan(0);
    expect(event.berryTotalStrength).toBe(
      event.berryStrength + event.bigBerryStrength,
    );
    expect(event.totalStrength).toBeGreaterThan(ordinary.totalStrength);
  });

  it("accepts a new Pokémon using only supported mechanics", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Future Test Pokemon",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);
    applyUpstreamDataPack(pack, "network", 1);

    expect(pack.pokemon.at(-1)?.name).toBe("Future Test Pokemon");
    expect(new PokemonIv({ pokemonName: next.name }).pokemon.name).toBe(
      next.name,
    );
  });

  it("excludes only a Pokémon that requires an unknown mechanic", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Unsupported Test Pokemon",
      skill: "Future Skill",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);

    expect(pack.pokemon.some((pokemon) => pokemon.name === next.name)).toBe(
      false,
    );
    expect(pack.issues).toContainEqual({
      kind: "pokemon",
      name: next.name,
      reason: "unsupported main skill",
    });
  });

  it("excludes only an event with an unknown big-berry mechanic", () => {
    const future = structuredClone(eventJson.bonus[0]);
    future.name = "Future Big Berry";
    future.effects.bigBerry = "future-event";
    const pack = validateUpstreamDataPack(pokemonJson, {
      ...eventJson,
      bonus: [...eventJson.bonus, future],
    });

    expect(pack.bonus.some((event) => event.name === future.name)).toBe(false);
    expect(pack.issues).toContainEqual({
      kind: "event",
      name: future.name,
      reason: "unsupported big berry event",
    });
    expect(pack.bonus).toHaveLength(eventJson.bonus.length);
  });

  it("rejects a truncated pack instead of replacing known data", () => {
    expect(() => validateUpstreamDataPack([], eventJson)).toThrow(
      "missing or truncated",
    );
  });
});
