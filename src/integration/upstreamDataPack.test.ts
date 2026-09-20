import PokemonIv from "@upstream/util/PokemonIv";
import { beforeEach, describe, expect, it } from "vitest";
import eventJson from "../vendor/upstream-data/event.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

describe("upstream data pack", () => {
  let baseline: ReturnType<typeof validateUpstreamDataPack>;

  beforeEach(() => {
    baseline = validateUpstreamDataPack(pokemonJson, eventJson);
    applyUpstreamDataPack(baseline, "bundled", 0);
  });

  it("accepts and applies the synchronized upstream data", () => {
    expect(baseline.issues).toContainEqual({
      kind: "pokemon",
      name: "Mewtwo",
      reason: "unsupported main skill",
    });
    expect(baseline.issues).toHaveLength(1);
    expect(baseline.pokemon).toHaveLength(pokemonJson.length - 1);
  });

  it("accepts a new Pokémon using only supported mechanics", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Future Test Pokemon",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);
    applyUpstreamDataPack(pack, "network", 1);

    expect(pack.pokemon.at(-1)?.name).toBe("Future Test Pokemon");
    expect(new PokemonIv({ pokemonName: next.name }).pokemon.name).toBe(
      next.name,
    );
  });

  it("excludes only a Pokémon that requires an unknown mechanic", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Unsupported Test Pokemon",
      skill: "Future Skill",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);

    expect(pack.pokemon.some((pokemon) => pokemon.name === next.name)).toBe(
      false,
    );
    expect(pack.issues).toContainEqual({
      kind: "pokemon",
      name: next.name,
      reason: "unsupported main skill",
    });
  });

  it("rejects a truncated pack instead of replacing known data", () => {
    expect(() => validateUpstreamDataPack([], eventJson)).toThrow(
      "missing or truncated",
    );
  });
});
