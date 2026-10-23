import { findUpstreamRankingSlot } from "./upstreamRankingSlot";

export type MobileStorageStatus =
  | "missing"
  | "present-json-shape"
  | "invalid-json-shape"
  | "unavailable";

export interface MobileCompatibilityReport {
  readonly page: "supported" | "unsupported";
  readonly root: "present" | "missing";
  readonly upperTabs: "present" | "missing";
  readonly storage: Readonly<Record<string, MobileStorageStatus>>;
}

export interface MobileProbeEnvironment {
  readonly url: URL;
  readonly document: Document;
  readonly readStorage: (key: string) => string | null;
}

const storageShapes = [
  ["box", "PstPokeBox", "strings"],
  ["environment", "PstStrenghParam", "object"],
  ["iv", "PstIvState", "object"],
  ["boxSort", "PstPokemonBoxParam", "object"],
] as const;

/** Only JSON shape is checked; no raw values or exception messages escape. */
function storageStatus(
  readStorage: MobileProbeEnvironment["readStorage"],
  key: string,
  shape: "strings" | "object",
): MobileStorageStatus {
  let raw: string | null;
  try {
    raw = readStorage(key);
  } catch {
    return "unavailable";
  }
  if (raw === null) return "missing";
  try {
    const parsed: unknown = JSON.parse(raw);
    const matches =
      shape === "strings"
        ? Array.isArray(parsed) &&
          parsed.every((value) => typeof value === "string")
        : typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed);
    return matches ? "present-json-shape" : "invalid-json-shape";
  } catch {
    return "invalid-json-shape";
  }
}

/** Read-only diagnostic, separate from the authoritative upstream decoders. */
export function inspectMobileCompatibility({
  url,
  document,
  readStorage,
}: MobileProbeEnvironment): MobileCompatibilityReport {
  if (
    url.origin !== "https://nitoyon.github.io" ||
    !url.pathname.startsWith("/pokesleep-tool/")
  ) {
    return {
      page: "unsupported",
      root: "missing",
      upperTabs: "missing",
      storage: {},
    };
  }
  const root = document.getElementById("root");
  return {
    page: "supported",
    root: root === null ? "missing" : "present",
    upperTabs:
      root !== null && findUpstreamRankingSlot(root) !== null
        ? "present"
        : "missing",
    storage: Object.fromEntries(
      storageShapes.map(([label, key, shape]) => [
        label,
        storageStatus(readStorage, key, shape),
      ]),
    ),
  };
}

export function canStartMobileRanking(
  report: MobileCompatibilityReport,
): boolean {
  return (
    report.page === "supported" &&
    report.root === "present" &&
    report.upperTabs === "present" &&
    Object.values(report.storage).every(
      (status) => status === "missing" || status === "present-json-shape",
    )
  );
}

export function formatMobileCompatibility(
  report: MobileCompatibilityReport,
): string {
  return [
    "Mobile PoC #58",
    `page: ${report.page}`,
    `root: ${report.root}`,
    `upperTabs: ${report.upperTabs}`,
    ...Object.entries(report.storage).map(
      ([label, status]) => `storage.${label}: ${status}`,
    ),
    "Ranking compatibility and CSP are not confirmed by this probe.",
  ].join("\n");
}
