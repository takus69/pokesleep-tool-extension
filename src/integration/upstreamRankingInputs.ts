import { getInitialIvState } from "@upstream/ui/IvCalc/IvState";
import PokemonBox from "@upstream/util/PokemonBox";
import { loadStrengthParameter } from "@upstream/util/StrengthParameter";
import { isUpstreamEventSupported } from "./upstreamDataPack";

export interface UpstreamRankingInputs {
  state: ReturnType<typeof getInitialIvState>;
  environmentKey: string;
  rawEvent: string | null;
  unsupportedEvent: string | null;
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
export function loadUpstreamRankingInputs(): UpstreamRankingInputs {
  const state = getInitialIvState();
  const box = new PokemonBox();
  box.load();
  const rawEnvironment = readRawRankingEnvironment(
    window.localStorage.getItem("PstStrenghParam"),
  );
  return {
    state: { ...state, parameter: loadStrengthParameter(), box },
    ...rawEnvironment,
    unsupportedEvent: isUpstreamEventSupported(rawEnvironment.rawEvent)
      ? null
      : rawEnvironment.rawEvent,
  };
}
