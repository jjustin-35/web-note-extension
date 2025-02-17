import { MAIN_WEB } from "./config";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  if (!tab?.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin === MAIN_WEB) {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: true,
    });
  }
});
