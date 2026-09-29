import {
  createRankingScenarioSettings,
  normalizeRankingScenarioConfig,
  type RankingScenarioSettings,
  rankingScenarioPurposes,
  serializeRankingScenarioConfig,
} from "./RankingScenarioState";

export interface RankingScenarioStorage {
  read(): string | null;
  write(value: string): void;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isPurpose(
  value: unknown,
): value is RankingScenarioSettings["purpose"] {
  return rankingScenarioPurposes.some((purpose) => purpose === value);
}

export function decodeRankingScenarioSettings(
  serialized: string | null,
): RankingScenarioSettings {
  const result = createRankingScenarioSettings();
  if (serialized === null) return result;
  try {
    const stored = record(JSON.parse(serialized));
    if (stored.version !== 1) return result;
    result.purpose = isPurpose(stored.purpose) ? stored.purpose : "traits";
    const configs = record(stored.configs);
    for (const purpose of rankingScenarioPurposes)
      result.configs[purpose] = normalizeRankingScenarioConfig(
        purpose,
        configs[purpose],
      );
  } catch {
    // Invalid data falls back to a complete set of safe defaults.
  }
  return result;
}

export function encodeRankingScenarioSettings(
  settings: RankingScenarioSettings,
): string {
  return JSON.stringify({
    version: 1,
    purpose: settings.purpose,
    configs: Object.fromEntries(
      rankingScenarioPurposes.map((purpose) => [
        purpose,
        JSON.parse(
          serializeRankingScenarioConfig(settings.configs[purpose]),
        ) as unknown,
      ]),
    ),
  });
}

export function loadRankingScenarioSettings(
  storage: RankingScenarioStorage,
): RankingScenarioSettings {
  try {
    return decodeRankingScenarioSettings(storage.read());
  } catch {
    return createRankingScenarioSettings();
  }
}

export function saveRankingScenarioSettings(
  storage: RankingScenarioStorage,
  settings: RankingScenarioSettings,
): void {
  try {
    storage.write(encodeRankingScenarioSettings(settings));
  } catch {
    // Keep the in-memory settings usable when storage is unavailable or full.
  }
}
