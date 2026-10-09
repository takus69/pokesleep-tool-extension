export const upstreamLanguages = ["en", "ja", "ko", "zh-CN", "zh-TW"] as const;
export type UpstreamLanguage = (typeof upstreamLanguages)[number];
export type UpstreamPokemonNames = Partial<
  Record<UpstreamLanguage, { pokemons: Record<string, string> }>
>;

function object(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Accept names as plain text, never translation expressions or executable data. */
export function validateUpstreamPokemonNames(
  value: unknown,
  pokemonNames: readonly string[],
): UpstreamPokemonNames {
  const source = object(value);
  const result: UpstreamPokemonNames = {};
  if (source === null) return result;
  for (const language of upstreamLanguages) {
    const names = object(object(source[language])?.pokemons);
    if (names === null) continue;
    const entries = pokemonNames.flatMap((name) => {
      if (!Object.hasOwn(names, name)) return [];
      const text = names[name];
      if (
        typeof text !== "string" ||
        text.trim().length === 0 ||
        text.length > 200 ||
        Array.from(text).some(
          (char) => char.charCodeAt(0) < 32 || char === "\u007f",
        ) ||
        /[<>]|\{\{|\}\}|\$t\(/.test(text)
      )
        return [];
      return [[name, text] as const];
    });
    if (entries.length > 0)
      result[language] = { pokemons: Object.fromEntries(entries) };
  }
  return result;
}
