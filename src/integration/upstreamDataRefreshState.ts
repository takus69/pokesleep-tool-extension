import {
  applyUpstreamDataPack,
  type ValidatedUpstreamDataPack,
} from "./upstreamDataPack";

export interface UpstreamDataRefreshState {
  phase: "idle" | "checking" | "unchanged" | "updated" | "pending" | "failed";
  revision: number;
}
let state: UpstreamDataRefreshState = { phase: "idle", revision: 0 };
const listeners = new Set<() => void>();
let activeCalculations = 0;
let pending: (() => void) | null = null;
let fingerprint = "";

export const getUpstreamDataRefreshState = () => state;
export function subscribeUpstreamDataRefresh(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function setUpstreamDataRefreshPhase(
  phase: UpstreamDataRefreshState["phase"],
): void {
  state = { ...state, phase };
  for (const listener of listeners) listener();
}
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stable(item)]),
  );
}
/** Initial data is loaded before any workspace or calculation exists. */
export function initializeUpstreamDataRefresh(
  pack: ValidatedUpstreamDataPack,
): void {
  fingerprint = JSON.stringify(stable(pack));
  state = { phase: "idle", revision: 0 };
  pending = null;
}
export function acceptUpstreamDataRefresh(
  pack: ValidatedUpstreamDataPack,
  checkedAt: number,
): void {
  const next = JSON.stringify(stable(pack));
  if (next === fingerprint) {
    setUpstreamDataRefreshPhase("unchanged");
    return;
  }
  const apply = () => {
    applyUpstreamDataPack(pack, "network", checkedAt);
    fingerprint = next;
    state = { phase: "updated", revision: state.revision + 1 };
    for (const listener of listeners) listener();
  };
  if (activeCalculations > 0) {
    pending = apply;
    setUpstreamDataRefreshPhase("pending");
  } else apply();
}
/** Keep upstream singleton arrays fixed across an asynchronous ranking run. */
export function retainUpstreamCalculationData(): () => void {
  activeCalculations += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeCalculations -= 1;
    if (activeCalculations === 0 && pending) {
      const apply = pending;
      pending = null;
      apply();
    }
  };
}
