import fs from "node:fs";
import icons from "@upstream/ui/IvCalc/PokemonIconData";
import PokemonIv from "@upstream/util/PokemonIv";
import { afterEach, expect, it } from "vitest";
import pokemon from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamPokemonIcons,
  decodeUpstreamPokemonIconSource,
  validateUpstreamPokemonIcons,
} from "./upstreamPokemonIcons";

const source = fs.readFileSync(
  "vendor/pokesleep-tool/src/ui/IvCalc/PokemonIconData.ts",
  "utf8",
);
afterEach(() => applyUpstreamPokemonIcons({}));

it("decodes the pinned source as data, including both new Pokémon and forms", () => {
  const parsed = decodeUpstreamPokemonIconSource(source);
  const validated = validateUpstreamPokemonIcons(
    parsed,
    pokemon as Parameters<typeof validateUpstreamPokemonIcons>[1],
  );
  expect(validated[590]).toEqual(icons[590]);
  expect(validated[591]).toEqual(icons[591]);
  expect(Object.keys(validated).length).toBeGreaterThan(100);
  expect(validated[25 + (1 << 12)]).toEqual(icons[25 + (1 << 12)]);
  for (const item of pokemon) {
    const idForm = new PokemonIv({ pokemonName: item.name }).idForm;
    const id = icons[idForm] ? idForm : item.id;
    if (icons[id]) expect(validated[id], item.name).toEqual(icons[id]);
  }
});

it("rejects executable syntax without running it", () => {
  for (const malicious of [
    source.replace(
      '"1": {',
      '"1": (() => { throw new Error("executed"); })(), "2": {',
    ),
    source.replace("x: 0,", "x: globalThis.compromised = 1,"),
    "export default fetch('https://example.com')",
    "x".repeat(500_001),
  ])
    expect(decodeUpstreamPokemonIconSource(malicious)).toEqual({});
});

it("rejects invalid palettes, geometry and unrecognized ids while preserving valid icons", () => {
  const valid = icons[590];
  for (const invalid of [
    { ...valid, normalPallet: ["url(https://example.com)"] },
    { ...valid, rects: [{ x: NaN, y: 0, w: 1, h: 1, color: 0 }] },
    { ...valid, rects: [{ x: 0, y: 0, w: 1, h: 1, color: 999 }] },
  ]) {
    const result = validateUpstreamPokemonIcons(
      { 590: invalid, 591: icons[591], 9999: valid },
      [
        { id: 590, form: undefined },
        { id: 591, form: undefined },
      ],
    );
    expect(Object.keys(result)).toEqual(["591"]);
  }
});

it("updates the shared UI table and restores bundled fallback on reset", () => {
  const original = icons[590];
  const changed = {
    ...original,
    normalPallet: original.normalPallet.map(() => "#123456"),
  };
  applyUpstreamPokemonIcons({ 590: changed });
  expect(icons[590]).toEqual(changed);
  applyUpstreamPokemonIcons({});
  expect(icons[590]).toEqual(original);
});
