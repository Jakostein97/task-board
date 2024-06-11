// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    let maxId = 0;
    if (taskList && taskList.length > 0) {
        taskList.forEach(task => {
            if (task.id > maxId) {
                maxId = task.id;
            }
        });
    }
    return maxId + 1;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // Create a new task card element
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');

    // Set task ID as a data attribute
    taskCard.setAttribute('data-id', task.id);

    // Create elements for task title, description, deadline, etc.
    const titleElement = document.createElement('h3');
    titleElement.textContent = task.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = task.description;

    const deadlineElement = document.createElement('p');
    deadlineElement.textContent = `Deadline: ${task.deadline}`;

    // Append elements to the task card
    taskCard.appendChild(titleElement);
    taskCard.appendChild(descriptionElement);
    taskCard.appendChild(deadlineElement);

    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // Retrieve tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Clear the existing task board content
    $('.task-board').empty();

    // Loop through each task and render it on the task board
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        $('.task-board').append(taskElement);

        // Make the task card draggable
        makeCardDraggable(taskElement);
    });
}

function createTaskElement(task) {
    const taskElement = $('<div>').addClass('task').text(task.title);

    // Apply color coding based on deadline status
    if (isTaskNearDeadline(task)) {
        taskElement.addClass('near-deadline');
    } else if (isTaskOverdue(task)) {
        taskElement.addClass('overdue');
    }

    return taskElement;
}

function makeCardDraggable(card) {
    card.draggable({
        revert: 'invalid',
        cursor: 'move',
        start: function (event, ui) {
            // Add any necessary logic when dragging starts
        },
        stop: function (event, ui) {
            // Add any necessary logic when dragging stops
        }
    });
}

// Call renderTaskList when the page loads
$(document).ready(function () {
    renderTaskList();
});

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Retrieve the task details from the form inputs
    const title = $('#title').val();
    const description = $('#description').val();
    const deadline = $('deadline').val();

    // Validate the task details (you can add your validation logic here)

    // Call the addNewTask function to add the new task
    addNewTask(title, description, deadline);

    // Close the modal or reset the form after adding the task
    // Example: $('#task-modal').modal('hide'); or $('#task-form')[0].reset();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    event.preventDefault(); // Prevent the default button behavior

    // Retrieve the task ID or any unique identifier from the task card
    const taskId = $(event.target).data('task-id');

    // Call a function to remove the task from localStorage
    removeTaskFromLocalStorage(taskId);

    // Render the updated task list after deleting the task
    renderTaskList();
}


// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('task-id');
    const newStatus = $(this).data('status');

    // Update the task status in localStorage
    updateTaskStatus(taskId, newStatus);

    // Render the updated task list after dropping the task into a new status lane
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // Render the task list
    renderTaskList();

    // Add event listener for the form submission to handle adding a new task
    $('#task-form').submit(handleAddTask);

    // Add event listener to handle deleting a task when the delete button is clicked
    $('.task-board').on('click', '.delete-button', handleDeleteTask);

    // Make each status lane droppable
    $('.status-lane').each(function () {
        makeStatusLaneDroppable($(this));
    });

    // Make the due date field a date picker
    $('#task-deadline').datepicker({
        changeMonth: true,
        changeYear: true,
    });
});
