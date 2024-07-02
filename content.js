window.addEventListener('load', function() {
  console.log('Page fully loaded. Running content script.');
  
  chrome.storage.local.get(['flag'], (result) => {
    if (window.location.href.includes("https://www.facebook.com/groups/135513406222343/") && result.flag === 1) {
      setTimeout(findText, 1000);
    }
  });
});

function findText() {
  let node = document.evaluate('/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[1]/div[1]/div[2]/div/div/div/div[3]/div/div/div/div[1]/div/div/div/div/div/span/div/div/span/span', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  if (!node) {
    node = document.evaluate('/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[3]/div[2]/div[1]/div[1]/div[2]/div/div/div/div[3]/div/div/div/div[1]/div/div/div/div/div/span/div/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  if (node) {
    console.log(`Extracted text for ID:`, node.innerText);
    alert(node.innerText);
    
    chrome.storage.local.get(['ids'], (result) => {
      const ids = result.ids || [];
      if (ids.length > 0) {
        navigateAndExtract(ids);
      }
    });

    chrome.storage.local.set({ flag: 0 }, () => {
      console.log("flag saved");
    });
  }
}

function navigateAndExtract(ids) {
  if (ids.length === 0) return;

  const id = ids.shift();
  const url = `https://www.facebook.com/groups/135513406222343/user/${id}`;

  document.location.href = url;

  chrome.storage.local.set({ flag: 1 }, () => {
    console.log("flag saved");
  });
  
  chrome.storage.local.set({ ids }, () => {
    console.log("ids saved");
  });

  setTimeout(() => navigateAndExtract(ids), 2000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    chrome.storage.local.get(['ids'], (result) => {
      const ids = result.ids || [];
      if (ids.length > 0) {
        navigateAndExtract(ids);
      }
    });
  }
});
