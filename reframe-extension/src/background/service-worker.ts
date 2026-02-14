// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
      console.error('Failed to open side panel:', err);
    });
  }
});

// Clean up old frame sessions on extension startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    const { frameStorage } = await import('../shared/lib/storage');
    await frameStorage.clearOldSessions(7);
  } catch (_err) {
    // Ignore cleanup errors
  }
});
