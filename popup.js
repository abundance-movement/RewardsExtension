let getUsersAPI = 'http://localhost:4000/api/users/facebookIds'
let jwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1zYWZ5YW4xMDAwQGdtYWlsLmNvbSIsInN1YiI6Miwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzIwMTk0Mzk1LCJleHAiOjE3MjI3ODYzOTV9.DXUTC4B4_B-sQPynyqvzcyckP7LxGy2ZvvPzvCjdA1DtWxpheU-31jWZoP0yqFuDgj3yB6a7BSPurJpGTL31xHo9j8EtqAd0m1fjHMNenhOZVuzxXOt2hZMp6GHHycjAkPAXGxH2isGhKzs9loCLaEU1uqZSP5A6v2gKZvV0HcVGtU3p5XkYUf1DI8B6dV-j8TIWL1NtE3LUDVKNmmT_todhmKuuOd7Ki_aEo3B-2bWn1BCwfKfpqv0ThWDfUyGodYQXJbVkAh2KpVrVgzt3x1I-aCxTuK0403PPpZis983jlBKSPQu33WF3zIdf3zPVE5hOd1heFKxvlhd9VIBizQ'; 
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