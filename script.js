// Get the input box, list containers, and initialize the listMain array
const inputBox = document.getElementById("input-box");
const listData = document.getElementById("list-container");
const todayData = document.getElementById("today-container");
const pendingData = document.getElementById("pending-container");
const completedData = document.getElementById("completed-container");
let listMain = [];

// Function to add an element from the input box to the list
function addElementFromInput() {
    const inputText = inputBox.value.trim();

    if (inputText !== "") {
        // Create a new element object with the input text and default tags
        const element = {
            text: inputText,
            tags: {
                today: true,
                pending: false,
                completed: false
            }
        };
        // Add the element to the listMain array
        listMain.push(element);
        // Create a list item element for the element and append it to the list containers
        const listItem = createListItem(element, listMain.length - 1);
        appendListItemToContainer(listItem, element.tags);
        listData.appendChild(listItem.cloneNode(true));
        // Clear the input box and update the list items in the containers
        inputBox.value = "";
        updateListItemInContainers(listItem);
        // Save the list data to local storage
        saveListData();
    } else {
        // Show an error message if the input is empty
        Swal.fire({
            title: "Error",
            text: "Please enter something to add to the list",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
        });
    }
}

// Function to create tag elements for a list item
function createTagElements(listItem, index) {
    const tags = JSON.parse(listItem.dataset.tags);

    for (let tag in tags) {
        if (!tags[tag]) {
            // Create a tag element for each tag that is not set to true
            const tagElement = document.createElement("span");
            tagElement.textContent = "move to " + tag;
            tagElement.classList.add("tag");
            tagElement.classList.add(`tag-${tag}`);
            updateTags(listMain, listData);
            // Add a click event listener to update the tags and list item data
            tagElement.addEventListener("click", function () {
                for (let tagKey in tags) {
                    tags[tagKey] = false;
                }
                tags[tag] = true;
                listItem.dataset.tags = JSON.stringify(tags);
                // listItem.title = `Tags: ${JSON.stringify(tags)}`;
                listMain[index].tags = tags;
                updateListItemInContainers(listItem);
                saveListData();
            });
            listItem.appendChild(tagElement);
        }
    }
}

// Function to create a list item element for an element object
function createListItem(element, index) {
    const listItem = document.createElement("li");
    listItem.textContent = element.text;
    listItem.dataset.tags = JSON.stringify(element.tags);
    listItem.dataset.index = index;
    // listItem.title = `Tags: ${JSON.stringify(element.tags)}`;
    createTagElements(listItem, index);
    return listItem;
}

// Function to update the list item in the containers
function updateListItemInContainers(listItem) {
    listItem.remove();
    const tagElements = listItem.getElementsByClassName("tag");
    while (tagElements.length > 0) {
        tagElements[0].remove();
    }
    const index = parseInt(listItem.dataset.index, 10);
    createTagElements(listItem, index);
    const tags = JSON.parse(listItem.dataset.tags);
    appendListItemToContainer(listItem, tags);
}

// Function to update the tags in the list containers
function updateTags(listMain, listContainer) {
    listContainer.innerHTML = '';

    for (let i = 0; i < listMain.length; i++) {
        const item = listMain[i];
        const listItem = document.createElement("li");
        listItem.textContent = item.text;
        listItem.dataset.tags = JSON.stringify(item.tags);
        listItem.dataset.index = i;
        const tags = item.tags;

        for (let tag in tags) {
            if (tags[tag]) {
                const tagElement = document.createElement("span");
                tagElement.textContent = tag;
                tagElement.classList.add("tag");
                tagElement.classList.add(`tag-${tag}`);
                listItem.appendChild(tagElement);
            }
        }
        const crossButton = document.createElement("cross-button");
        crossButton.innerHTML = "\u00d7";
        crossButton.classList.add("cross-button");
        listItem.appendChild(crossButton);
        listContainer.appendChild(listItem);
    }
}

// Function to update the containers with the list data
function updateContainers() {
    todayData.innerHTML = '';
    pendingData.innerHTML = '';
    completedData.innerHTML = '';

    listMain.forEach((item, index) => {
        const { text, tags = {} } = item;
        const listItem = createListItem({ text, tags }, index);
        appendListItemToContainer(listItem, tags);
    });

    updateTags(listMain, listData);
}

// Event listener for handling element click events
function handleElementClick(event) {
    if (event.target.tagName === "CROSS-BUTTON") {
        // Show a confirmation dialog before deleting the item
        Swal.fire({
            title: "Confirmation",
            text: "Are you sure you want to delete this item?",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                // Get the index of the item and remove it from the listMain array
                const index = Array.from(listData.children).indexOf(event.target.parentElement);
                listMain.splice(index, 1);
                // Save the list data and reload the list
                saveListData();
                loadListData();
            }
        });
    }
    //  else if (event.target.tagName === "LI") {
    //     // Toggle the "checked" class of the list item and save the list data
    //     event.target.classList.toggle("checked");
    //     saveListData();
    // }
}

// Add the click event listener to the list container
listData.addEventListener("click", handleElementClick);

// Function to save the list data to local storage
function saveListData() {
    localStorage.setItem('todoList', JSON.stringify(listMain));
}

// Function to load the list data from local storage
function loadListData() {
    const data = JSON.parse(localStorage.getItem("todoList"));

    if (data) {
        listMain = [];
        listData.innerHTML = '';
        todayData.innerHTML = '';
        pendingData.innerHTML = '';
        completedData.innerHTML = '';

        data.forEach((dataItem) => {
            listMain.push(dataItem);
            const { text, tags = {} } = dataItem;
            const listItem = createListItem({ text, tags }, listMain.length - 1);
            appendListItemToContainer(listItem, tags);
        });

        updateTags(listMain, listData);
    }
}

// Load the list data when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadListData);

// Function to download the todo list as a JSON file
function downloadTodoList() {
    const data = localStorage.getItem("todoList");
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'todoList.json';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

// Function to upload a todo list from a JSON file
function uploadTodoList(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = event.target.result;
        const list = JSON.parse(data);
        localStorage.setItem("todoList", JSON.stringify(list));
        loadListData();
    };

    reader.readAsText(file);
}

// Add event listeners for the download and upload buttons
document.querySelector('#downloadButton').addEventListener('click', downloadTodoList);
document.querySelector('#uploadInput').addEventListener('change', uploadTodoList);

// Function to append a list item to the appropriate container based on its tags
function appendListItemToContainer(listItem, tags) {
    if (tags.today) {
        todayData.appendChild(listItem);
    } else if (tags.pending) {
        pendingData.appendChild(listItem);
    } else if (tags.completed) {
        completedData.appendChild(listItem);
    }
}

document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });