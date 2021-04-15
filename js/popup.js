// popup.js
console.log("popup.js running");

// variables
const active_tab_details = {};
let currentFolderId = 1;
// flags to check status
let creatingFolder = false;













document.addEventListener('DOMContentLoaded', function() {
  // var login = document.getElementById('login-btn');

  // if (login) {
  //   login.addEventListener('click', () => {
  //     fetch("http://localhost:3000/users/auth/google_oauth2", {
  //       method: 'POST'
  //     }).then(res => {
  //       console.log(11111, res)
  //     })
  //   })
  // }

  // get folders when popup is clicked
  getFolders();
  generateTitleForm();


  const folderSelect = document.getElementById('select-folders');
  folderSelect.addEventListener('change', (folder)=>{
    showNewFolderForm(folder);
  });



  // save the tab to database
  const addTab = document.getElementById('add-tab-btn');
  addTab.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true}, currentTabs => {

    // data returns an array of current open tabs. URL in tab object
      console.log("current tabs", currentTabs);

      // adds folder
      if(creatingFolder){
        console.log("creating folder: ", creatingFolder);
        const newFolder = {};
        newFolder.name = document.getElementById('create-folder').value;
        newFolder.user_id = 4;
        const confirmedNewFolder = apiPost(newFolder, "new folder");

        // allFoldersData = apiFetch("folders.json");
        confirmedNewFolder.then(data=>{
          // call the addNewTab() function
          const newFolderId = data.folder.id
          console.log('inside confirmed new folder,new id:', newFolderId)
          addNewTab(currentTabs, newFolderId);
        });
      }else{
        // add tab to folders
        console.log('create tab on existing folder')
        addNewTab(currentTabs, currentFolderId);
      }

    });
  }, false);




}, false);



const addNewTab = (currentTabs, currentFolderId) => {
  console.log('inside addNewTab function')
  const active_tab_details = {};
  currentTabs.forEach((tab) => {
    if(tab.active === true){
      active_tab_details.title = document.getElementById('create-title-form').value;
      active_tab_details.url = tab.url;
      active_tab_details.iconUrl = tab.favIconUrl;
      active_tab_details.folder_id = currentFolderId
      apiPost(active_tab_details, "new tab");
    }
  });
}

//generic api post
apiPost = (out_data, item) => {
  return new Promise ((resolve, reject) => {
    // console.log("out data deets", out_data);
    let attachUrl = "";
    let body = {};

    // create tabs or folders?
    if(item === "new tab"){
      body = { tab: out_data };
      attachUrl = `${out_data.folder_id}/tabs`;
    }
    if(item === "new folder"){
      body = { folder: out_data };
      attachUrl = "";
    }

    // fetch("https://httpbin.org/post", {
    fetch(`http://localhost:3000/folders/${attachUrl}?format=json`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then((data) => {
        console.log("post return", data); // Look at local_names.default
        resolve(data);
      });
  });
}


apiFetch = (fetchUrl) => {
  return new Promise ((resolve, reject) => {
    fetch(`http://localhost:3000/${fetchUrl}`)
    // fetch(`http://www.omdbapi.com/?s=matrix&apikey=adf1f2d7`)
    .then(response => response.json())
    .then((data)=>{
      console.log("api fetch response:", data);
      resolve(data);
    });
  });
}

getFolders=()=>{
  console.log("getting folders");
  let allFoldersData = apiFetch("folders.json");
  allFoldersData.then(data => {
    data.forEach((folderData) => {
    //lists all folders from db
      let folderOption = document.createElement("option");
      folderOption.innerHTML = folderData.name

      folderOption.value = folderData.id;
      if (folderData.id !== 1) document.getElementById("select-folders").appendChild(folderOption);
    });
  });
}


showNewFolderForm = (folder) => {

    // create a new folder
    if (folder.target.value === 'new-folder'){
      document.getElementById("new-folder-form").removeAttribute("class");
      creatingFolder = true;
    }else{
      document.getElementById("new-folder-form").setAttribute("class", "hidden");
      creatingFolder = false;
    }

    // attach ID
    currentFolderId = folder.target.value;
    console.log("current folder id: ", currentFolderId);
}

generateTitleForm = () =>{
  chrome.tabs.query({currentWindow: true}, currentTabs => {
    currentTabs.forEach((tab) => {
      if(tab.active === true){
        document.getElementById('create-title-form').setAttribute("value", tab.title);
      }
    });
  });
}


