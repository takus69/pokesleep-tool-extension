import type { PokemonData } from "@upstream/data/pokemons";
import bundledIcons from "@upstream/ui/IvCalc/PokemonIconData";
import PokemonIv from "@upstream/util/PokemonIv";

export type UpstreamPokemonIcons = typeof bundledIcons;
const originalIcons = { ...bundledIcons };

/** Decode only the upstream object literal; never execute downloaded source. */
export function decodeUpstreamPokemonIconSource(source: unknown): unknown {
  if (typeof source !== "string" || source.length > 500_000) return {};
  const match = source.match(
    /const pokemonRectData: \{ \[id: string\]: IconData \} = (\{[\s\S]*\});\s*export default pokemonRectData;\s*$/,
  );
  if (!match) return {};
  try {
    return JSON.parse(
      match[1]
        .replace(/\/\/[^\r\n]*/g, "")
        .replace(
          /\b(rects|normalPallet|shinyPallet|x|y|w|h|r|color)\s*:/g,
          '"$1":',
        )
        .replace(/,\s*([}\]])/g, "$1"),
    );
  } catch {
    return {};
  }
}

export function validateUpstreamPokemonIcons(
  value: unknown,
  pokemon: readonly Pick<PokemonData, "id" | "form">[],
): UpstreamPokemonIcons {
  const result: UpstreamPokemonIcons = {};
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return result;
  const ids = pokemon.flatMap((item) => {
    const form =
      Array.from({ length: 12 }, (_, index) => index).find(
        (index) => PokemonIv.formToString(index) === (item.form ?? ""),
      ) ?? 0;
    return [item.id, item.id + (form << 12)];
  });
  for (const id of new Set(ids)) {
    const icon = (value as UpstreamPokemonIcons)[id];
    if (!icon || typeof icon !== "object") continue;
    const palettes = [icon.normalPallet, icon.shinyPallet];
    if (
      !palettes.every(
        (palette) =>
          Array.isArray(palette) &&
          palette.length > 0 &&
          palette.length <= 64 &&
          palette.every(
            (color) =>
              typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
          ),
      ) ||
      !Array.isArray(icon.rects) ||
      icon.rects.length === 0 ||
      icon.rects.length > 128 ||
      !icon.rects.every(
        (rect) =>
          rect !== null &&
          typeof rect === "object" &&
          [rect.x, rect.y].every(
            (n) =>
              typeof n === "number" && Number.isFinite(n) && n >= -2 && n <= 2,
          ) &&
          [rect.w, rect.h, rect.r === undefined ? 0 : rect.r].every(
            (n) =>
              typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 2,
          ) &&
          Number.isInteger(rect.color) &&
          rect.color >= 0 &&
          palettes.every((palette) => rect.color < palette.length),
      )
    )
      continue;
    result[id] = {
      normalPallet: [...icon.normalPallet],
      shinyPallet: [...icon.shinyPallet],
      rects: icon.rects.map(({ x, y, w, h, r, color }) => ({
        x,
        y,
        w,
        h,
        ...(r === undefined ? {} : { r }),
        color,
      })),
    };
  }
  return result;
}

/** Shared official UI components all consume this in-memory icon table. */
export function applyUpstreamPokemonIcons(icons: UpstreamPokemonIcons): void {
  for (const key of Object.keys(bundledIcons)) delete bundledIcons[key];
  Object.assign(bundledIcons, originalIcons);
  Object.assign(bundledIcons, icons);
}
