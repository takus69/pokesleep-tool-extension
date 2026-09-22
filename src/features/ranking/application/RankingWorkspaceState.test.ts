// @vitest-environment jsdom

import PokemonBox from "@upstream/util/PokemonBox";
import PokemonIv from "@upstream/util/PokemonIv";
import {
  createStrengthParameter,
  saveStrengthParameter,
} from "@upstream/util/StrengthParameter";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadUpstreamRankingInputs } from "../../../integration/upstreamRankingInputs";
import {
  preserveRankingIndividualSettings,
  rankingWorkspaceViewReducer,
} from "./RankingWorkspaceState";

const environmentKey = "PstStrenghParam";
const individualKey = "PstIvState";
const boxKey = "PstPokeBox";
const unrelatedKey = "PstUnrelatedFutureState";

function storageSnapshot(): Record<string, string> {
  return Object.fromEntries(
    Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )
      .filter((key): key is string => key !== null)
      .map((key) => [key, localStorage.getItem(key) ?? ""]),
  );
}

function changedKeys(before: Record<string, string>): string[] {
  const after = storageSnapshot();
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => before[key] !== after[key])
    .sort();
}

function seededState() {
  saveStrengthParameter(createStrengthParameter({ fieldBonus: 10 }));
  const box = new PokemonBox();
  box.add(new PokemonIv({ pokemonName: "Venusaur" }), "saved");
  box.save();
  localStorage.setItem(unrelatedKey, "untouched");
  return loadUpstreamRankingInputs().state;
}

