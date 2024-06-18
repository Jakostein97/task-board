// Variables
const todoCards = $('#todo-cards');
const inProgressCards = $('#in-progress-cards');
const doneCards = $('#done-cards');
const taskTitleEl = $('#task-title');
const dueDateEl = $('#task-due');
const taskDescrEl = $('#task-descr');

// Functions
// Create task ID
function generateTaskId() {
    const num = JSON.parse(localStorage.getItem("numTasks")) || 0;
    localStorage.setItem("numTasks", num + 1);
    return num + 1;
}

// Create task card
function createTaskCard(task) {

    const card = $('<div class="card project-card draggable" id="task-card"></div>').attr('task-id', task.id);
    const cardHead = $('<div class="card-header h3"></div>').text(task.title);
    const cardBody = $('<div class="card-body"></div>');
    const description = $('<p></p>').text(task.descr);
    const dueDate = $('<p></p>').text(task.date);
    const deleteBtn = $('<button class="danger" id="delete-btn">Delete</button>').attr('task-id', task.id);

    cardBody.append(description)
    cardBody.append(dueDate)
    cardBody.append(deleteBtn)
    card.append(cardHead)
    card.append(cardBody)
    todoCards.append(card)

    const today = dayjs();
    const due = dayjs(task.date, 'DD/MM/YYYY');

    if (today.isSame(due, 'day')) {
        card.addClass('bg-warning text-white');
    } else if (today.isAfter(due)) {
        card.addClass('bg-danger text-white');
        deleteBtn.addClass('border-light');
    }

    makeDraggable();
    return card;
}

// Render task list and make cards draggable
function renderTaskList() {

    todoCards.empty();
    inProgressCards.empty();
    doneCards.empty();

    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    for (const index in taskList) {
        const task = taskList[index];
        const card = createTaskCard(task);

        if (task.status == "to-do") {
            todoCards.append(card);
        } else if (task.status == "in-progress") {
            inProgressCards.append(card);
        } else if (task.status == "done") {
            doneCards.append(card);
        }
    }

    makeDraggable();
}

// Add a new task
function handleAddTask(event) {

    $('#formModal').modal('hide')

    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    const task = {
        id: generateTaskId(),
        title: taskTitleEl.val(),
        date: dueDateEl.val(),
        descr: taskDescrEl.val(),
        status: "to-do"
    }

    createTaskCard(task);

    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    taskTitleEl.val("");
    dueDateEl.val("");
    taskDescrEl.val("");
}

// Delete Task
function handleDeleteTask(event) {

    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    const targetId = $(this).attr("task-id");
    for (const index in taskList) {
        const task = taskList[index]
        if (targetId == task.id) {
            console.log(`Removing task #${targetId}...`);
            taskList.splice(index, 1);
            localStorage.setItem("tasks", JSON.stringify(taskList));
            break;
        }
    }

    renderTaskList();
}

// Handle drop in lane
function handleDrop(event, ui) {
    // Get updated task list
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    // Get new location of card
    const newLane = event.target.id;

    // Update status of card
    const targetId = ui.draggable.attr('task-id');
    for (const index in taskList) {
        const task = taskList[index]
        if (targetId == task.id) {
            console.log(`Changing status of task #${targetId} to ${newLane}...`)
            task.status = newLane;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            break;
        }
    }

    renderTaskList();
}

// Make cards droppable
function makeDroppable() {
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
}

// Make cards draggable
function makeDraggable() {
    $('.draggable').draggable({ zIndex: 1 });
}

$(document).ready(function () {
    $('#task-due').datepicker();
    $(".sortable").sortable();
    renderTaskList();  // Also makes cards draggable
    makeDroppable();
});

// Event listeners
$('#submit-task').on('click', handleAddTask);
todoCards.on('click', '#delete-btn', handleDeleteTask)
inProgressCards.on('click', '#delete-btn', handleDeleteTask)
doneCards.on('click', '#delete-btn', handleDeleteTask)