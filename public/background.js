let latestRequest;
const sourceBase =
  "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data";

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
    fetchJson("pokemon.json"),
    fetchJson("event.json"),
  ])
    .then(([pokemon, event]) => ({ ok: true, pokemon, event }))
    .catch(() => ({ ok: false }))
    .finally(() => {
      latestRequest = undefined;
    });
  latestRequest.then(sendResponse);
  return true;
});
