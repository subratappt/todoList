const inputBox = document.getElementById("input-box");
const listData = document.getElementById("list-container");
const todayData = document.getElementById("today-container");
const pendingData = document.getElementById("pending-container");
const completedData = document.getElementById("completed-container");
let listMain = [];

// Function to add an element from input box to the list container
function addElementFromInput() {
    const inputText = inputBox.value.trim();

    if (inputText !== "") {
        const element = {
            text: inputText,
            tags: {
                today: true,
                pending: false,
                completed: false
            }
        };
        listMain.push(element);
        const listItem = createListItem(element, listMain.length - 1);
        // Append the list item to the correct container based on its tags
        if (element.tags.today) {
            todayData.appendChild(listItem);
        } else if (element.tags.pending) {
            pendingData.appendChild(listItem);
        } else if (element.tags.completed) {
            completedData.appendChild(listItem);
        }
        // updateTags(listMain, listData);

        // listItem.tags.today = false; 
        listData.appendChild(listItem.cloneNode(true));
        inputBox.value = ""; // Clear the input box after adding the text
        updateListItemInContainers(listItem);
        saveListData();
    } else {
        Swal.fire({
            title: "Error",
            text: "Please enter something to add to the list",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
        });
    }
}

// Function to create the tag elements for a list item
function createTagElements(listItem, index) {
    // Parse the tags from the data-tags attribute
    const tags = JSON.parse(listItem.dataset.tags);


    // Create a span for each tag that is false
    for (let tag in tags) {
        if (!tags[tag]) {
            const tagElement = document.createElement("span");
            tagElement.textContent = "move to " + tag;
            tagElement.classList.add("tag");
            tagElement.classList.add(`tag-${tag}`);

            // Attach the event listener to the tag element
            tagElement.addEventListener("click", function () {
                // Set all tags to false
                for (let tagKey in tags) {
                    tags[tagKey] = false;
                }

                // Set the clicked tag to true
                tags[tag] = true;

                // Update the data-tags and title attributes
                listItem.dataset.tags = JSON.stringify(tags);
                listItem.title = `Tags: ${JSON.stringify(tags)}`;

                // Update the list item in the containers
                updateListItemInContainers(listItem);
                listMain[index].tags = tags;

                // Update the tags in the listData
                updateTags(listMain, listData);
                saveListData();

            });

            listItem.appendChild(tagElement);
        }
    }
}

// Function to create a list item with tags
function createListItem(element, index) {
    const listItem = document.createElement("li");
    listItem.textContent = element.text;
    listItem.dataset.tags = JSON.stringify(element.tags);
    listItem.dataset.index = index; // Store the index in a data attribute
    listItem.title = `Tags: ${JSON.stringify(element.tags)}`;

    // Create the tag elements for the list item
    createTagElements(listItem, index);



    return listItem;
}


// Function to update a list item in the containers
function updateListItemInContainers(listItem) {
    // Remove the list item from all containers
    listItem.remove();

    // Remove the existing tag elements
    const tagElements = listItem.getElementsByClassName("tag");
    while (tagElements.length > 0) {
        tagElements[0].remove();
    }

    // Create the tag elements for the list item
    const index = parseInt(listItem.dataset.index, 10);
    createTagElements(listItem, index);

    // Append the list item to the correct container based on its tags
    const tags = JSON.parse(listItem.dataset.tags);
    if (tags.today) {
        todayData.appendChild(listItem);
    } else if (tags.pending) {
        pendingData.appendChild(listItem);
    } else if (tags.completed) {
        completedData.appendChild(listItem);
    }


}

function updateTags(listMain, listContainer) {
    // Clear the listContainer of any existing tags
    listContainer.innerHTML = '';

    // Loop over each item in listMain
    for (let i = 0; i < listMain.length; i++) {
        const item = listMain[i];
        // Parse the tags from the tags property
        const listItem = document.createElement("li");
        listItem.textContent = item.text;
        listItem.dataset.tags = JSON.stringify(item.tags);
        listItem.dataset.index = i; // Store the index in a data attribute
        const tags = item.tags;

        // For each tag, create a span element if the tag value is false
        for (let tag in tags) {
            if (tags[tag]) {
                const tagElement = document.createElement("span");
                tagElement.textContent = tag;
                tagElement.classList.add("tag");
                tagElement.classList.add(`tag-${tag}`);

                // Append the span to the listContainer
                listItem.appendChild(tagElement);
            }
        }
        const crossButton = document.createElement("cross-button");
        crossButton.innerHTML = "\u00d7"; // Unicode value for a cross
        crossButton.classList.add("cross-button"); // Add a class for styling
        listItem.appendChild(crossButton); // Append the button to the li
        listContainer.appendChild(listItem);
    }
}

function updateContainers() {
    // Clear all containers
    todayData.innerHTML = '';
    pendingData.innerHTML = '';
    completedData.innerHTML = '';

    // Repopulate the containers based on the current state of listMain
    listMain.forEach((item, index) => {
        const { text, tags = {} } = item;
        const listItem = createListItem({ text, tags }, index);

        if (tags.today) {
            todayData.appendChild(listItem);
        } else if (tags.pending) {
            pendingData.appendChild(listItem);
        } else if (tags.completed) {
            completedData.appendChild(listItem);
        }
    });

    // Update the tags in listData
    updateTags(listMain, listData);
}

function handleElementClick(event) {
    if (event.target.tagName === "CROSS-BUTTON") {
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
                // Get the index of the list item element
                const index = Array.from(listData.children).indexOf(event.target.parentElement);

                // Remove the corresponding item from listMain
                listMain.splice(index, 1);

                // Update all containers
                // updateContainers();

                // Save the updated listMain to local storage
                saveListData();
                loadListData();
            }
        });
    } else if (event.target.tagName === "LI") {
        event.target.classList.toggle("checked");
        saveListData();
    }
}
// Add event listener
listData.addEventListener("click", handleElementClick);

// Function to save listMain to local storage
function saveListData() {
    localStorage.setItem('todoList', JSON.stringify(listMain));
}

function loadListData() {
    const data = JSON.parse(localStorage.getItem("todoList"));

    if (data) {
        // Clear listMain and listData
        listMain = [];
        listData.innerHTML = '';
        todayData.innerHTML = '';
        pendingData.innerHTML = '';
        completedData.innerHTML = '';

        data.forEach((dataItem) => {
            console.log(dataItem);
            // Add the data item to listMain
            listMain.push(dataItem);

            // Create a list item and append it to the correct container based on its tags
            const { text, tags = {} } = dataItem; // Set tags to an empty object if it's undefined
            const listItem = createListItem({ text, tags }, listMain.length - 1);

            if (dataItem.tags.today) {
                todayData.appendChild(listItem);
            } else if (dataItem.tags.pending) {
                pendingData.appendChild(listItem);
            } else if (dataItem.tags.completed) {
                completedData.appendChild(listItem);
            }
        });

        // Update the tags in the listData
        updateTags(listMain, listData);
    }
}




// Call loadListData when the page loads
document.addEventListener('DOMContentLoaded', loadListData);

// Function to download the todoList
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

// Function to upload the todoList
function uploadTodoList(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = event.target.result;
        const list = JSON.parse(data);
        localStorage.setItem("todoList", JSON.stringify(list));
        // You'll also need to update your list variable and re-render the list
        loadListData();
    };

    reader.readAsText(file);
}

// Add event listeners to your download and upload buttons
document.querySelector('#downloadButton').addEventListener('click', downloadTodoList);
document.querySelector('#uploadInput').addEventListener('change', uploadTodoList);