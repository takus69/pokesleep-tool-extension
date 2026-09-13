// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import PokemonBox from "../../../pokesleep-tool/src/util/PokemonBox";
import PokemonIv from "../../../pokesleep-tool/src/util/PokemonIv";
import {
  createStrengthParameter,
  saveStrengthParameter,
} from "../../../pokesleep-tool/src/util/StrengthParameter";
import {
  loadUpstreamRankingInputs,
  readRawRankingEnvironment,
} from "./upstreamRankingInputs";

describe("loadUpstreamRankingInputs", () => {
  beforeEach(() => localStorage.clear());

  it("reads fresh upstream environment and box snapshots without writing", () => {
    saveStrengthParameter(createStrengthParameter({ fieldBonus: 10 }));
    const firstBox = new PokemonBox();
    firstBox.add(new PokemonIv({ pokemonName: "Venusaur" }), "first");
    firstBox.save();

    const first = loadUpstreamRankingInputs();
    expect(first.state.parameter.fieldBonus).toBe(10);
    expect(first.state.box.items[0]?.nickname).toBe("first");

    saveStrengthParameter(createStrengthParameter({ fieldBonus: 25 }));
    const secondBox = new PokemonBox();
    secondBox.add(new PokemonIv({ pokemonName: "Pikachu" }), "latest");
    secondBox.save();
    const before = { ...localStorage };

    const second = loadUpstreamRankingInputs();

    expect(second.state.parameter.fieldBonus).toBe(25);
    expect(second.state.box.items).toHaveLength(1);
    expect(second.state.box.items[0]?.nickname).toBe("latest");
    expect({ ...localStorage }).toEqual(before);
  });

  it("fails closed for malformed upstream box data", () => {
    localStorage.setItem("PstPokeBox", "{");
    expect(() => loadUpstreamRankingInputs()).toThrow();
  });

  it("fingerprints unknown events without ranking-only overrides", () => {
    const first = readRawRankingEnvironment(
      JSON.stringify({ event: "future-event", level: 10, fieldIndex: 1 }),
    );
    const second = readRawRankingEnvironment(
      JSON.stringify({ fieldIndex: 1, level: 100, event: "future-event" }),
    );

    expect(first).toEqual(second);
    expect(first.rawEvent).toBe("future-event");
  });

  it("reports an event that the active calculation data does not know", () => {
    localStorage.setItem(
      "PstStrenghParam",
      JSON.stringify({ event: "future-event" }),
    );

    expect(loadUpstreamRankingInputs().unsupportedEvent).toBe("future-event");
  });
});
