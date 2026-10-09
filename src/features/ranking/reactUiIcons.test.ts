// @vitest-environment jsdom
import React, { act } from "react";
import { expect, it, vi } from "vitest";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "../../integration/upstreamDataPack";
import {
  acceptUpstreamDataRefresh,
  initializeUpstreamDataRefresh,
} from "../../integration/upstreamDataRefreshState";
import event from "../../vendor/upstream-data/event.json";
import pokemon from "../../vendor/upstream-data/pokemon.json";

vi.hoisted(() => {
  window.matchMedia = () => ({ matches: true }) as MediaQueryList;
});
vi.mock("../../integration/upstreamRankingTabController", () => ({
  createUpstreamRankingTabController: () => ({
    dispose: () => {},
    openCalculationSettings: async () => true,
  }),
}));
vi.mock("./workspace/RankingWorkspace", async () => {
  const { PokemonIcon } = await import("./upstreamUi");
  return {
    default: () =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(PokemonIcon, {
          idForm: 590,
          shiny: false,
          size: 36,
        }),
        React.createElement(PokemonIcon, {
          idForm: 590,
          shiny: true,
          size: 36,
        }),
      ),
  };
});

import { mountRankingWorkspace } from "./reactUi";

it("refreshes memoized normal and shiny icons in the mounted workspace", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const baseline = validateUpstreamDataPack(pokemon, event);
  applyUpstreamDataPack(baseline, "bundled", 0);
  initializeUpstreamDataRefresh(baseline);
  document.body.innerHTML = '<div id="root"></div><div id="ranking"></div>';
  const host = document.getElementById("ranking") as HTMLElement;
  let dispose = () => {};
  try {
    await act(async () => {
      dispose = mountRankingWorkspace(
        { hostElement: host, mountPoint: host },
        { read: () => null, write: () => {} },
      );
    });
    expect(host.querySelectorAll("svg")).toHaveLength(2);
    const icon = {
      rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
      normalPallet: ["#123456"],
      shinyPallet: ["#abcdef"],
    };
    await act(async () =>
      acceptUpstreamDataRefresh(
        validateUpstreamDataPack(pokemon, event, undefined, { 590: icon }),
        1,
      ),
    );
    expect(
      Array.from(host.querySelectorAll("svg rect"), (rect) =>
        rect.getAttribute("fill"),
      ),
    ).toEqual(["#123456", "#abcdef"]);
  } finally {
    await act(async () => dispose());
    applyUpstreamDataPack(baseline, "bundled", 0);
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  }
});
