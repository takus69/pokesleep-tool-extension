// @vitest-environment jsdom

import type { PokemonBoxItem } from "@upstream/util/PokemonBox";
import PokemonBox from "@upstream/util/PokemonBox";
import {
  loadBoxSortConfig,
  sortPokemonItems,
} from "@upstream/util/PokemonBoxSort";
import PokemonIv from "@upstream/util/PokemonIv";
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import { beforeEach, describe, expect, it } from "vitest";
import { orderUpstreamBoxItems } from "./upstreamBoxOrdering";

const t = ((key: string) => key) as typeof import("i18next").default.t;

describe("upstream box ordering", () => {
  beforeEach(() => localStorage.clear());

  it.each([
    "level",
    "name",
    "pokedexno",
    "rp",
    "berry",
    "total strength",
    "ingredient",
    "skill",
  ] as const)("matches BoxView's %s ordering in both directions", (sort) => {
    const box = new PokemonBox();
    box.add(new PokemonIv({ pokemonName: "Venusaur", level: 30 }), "z");
    box.add(new PokemonIv({ pokemonName: "Pikachu", level: 10 }), "a");
    const parameter = createStrengthParameter({});
    for (const descending of [true, false]) {
      const config = { ...loadBoxSortConfig(), sort, descending };
      const [sorted, message] = sortPokemonItems(
        box.items,
        config.sort,
        descending,
        config.ingredient,
        config.mainSkill,
        parameter,
        t,
      );
      const expected = descending ? sorted : [...sorted].reverse();
      expect(orderUpstreamBoxItems(box.items, config, parameter, t)).toEqual({
        ok: true,
        items: expected,
        emptyMessage: message,
      });
    }
  });

  it("uses the upstream malformed-config fallback without writing storage", () => {
    localStorage.setItem("PstPokemonBoxParam", "{");
    const before = { ...localStorage };
    expect(loadBoxSortConfig().sort).toBe("level");
    expect(
      orderUpstreamBoxItems(
        [],
        loadBoxSortConfig(),
        createStrengthParameter({}),
        t,
      ),
    ).toEqual({
      ok: true,
      items: [],
      emptyMessage: "box is empty",
    });
    expect({ ...localStorage }).toEqual(before);
  });

  it("does not return a guessed order when upstream sorting fails", () => {
    const invalidItem = { id: 1, iv: null } as unknown as PokemonBoxItem;
    expect(
      orderUpstreamBoxItems(
        [invalidItem, { id: 2, iv: null } as unknown as PokemonBoxItem],
        loadBoxSortConfig(),
        createStrengthParameter({}),
        t,
      ),
    ).toEqual({
      ok: false,
      message: "ranking.scenario.reason calculationFailed",
    });
  });
});
