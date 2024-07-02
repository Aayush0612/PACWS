chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'output') {
    chrome.runtime.sendMessage({ action: 'output', data: message.data });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ scraperActive: true });
});
