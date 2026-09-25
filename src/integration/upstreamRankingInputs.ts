import { getInitialIvState } from "@upstream/ui/IvCalc/IvState";
import PokemonBox from "@upstream/util/PokemonBox";
import { loadBoxSortConfig } from "@upstream/util/PokemonBoxSort";
import PokemonIv from "@upstream/util/PokemonIv";
import { loadStrengthParameter } from "@upstream/util/StrengthParameter";
import { isUpstreamEventSupported } from "./upstreamDataPack";

export interface UpstreamRankingInputs {
  state: ReturnType<typeof getInitialIvState>;
  environmentKey: string;
  rawEvent: string | null;
  unsupportedEvent: string | null;
  boxSortConfig: ReturnType<typeof loadBoxSortConfig>;
  ivStorageRaw: string | null;
}

export function readUpstreamIvStorageRaw(): string | null {
  return window.localStorage.getItem("PstIvState");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stableValue(item)]),
  );
}

export function readRawRankingEnvironment(
  raw: string | null,
): Pick<UpstreamRankingInputs, "environmentKey" | "rawEvent"> {
  if (raw === null) return { environmentKey: "{}", rawEvent: null };
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    throw new TypeError("PstStrenghParam must be an object");
  const object = parsed as Record<string, unknown>;
  const environment = { ...object };
  delete environment.level;
  delete environment.evolved;
  delete environment.maxSkillLevel;
  return {
    environmentKey: JSON.stringify(stableValue(environment)),
    rawEvent: typeof object.event === "string" ? object.event : null,
  };
}

/** Load a fresh, read-only snapshot from the upstream tool's own storage. */
export function loadUpstreamRankingInputs(
  preferStoredIv = false,
): UpstreamRankingInputs {
  const state = getInitialIvState();
  const ivStorageRaw = readUpstreamIvStorageRaw();
  // Upstream applies the shared URL hash on every getInitialIvState() call.
  // Once native UI has saved an IV, its storage value is authoritative.
  if (preferStoredIv) {
    const cache: unknown =
      ivStorageRaw === null ? null : JSON.parse(ivStorageRaw);
    if (typeof cache === "object" && cache !== null && !Array.isArray(cache)) {
      const savedIv = (cache as Record<string, unknown>).iv;
      if (typeof savedIv === "string" && savedIv !== "") {
        state.pokemonIv = PokemonIv.deserialize(savedIv);
      }
    }
  }
  const box = new PokemonBox();
  box.load();
  const rawEnvironment = readRawRankingEnvironment(
    window.localStorage.getItem("PstStrenghParam"),
  );
  return {
    state: { ...state, parameter: loadStrengthParameter(), box },
    boxSortConfig: loadBoxSortConfig(),
    ivStorageRaw,
    ...rawEnvironment,
    unsupportedEvent: isUpstreamEventSupported(rawEnvironment.rawEvent)
      ? null
      : rawEnvironment.rawEvent,
  };
}
