chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        sendResponse({ success: false });
        return;
      }

      chrome.tabs.captureVisibleTab(
        tabs[0].windowId,
        { format: 'png' },
        (dataUrl) => {
          if (chrome.runtime.lastError || !dataUrl) {
            sendResponse({ success: false });
            return;
          }

          chrome.storage.local.get({ images: [] }, (data) => {
            data.images.push({
              dataUrl,
              url: tabs[0].url || '',
              timestamp: new Date().toISOString(),
            });
            chrome.storage.local.set({ images: data.images }, () => {
              sendResponse({ success: true });
            });
          });
        },
      );
    });

    return true;
  }
});
