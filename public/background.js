const refreshSessionKey = "upstream-data-refresh-claimed.v1";
let refreshClaim;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "claim-upstream-data-refresh") return;
  refreshClaim ??= (async () => {
    const stored = await chrome.storage.session.get(refreshSessionKey);
    if (stored[refreshSessionKey] === true) return false;
    await chrome.storage.session.set({ [refreshSessionKey]: true });
    return true;
  })();
  refreshClaim
    .then((shouldRefresh) => sendResponse({ shouldRefresh }))
    .catch(() => sendResponse({ shouldRefresh: false }));
  return true;
});