describe("ranking shared-storage contract with the pinned upstream tool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("reads shared conditions and box without writing any page storage", () => {
    const state = seededState();
    const before = storageSnapshot();
    const write = vi.spyOn(Storage.prototype, "setItem");

    const latest = loadUpstreamRankingInputs();
    const synchronized = rankingWorkspaceViewReducer(state, {
      type: "syncUpstream",
      payload: latest.state,
    });

    expect(synchronized.box.items[0]?.nickname).toBe("saved");
    expect(synchronized.parameter.fieldBonus).toBe(10);
    expect(changedKeys(before)).toEqual([]);
    expect(write).not.toHaveBeenCalled();
  });

  it("writes only the shared environment for an explicit condition change", () => {
    const state = seededState();
    const before = storageSnapshot();
    const write = vi.spyOn(Storage.prototype, "setItem");

    const next = rankingWorkspaceViewReducer(state, {
      type: "changeParameter",
      payload: {
        parameter: { ...state.parameter, fieldBonus: 35 },
      },
    });

    expect(next.parameter.fieldBonus).toBe(35);
    expect(changedKeys(before)).toEqual([environmentKey]);
    expect(write.mock.calls.map(([key]) => key)).toEqual([environmentKey]);
    expect(localStorage.getItem(boxKey)).toBe(before[boxKey]);
    expect(localStorage.getItem(unrelatedKey)).toBe(before[unrelatedKey]);
  });

  it("writes only the working individual when editing a comparison", () => {
    const state = seededState();
    const before = storageSnapshot();
    const write = vi.spyOn(Storage.prototype, "setItem");
    const iv = new PokemonIv({ pokemonName: "Pikachu", level: 37 });

    const next = rankingWorkspaceViewReducer(state, {
      type: "updateIv",
      payload: { iv },
    });

    expect(next.pokemonIv.pokemonName).toBe("Pikachu");
    expect(changedKeys(before)).toEqual([individualKey]);
    expect(write.mock.calls.map(([key]) => key)).toEqual([individualKey]);
    expect(localStorage.getItem(boxKey)).toBe(before[boxKey]);
    expect(localStorage.getItem(environmentKey)).toBe(before[environmentKey]);
  });

  it("writes only the working-state tab index when switching the comparison dialog tab", () => {
    const state = seededState();
    const before = storageSnapshot();
    const write = vi.spyOn(Storage.prototype, "setItem");

    const next = rankingWorkspaceViewReducer(state, {
      type: "changeLowerTab",
      payload: { index: 1 },
    });

    expect(next.lowerTabIndex).toBe(1);
    expect(changedKeys(before)).toEqual([individualKey]);
    expect(write.mock.calls.map(([key]) => key)).toEqual([individualKey]);
    expect(localStorage.getItem(boxKey)).toBe(before[boxKey]);
  });

  it("selects a box comparison without writing or editing the box", () => {
    const state = seededState();
    const item = state.box.items[0];
    const before = storageSnapshot();
    const write = vi.spyOn(Storage.prototype, "setItem");

    const next = rankingWorkspaceViewReducer(state, {
      type: "selectComparison",
      payload: { id: item.id },
    });

    expect(next.pokemonIv).toBe(item.iv);
    expect(next.selectedItemId).toBe(item.id);
    expect(changedKeys(before)).toEqual([]);
    expect(write).not.toHaveBeenCalled();
  });

  it("tracks the pinned upstream storage schemas used at this boundary", () => {
    const state = seededState();
    rankingWorkspaceViewReducer(state, {
      type: "updateIv",
      payload: { iv: state.pokemonIv },
    });

    const individual = JSON.parse(
      localStorage.getItem(individualKey) ?? "null",
    );
    expect(Object.keys(individual).sort()).toEqual([
      "iv",
      "lowerTabIndex",
      "selectedIv",
      "tabIndex",
    ]);
    expect(typeof individual.iv).toBe("string");
    expect(typeof individual.selectedIv).toBe("string");
    const environment = JSON.parse(
      localStorage.getItem(environmentKey) ?? "null",
    );
    expect(Object.keys(environment).sort()).toEqual([
      "addHelpingBonusEffect",
      "berryBurstTeam",
      "customEventBonus",
      "e4eCount",
      "e4eEnergy",
      "event",
      "evolved",
      "expertEffect",
      "favoriteType",
      "fieldBonus",
      "fieldIndex",
      "helpBonusCount",
      "helperBoostLevel",
      "helperBoostSpecies",
      "isEnergyAlwaysFull",
      "isGoodCampTicketSet",
      "latiTwins",
      "level",
      "maxSkillLevel",
      "period",
      "pityProc",
      "recipeBonus",
      "recipeLevel",
      "recoveryBonusCount",
      "sleepScore",
      "tapFrequencyAsleep",
      "tapFrequencyAwake",
      "teamMember",
      "totalFlags",
    ]);
    expect(Object.keys(environment.customEventBonus.effects).sort()).toEqual([
      "berry",
      "berryBurst",
      "bigBerry",
      "carryLimitAdd",
      "carryLimitMul",
      "dish",
      "dreamShard",
      "energyFromDish",
      "fixedAreas",
      "fixedBerries",
      "globalCarryLimitAdd",
      "ingredient",
      "ingredientDraw",
      "ingredientMagnet",
      "potSize",
      "skillIngredient",
      "skillLevel",
      "skillTrigger",
    ]);
    const box = JSON.parse(localStorage.getItem(boxKey) ?? "null");
    expect(box).toEqual([state.box.items[0].serialize()]);
  });

  it("keeps shared levels out of an individual edit's parameter action", () => {
    const state = seededState();
    const action = preserveRankingIndividualSettings(
      {
        type: "changeParameter",
        payload: {
          parameter: {
            ...state.parameter,
            level: 100,
            evolved: true,
            maxSkillLevel: true,
          },
        },
      },
      state.parameter,
    );

    expect(action.type).toBe("changeParameter");
    if (action.type !== "changeParameter") throw new Error("wrong action");
    expect(action.payload.parameter.level).toBe(state.parameter.level);
    expect(action.payload.parameter.evolved).toBe(state.parameter.evolved);
    expect(action.payload.parameter.maxSkillLevel).toBe(
      state.parameter.maxSkillLevel,
    );
  });
});
