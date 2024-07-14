let getUsersAPI = 'http://api.sub.abundancemovement.io/api/users/facebookIds'
let postUserPointsAPI = 'http://api.sub.abundancemovement.io/api/engagements/points/update-points'
let jwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1zYWZ5YW4xMDAwQGdtYWlsLmNvbSIsInN1YiI6MSwicm9sZSI6ImFkbWluIiwicGVyc29uYWxpdHlUeXBlIjoiSU5TUElSQVRPUiIsImlhdCI6MTcyMDk0MDY3MiwiZXhwIjoxNzIzNTMyNjcyfQ.RHNIeyRaL2BreUlsa_1iB7OiRn52J5KfymP-04hyCRlqPt4PZyUPd-bwQZ45H1I-O4FRNDGWLnuId-URf9TTaMY5qKkrM-TUySGMi3o9LjwuRfRiR5f7A3_yujlLAJxjOL6rzZFDAtgY7PUgjJAjBy7zxGCh-wXFACZO6P56p9i9AnSQVhUyBIuPbYeBDnACiMJhE-JlooV1yrW5p9Ns6gvK8qeFO-mzf4icXLNffSDaKzqfWa0Hout8IoW7ktp8sFYOYOzuab2plajDMK0liT5aHkTqmwfeNeLCC__1bme623aW1WRYpDEv8DEnRDZnIXQNvUnOdZj2WYis4aZ8Rg'; 

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
    fetch('http://api.sub.abundancemovement.io/api/engagements/points/update-points', {
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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "postData") {
      postData(message.pointsData)
      sendResponse({status: "Function called"});
    }
  });
  