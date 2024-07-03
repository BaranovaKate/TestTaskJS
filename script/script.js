'use strict';


document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname.endsWith('index.html')) {
        loadTodos();
        loadTags();
    } else if (location.pathname.endsWith('edit.html')) {
        loadTodoForEdit();
    }
});

function loadTodos() {
    const todos = getTodosFromStorage();
    displayTodos(todos);
}

function getTodosFromStorage() {
    return JSON.parse(localStorage.getItem('todos')) || [];
}

function saveTodosToStorage(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}


function getFormValues() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const deadline = document.getElementById('deadline').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    return { title, content, deadline, tags };
}

function addTodo() {
    const { title, content, deadline, tags } = getFormValues();
    if (title && deadline && content && tags) {
        const todos = getTodosFromStorage();
        const todo = {
            id: generateId(),
            title,
            content,
            deadline,
            tags,
            dateCreated: new Date().toISOString().split('T')[0]
        };
        todos.push(todo);
        saveTodosToStorage(todos);
        window.location.href = 'index.html';
    } else {
        alert('Заполните все поля.');
    }
}

function generateId() {
    return '_' + Math.random().toString(36).slice(2, 9);
}

function confirmDelete() {
    const id = new URLSearchParams(window.location.search).get('id');
    const todos = getTodosFromStorage();
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodosToStorage(updatedTodos);
    window.location.href = 'index.html';
}

function loadTodoForEdit() {
    const id = new URLSearchParams(window.location.search).get('id');
    const todos = getTodosFromStorage();
    const todo = todos.find(todo => todo.id === id);

    if (todo) {
        document.getElementById('task-id').value = todo.id;
        document.getElementById('title').value = todo.title;
        document.getElementById('content').value = todo.content;
        document.getElementById('deadline').value = todo.deadline;
        document.getElementById('tags').value = todo.tags.join(', ');
    }
}

function saveTodo() {
    const id = document.getElementById('task-id').value;
    const { title, content, deadline, tags } = getFormValues();

    if (title && deadline && content && tags) {
        const todos = getTodosFromStorage();
        const index = todos.findIndex(todo => todo.id === id);

        if (index !== -1) {
            todos[index] = { ...todos[index], title, content, deadline, tags };
            saveTodosToStorage(todos);
            window.location.href = 'index.html';
        }
    } else {
        alert('Title and Deadline are required.');
    }
}

function displayTodos(todos) {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        todoItem.classList.add(getColorClass(todo.deadline));

        todoItem.innerHTML = `
            <h3>${todo.title}</h3>
            <p>${todo.content}</p>
            <p>Created: ${todo.dateCreated}</p>
            <p>Deadline: ${todo.deadline}</p>
            <p class="tags">${todo.tags.map(tag => `<span>${tag}</span>`).join(', ')}</p>
            <div class="actions">
                <button onclick="window.location.href='edit.html?id=${todo.id}'">Edit</button>
                <button onclick="window.location.href='delete.html?id=${todo.id}'">Delete</button>
            </div>
        `;
        todoList.appendChild(todoItem);
    });
}

function getColorClass(deadline) {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    const timeDiff = deadlineDate - currentDate;
    const daysDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDifference >= 20) {
        return 'green';
    } else if (daysDifference >= 10) {
        return 'yellow';
    } else {
        return 'red';
    }
}

function filterTasks() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const todos = getTodosFromStorage();
    const filteredTodos = todos.filter(todo =>
        todo.title.toLowerCase().includes(searchValue) ||
        todo.content.toLowerCase().includes(searchValue)
    );
    displayTodos(filteredTodos);
}

function sortTasks() {
    const sortBy = document.getElementById('sort').value;
    const todos = getTodosFromStorage();

    todos.sort((a, b) => {
        if (sortBy === 'dateCreated') {
            return new Date(a.dateCreated) - new Date(b.dateCreated);
        } else if (sortBy === 'deadline') {
            return new Date(a.deadline) - new Date(b.deadline);
        }
    });

    displayTodos(todos);
}

function loadTags() {
    const todos = getTodosFromStorage();
    const tags = new Set();

    todos.forEach(todo => {
        todo.tags.forEach(tag => tags.add(tag));
    });

    const tagsFilter = document.getElementById('tags-filter');
    tagsFilter.innerHTML = '';

    tags.forEach(tag => {
        const tagElement = document.createElement('button');
        tagElement.textContent = tag;
        tagElement.onclick = () => filterByTag(tag);
        tagsFilter.appendChild(tagElement);
    });
}

function filterByTag(tag) {
    const todos = getTodosFromStorage();
    const filteredTodos = todos.filter(todo => todo.tags.includes(tag));
    displayTodos(filteredTodos);
}
