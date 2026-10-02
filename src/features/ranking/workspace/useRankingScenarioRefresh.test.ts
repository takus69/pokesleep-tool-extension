// @vitest-environment jsdom
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "../../../integration/upstreamDataPack";
import {
  acceptUpstreamDataRefresh,
  initializeUpstreamDataRefresh,
} from "../../../integration/upstreamDataRefreshState";
import event from "../../../vendor/upstream-data/event.json";
import pokemon from "../../../vendor/upstream-data/pokemon.json";
import type { RankingScenarioResult } from "../domain/RankingScenario";
import useRankingScenario from "./useRankingScenario";

const { calculate } = vi.hoisted(() => ({ calculate: vi.fn() }));
vi.mock("../domain/RankingScenario", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../domain/RankingScenario")>()),
  calculateRankingScenarioAsync: calculate,
}));

it("retains a running result, marks it stale after data changes, and uses the new revision on explicit recalculation", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const baseline = validateUpstreamDataPack(pokemon, event);
  applyUpstreamDataPack(baseline, "bundled", 0);
  initializeUpstreamDataRefresh(baseline);
  let finish: (result: RankingScenarioResult) => void = () => {};
  calculate.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let ranking: ReturnType<typeof useRankingScenario>;
  const current = () => ranking;
  const storage = { read: () => null, write: vi.fn() };
  const environment = createStrengthParameter({});
  function Harness() {
    ranking = useRankingScenario(storage, environment, null);
    return null;
  }
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(createElement(Harness)));
    let run: Promise<void> = Promise.resolve();
    await act(async () => {
      run = ranking.calculate();
    });
    const changed = structuredClone(pokemon);
    changed[0].frequency += 1;
    await act(async () =>
      acceptUpstreamDataRefresh(validateUpstreamDataPack(changed, event), 1),
    );
    expect(current().snapshot?.dataRevision).toBe(0);
    expect(current().dataStale).toBe(false);
    const result: RankingScenarioResult = {
      entries: [],
      groups: [],
      exclusions: [],
    };
    await act(async () => {
      finish(result);
      await run;
    });
    expect(current().status).toBe("complete");
    expect(current().result).toBe(result);
    expect(current().dataStale).toBe(true);
    expect(calculate).toHaveBeenCalledTimes(1);
    await act(async () => {
      run = ranking.calculate();
    });
    expect(current().snapshot?.dataRevision).toBe(1);
    await act(async () => {
      finish(result);
      await run;
    });
    expect(current().stale).toBe(false);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
