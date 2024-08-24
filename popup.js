let getUsersAPI = 'http://api.sub.abundancemovement.io/api/users/facebookIds'
let postUserPointsAPI = 'http://api.sub.abundancemovement.io/api/engagements/points/update-points'
let jwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1zYWZ5YW4xMDAwQGdtYWlsLmNvbSIsInN1YiI6MSwicm9sZSI6ImFkbWluIiwicGVyc29uYWxpdHlUeXBlIjoiRU5FUkdJWkVSIiwiaWF0IjoxNzI0NDk0NzE0LCJleHAiOjE3MjUwMTMxMTR9.MaH_1mzIpf8LFuxRH0e7Au4XL7mALIU0TmhVxxd7W3cGk4EEaVmsVgaBMlVT-RmThbDZzUWpo4HoZYAF1xagy_QvabYHttUcopN9U5YEIP_oMnRf0ajnkL8S9Gx4X6m1lByHv0RfoTOKcjhUlsY3NW-U5bk9xevqIiABTmGbx0D4H1fJ5rqTcu15yf5fgsTYSRc1Y5t0Om9v331nPTCw_92HeVpgaqN2t1EFCZ1TCacSpxblOc3a9Q0_fmdZLGlA1DLMaYFE70GWfbIv2oBToW9F8ELr27cZSs46bsFinCijVLZQ-AmNXdypKp0cJG_WtqbWmD8hl55LYkIibmgaeA'; 

document.getElementById('start-button').addEventListener('click', () => {
    const ids = fetchData();
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
  function fetchData() {
  const apiUrl = getUsersAPI;
  fetch(apiUrl,
    {
      method : "GET",
      headers :{
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    }
  )
    .then(response => response.json())
    .then(data => {
     data = JSON.stringify(data.data);
     console.log(data);
     
    chrome.storage.local.set({ data }, async () => {
      const tabId = await getCurrentTabId();
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: startProcess
      });
    });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}
  function startProcess() {
    chrome.storage.local.get(['data'], (result) => {
      console.log(result);
      const users = result.data || [];
      if (users.length > 0) {
        let pointsData = [];
        chrome.storage.local.set({ pointsData }, async () => {
        });
        navigateAndExtract(users);
      }
    });
  }
  
  function postData(data) {
    fetch(postUserPointsAPI, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      //body: JSON.stringify(data)
      body: data
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(responseData => {
      console.log('Data posted successfully:', responseData);
    })
    .catch(error => {
      console.error('Error posting data:', error);
    });
  }

  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.action === "postData") {
  //     postData(message.pointsData)
  //     sendResponse({status: "Function called"});
  //   }
  //   if (message.action === "test") {
  //     //postData(message.pointsData)
  //     sendResponse({status: "TEST Function called"});
  //   }
  // });
  