document.getElementById('start-button').addEventListener('click', () => {
    const ids = document.getElementById('id-list').value.split('\n').map(id => id.trim()).filter(id => id);
  
    chrome.storage.local.set({ ids }, async () => {
        const tabId = await getCurrentTabId();
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: startProcess
        });
      });
  });
  
  function getCurrentTabId() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length === 0) {
          reject('No active tab found');
        } else {
          resolve(tabs[0].id);
        }
      });
    });
  }
  
  function startProcess() {
    chrome.storage.local.get(['ids'], (result) => {
      const ids = result.ids || [];
      if (ids.length > 0) {
        navigateAndExtract(ids);
      }
    });
  }