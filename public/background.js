let latestRequest;
const sourceBase =
  "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src";

async function fetchJson(file) {
  const response = await fetch(`${sourceBase}/${file}`, {
    cache: "no-cache",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return response.json();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "fetch-latest-upstream-data") return;
  if (sender.id !== chrome.runtime.id || !sender.url) return;
  const url = new URL(sender.url);
  if (
    url.origin !== "https://nitoyon.github.io" ||
    !url.pathname.startsWith("/pokesleep-tool/")
  )
    return;
  latestRequest ??= Promise.all([
    fetchJson("data/pokemon.json"),
    fetchJson("data/event.json"),
    Promise.all(
      ["en", "ja", "ko", "zh-CN", "zh-TW"].map(async (language) => {
        try {
          return [language, await fetchJson(`i18n/${language}/pokemons.json`)];
        } catch {
          return [language, null];
        }
      }),
    ).then(Object.fromEntries),
  ])
    .then(([pokemon, event, pokemonNames]) => ({
      ok: true,
      pokemon,
      event,
      pokemonNames,
    }))
    .catch(() => ({ ok: false }))
    .finally(() => {
      latestRequest = undefined;
    });
  latestRequest.then(sendResponse);
  return true;
});
