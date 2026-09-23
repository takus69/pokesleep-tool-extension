// @vitest-environment jsdom

import PokemonIv from "@upstream/util/PokemonIv";
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import React from "react";
import { renderToString } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  window.matchMedia = () => ({ matches: true }) as MediaQueryList;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import {
  i18n,
  RatingView,
  RpView,
  StrengthBerryIngSkillView,
} from "../upstreamUi";
import {
  createRankingPreviewState,
  rankingPreviewReducer,
} from "./RankingDetailPreviewState";

function storageSnapshot(): Record<string, string> {
  return Object.fromEntries(
    Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )
      .filter((key): key is string => key !== null)
      .map((key) => [key, localStorage.getItem(key) ?? ""]),
  );
}

describe("ranking detail preview contract with upstream UI", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("PstPokeBox", "saved box sentinel");
    localStorage.setItem("PstIvState", "saved individual sentinel");
    localStorage.setItem("PstStrenghParam", "saved environment sentinel");
  });

  it("isolates upstream preview state and ignores box-changing actions", () => {
    const before = storageSnapshot();
    const iv = new PokemonIv({ pokemonName: "Venusaur", level: 30 });
    const environment = createStrengthParameter({ fieldBonus: 10 });
    const state = createRankingPreviewState(iv, environment);

    expect(state.pokemonIv).not.toBe(iv);
    expect(state.parameter).not.toBe(environment);
    expect(state.box.items).toEqual([]);
    expect(state.selectedItemId).toBe(-1);
    expect(
      rankingPreviewReducer(state, { type: "addThis", payload: { iv } }),
    ).toBe(state);
    expect(
      rankingPreviewReducer(state, { type: "remove", payload: { id: 1 } }),
    ).toBe(state);
    expect(
      rankingPreviewReducer(state, { type: "openEnergyDialog" })
        .energyDialogOpen,
    ).toBe(true);
    expect(
      rankingPreviewReducer(state, {
        type: "changeParameter",
        payload: { parameter: createStrengthParameter({ fieldBonus: 20 }) },
      }).parameter.fieldBonus,
    ).toBe(20);
    expect(storageSnapshot()).toEqual(before);
  });

  it("renders all three pinned upstream detail views without saving", () => {
    const before = storageSnapshot();
    const iv = new PokemonIv({ pokemonName: "Venusaur", level: 30 });
    const environment = createStrengthParameter({});
    const state = createRankingPreviewState(iv, environment);
    const dispatch = () => {};
    const views = [
      React.createElement(RpView, { state, width: 640 }),
      React.createElement(StrengthBerryIngSkillView, {
        pokemonIv: state.pokemonIv,
        settings: state.parameter,
        energyDialogOpen: state.energyDialogOpen,
        dispatch,
      }),
      React.createElement(RatingView, {
        pokemonIv: state.pokemonIv,
        width: 640,
      }),
    ];

    for (const view of views) {
      const markup = renderToString(
        React.createElement(I18nextProvider, { i18n }, view),
      );
      expect(markup.length).toBeGreaterThan(100);
    }
    expect(storageSnapshot()).toEqual(before);
  });
});
