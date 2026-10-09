import { describe, expect, it } from "vitest";
import { validateUpstreamPokemonNames } from "./upstreamPokemonNames";

describe("upstream Pokémon name JSON contract", () => {
  it("accepts official dictionaries for each supported language and known names", () => {
    expect(
      validateUpstreamPokemonNames(
        {
          en: { pokemons: { Foongus: "Foongus" } },
          ja: { pokemons: { Foongus: "タマゲタケ", Amoonguss: "モロバレル" } },
          ko: { pokemons: { Foongus: "깜놀버슬" } },
          "zh-CN": { pokemons: { Foongus: "哎呀球菇" } },
          "zh-TW": { pokemons: { Foongus: "哎呀球菇" } },
          fr: { pokemons: { Foongus: "Trompignon" } },
        },
        ["Foongus"],
      ),
    ).toEqual({
      en: { pokemons: { Foongus: "Foongus" } },
      ja: { pokemons: { Foongus: "タマゲタケ" } },
      ko: { pokemons: { Foongus: "깜놀버슬" } },
      "zh-CN": { pokemons: { Foongus: "哎呀球菇" } },
      "zh-TW": { pokemons: { Foongus: "哎呀球菇" } },
    });
  });

  it.each([
    null,
    [],
    "invalid",
    { ja: null },
    { ja: { pokemons: [] } },
  ])("ignores invalid shapes: %j", (value) =>
    expect(validateUpstreamPokemonNames(value, ["Foongus"])).toEqual({}));

  it.each([
    "",
    " ",
    1,
    null,
    "x".repeat(201),
    "<b>name</b>",
    "{{name}}",
    "$t(other)",
    "name\n",
  ])("rejects non-plain name values: %j", (value) => {
    expect(
      validateUpstreamPokemonNames(
        { ja: { pokemons: { Foongus: value, Amoonguss: "モロバレル" } } },
        ["Foongus", "Amoonguss"],
      ),
    ).toEqual({ ja: { pokemons: { Amoonguss: "モロバレル" } } });
  });
});
