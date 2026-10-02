import pokemons from "@upstream/data/pokemons";
import { beforeEach, describe, expect, it, vi } from "vitest";
import event from "../vendor/upstream-data/event.json";
import pokemon from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";
import {
  acceptUpstreamDataRefresh,
  getUpstreamDataRefreshState,
  initializeUpstreamDataRefresh,
  retainUpstreamCalculationData,
  subscribeUpstreamDataRefresh,
} from "./upstreamDataRefreshState";

function changedPack() {
  const changed = structuredClone(pokemon);
  changed[0].frequency += 1;
  return validateUpstreamDataPack(changed, event);
}
beforeEach(() => {
  const pack = validateUpstreamDataPack(pokemon, event);
  applyUpstreamDataPack(pack, "bundled", 0);
  initializeUpstreamDataRefresh(pack);
});
describe("data refresh application", () => {
  it("does not invalidate results for unchanged data or reordered object keys", () => {
    const reordered = pokemon.map((item) =>
      Object.fromEntries(Object.entries(item).reverse()),
    );
    acceptUpstreamDataRefresh(validateUpstreamDataPack(reordered, event), 1);
    expect(getUpstreamDataRefreshState()).toEqual({
      phase: "unchanged",
      revision: 0,
    });
  });
  it("applies changed values and notifies mounted workspaces", () => {
    const notify = vi.fn();
    const unsubscribe = subscribeUpstreamDataRefresh(notify);
    acceptUpstreamDataRefresh(changedPack(), 1);
    expect(pokemons[0].frequency).toBe(pokemon[0].frequency + 1);
    expect(getUpstreamDataRefreshState()).toEqual({
      phase: "updated",
      revision: 1,
    });
    expect(notify).toHaveBeenCalledOnce();
    unsubscribe();
  });
  it("keeps data fixed until every active calculation finishes, including cancelled runs", () => {
    const finish = retainUpstreamCalculationData();
    const finishOther = retainUpstreamCalculationData();
    acceptUpstreamDataRefresh(changedPack(), 1);
    expect(getUpstreamDataRefreshState().phase).toBe("pending");
    expect(pokemons[0].frequency).toBe(pokemon[0].frequency);
    finish();
    finish();
    expect(getUpstreamDataRefreshState().revision).toBe(0);
    finishOther();
    expect(getUpstreamDataRefreshState().revision).toBe(1);
    expect(pokemons[0].frequency).toBe(pokemon[0].frequency + 1);
  });
});
