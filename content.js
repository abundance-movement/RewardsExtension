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
    //alert(node.innerText);
    chrome.storage.local.get(['pointsData'], (result) => {
      let pointsData = JSON.parse(JSON.stringify(result.pointsData));
      pointsData[pointsData.length-1].points = parsePoints(node.innerText);
      chrome.storage.local.set({ pointsData }, async () => { });
     
    });
    chrome.storage.local.get(['users'], (result) => {
      console.log(result.users);
      const users = result.users || [];
      if (users.length > 0) {
        navigateAndExtract(JSON.stringify(users));
      }
      else{
        chrome.storage.local.get(['pointsData'], (result) => {
        console.log(result);
        let pointsData = JSON.parse(JSON.stringify(result.pointsData));
        console.log("Points----"+JSON.stringify(pointsData));
        });
      }
    });

    chrome.storage.local.set({ flag: 0 }, () => {
      console.log("flag saved");
    });
  }
}

function navigateAndExtract(users) {
  users = JSON.parse(users);
  if (users.length === 0) return;

  const user = users.shift();
  console.log(user);

  chrome.storage.local.get(['pointsData'], (result) => {
    
    let pointsData = [];

    pointsData = JSON.parse(JSON.stringify(result.pointsData));
    
    const newpoints = {userId : user.userId , points : 0}

    pointsData.push(newpoints)

    chrome.storage.local.set({ pointsData }, async () => {
    
    const url = `https://www.facebook.com/groups/135513406222343/user/${user.fbuserId}`;
      
    document.location.href = url;
      
    chrome.storage.local.set({ flag: 1 }, () => {
      console.log("flag saved");
    });
    
    chrome.storage.local.set({ users }, () => {
      console.log("users");
    });
       });
   
  });
  

  //setTimeout(() => navigateAndExtract(users), 2000);
}

function parsePoints(str) {
  
  const cleanedString = str.replace(/[^0-9.]/g, '');
  const number = parseFloat(cleanedString);
  if (isNaN(number)) {
    return 0;
  }

  return number;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    chrome.storage.local.get(['data'], (result) => {
      console.log(result.data)
      const ids = result.ids || [];
      if (ids.length > 0) {
        navigateAndExtract(ids);
      }
    });
  }
});
