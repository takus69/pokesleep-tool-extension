// @vitest-environment jsdom

import {
  applyStateToParameter,
  createDefaultState,
} from "@upstream/ui/IvCalc/Panel/FrequencyInfoState";
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import { describe, expect, it, vi } from "vitest";
import { rankingWorkspaceViewReducer } from "../features/ranking/application/RankingWorkspaceState";
import { loadUpstreamRankingInputs } from "./upstreamRankingInputs";

describe("pinned upstream frequency dialog boundary", () => {
  it("keeps shared-condition preview actions out of upstream storage", () => {
    localStorage.clear();
    const initial = loadUpstreamRankingInputs().state;
    const state = { ...initial, parameter: createStrengthParameter({}) };
    const before = { ...localStorage };
    const write = vi.spyOn(Storage.prototype, "setItem");
    const previous = createDefaultState();
    let currentState = state;

    applyStateToParameter(
      state.parameter,
      previous,
      { ...previous, campTicket: true, helpingBonus: 2 },
      (action) => {
        currentState = rankingWorkspaceViewReducer(currentState, action);
      },
    );

    expect(currentState).toBe(state);
    expect({ ...localStorage }).toEqual(before);
    expect(write).not.toHaveBeenCalled();
    write.mockRestore();
  });
});
