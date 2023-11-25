const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Function to add an element from input box to the list container
function addElementFromInput() {
    const element = inputBox.value.trim();

    if (element !== "") {
        const listItem = createListItem(element);
        listContainer.appendChild(listItem);
        inputBox.value = ""; // Clear the input box after adding the element
        saveListContainer();
    } else {
        Swal.fire({
            title: "Error",
            text: "Please enter something to add to the list",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
        });
    }
}

// Function to create a list item with the given text
function createListItem(text) {
    const listItem = document.createElement("li");
    listItem.innerHTML = text;

    const crossButton = document.createElement("cross-button");
    crossButton.innerHTML = "\u00d7"; // Unicode value for a cross
    crossButton.classList.add("cross-button"); // Add a class for styling
    listItem.appendChild(crossButton); // Append the button to the li


    return listItem;
}

// Function to handle click events on list items and cross buttons
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
                event.target.parentElement.remove();
                saveListContainer();
            }
        });
    } else if (event.target.tagName === "LI") {
        event.target.classList.toggle("checked");
        saveListContainer();
    }
}

// Add event listener
listContainer.addEventListener("click", handleElementClick);

// Function to save the list container
function saveListContainer() {
    const listItems = Array.from(listContainer.getElementsByTagName("li"));
    const list = listItems.map((listItem) => {
        const isChecked = listItem.classList.contains("checked");
        const text = listItem.innerHTML;
        return { text, checked: isChecked };
    });

    // Save the list to local storage or send it to the server
    localStorage.setItem("todoList", JSON.stringify(list));
}

// Function to load the list container from local storage or from the server with checked marks
function loadListContainer() {
    const list = JSON.parse(localStorage.getItem("todoList"));

    if (list) {
        list.forEach((listItem) => {
            const { text, checked } = listItem;
            const li = createListItem(text);
            if (checked) {
                li.classList.add("checked");
            }
            listContainer.appendChild(li);
        });
    }
}

loadListContainer();

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
        loadListContainer();
    };

    reader.readAsText(file);
}

// Add event listeners to your download and upload buttons
document.querySelector('#downloadButton').addEventListener('click', downloadTodoList);
document.querySelector('#uploadInput').addEventListener('change', uploadTodoList);

document.addEventListener('click', function (event) {
    if (event.target.matches('.tag-button')) {
        const listItem = event.target.closest('li');
        const tag = event.target.textContent;

        listItem.remove(); // Remove the list item from its current location

        // Add the list item to the corresponding container
        if (tag === 'Today') {
            document.querySelector('#todayTasks').appendChild(listItem);
        } else if (tag === 'Pending') {
            document.querySelector('#pendingTasks').appendChild(listItem);
        } else if (tag === 'Complete') {
            document.querySelector('#completeTasks').appendChild(listItem);
        }
    }
}, false);