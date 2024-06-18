// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
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

    const taskCardBody = document.createElement('div');
    taskCard.appendChild(taskCardBody);
    // Set task ID as a data attribute
    taskCard.setAttribute('data-id', task.id);

    // Create elements for task title, description, deadline, etc.
    const titleElement = document.createElement('h3');
    titleElement.textContent = task.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = task.description;

    const deadlineElement = document.createElement('p');
    deadlineElement.textContent = `Due Date: ${task.dueDate}`;

    // Append elements to the task card
    taskCardBody.appendChild(titleElement);
    taskCardBody.appendChild(descriptionElement);
    taskCardBody.appendChild(deadlineElement);

    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // ? Loop through projects and create project cards for each status
    for (let task of taskList) {
      if (task.status === 'to-do') {
        todoList.append(createTaskElement(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskElement(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskElement(task));
      }
    }
  
    // ? Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
      helper: function (e) {
        // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

function createTaskElement(task) {
    const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.type);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // ? Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
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
    const dueDate = $('#deadline').val();

    const task = {
        title,
        description,
        dueDate,
        status: "to-do",
        id: generateTaskId()
    }
    taskList.push(task)
    localStorage.setItem("tasks",JSON.stringify(taskList))
    renderTaskList()
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
    $('#taskForm').submit(handleAddTask);

    // Add event listener to handle deleting a task when the delete button is clicked
    $('.task-board').on('click', '.delete-button', handleDeleteTask);

    // Make each status lane droppable
    // $('.status-lane').each(function () {
    //     makeStatusLaneDroppable($(this));
    // });
    $('.lane').droppable({
      accept: '.draggable',
      drop: handleDrop,
    });
    // Make the due date field a date picker
    $('#task-deadline').datepicker({
        changeMonth: true,
        changeYear: true,
    });
});
