const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const clearAllBtn = document.getElementById('clear-all');
const emptyState = document.getElementById('empty-state');
const paginationContainer = document.getElementById('pagination');
const STORAGE_KEY = 'simple_todo_app_items';
const ITEMS_PER_PAGE = 5;

let todos = [];
let currentPage = 1;

function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        emptyState.style.display = 'block';
        paginationContainer.innerHTML = '';
        paginationContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';

    const totalPages = Math.max(1, Math.ceil(todos.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageTodos = todos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    pageTodos.forEach(todo => {
        const item = document.createElement('li');
        item.className = 'todo-item';
        if (todo.completed) item.classList.add('completed');

        const checkbox = document.createElement('button');
        checkbox.type = 'button';
        checkbox.className = 'actions complete';
        checkbox.textContent = todo.completed ? 'غير مكتملة' : 'مكتملة';
        checkbox.addEventListener('click', () => toggleComplete(todo.id));

        const text = document.createElement('span');
        text.textContent = todo.text;

        const meta = document.createElement('div');
        meta.className = 'todo-meta';
        const createdDate = new Date(todo.createdAt).toLocaleString('ar-EG', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
        const createdLine = document.createElement('span');
        createdLine.textContent = `أنشئت: ${createdDate}`;
        meta.appendChild(createdLine);

        if (todo.completed && todo.completedAt) {
            const completedDate = new Date(todo.completedAt).toLocaleString('ar-EG', {
                dateStyle: 'short',
                timeStyle: 'short',
            });
            const completedLine = document.createElement('span');
            completedLine.textContent = `اكتملت: ${completedDate}`;
            meta.appendChild(completedLine);
        }

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit';
        editButton.textContent = 'تعديل';
        editButton.addEventListener('click', () => editTodo(todo.id));

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete';
        deleteButton.textContent = 'حذف';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        item.appendChild(checkbox);
        const content = document.createElement('div');
        content.className = 'todo-content';
        content.appendChild(text);
        content.appendChild(meta);
        item.appendChild(content);
        item.appendChild(actions);

            todoList.appendChild(item);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.textContent = 'السابق';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage = Math.max(1, currentPage - 1);
        renderTodos();
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i += 1) {
        const pageButton = document.createElement('button');
        pageButton.type = 'button';
        pageButton.textContent = i.toString();
        if (i === currentPage) pageButton.classList.add('active');
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderTodos();
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = 'التالي';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage = Math.min(totalPages, currentPage + 1);
        renderTodos();
    });
    paginationContainer.appendChild(nextButton);
}

function addTodo(text) {
    const trimmed = text.trim();
    if (trimmed === '') return;

    todos.unshift({
        id: Date.now().toString(),
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
    });

    currentPage = 1;
    saveTodos();
    renderTodos();
}

function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            const isCompleted = !todo.completed;
            return {
                ...todo,
                completed: isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : null,
            };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
}

function editTodo(id) {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;

    const newText = prompt('عدل نص المهمة:', todo.text);
    if (newText === null) return;

    const trimmed = newText.trim();
    if (trimmed === '') {
        alert('يجب كتابة نص صالح للمهمة.');
        return;
    }

    todo.text = trimmed;
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function clearAllTodos() {
    if (!todos.length) return;
    const confirmed = confirm('هل تريد حذف جميع المهام؟');
    if (!confirmed) return;

    todos = [];
    saveTodos();
    renderTodos();
}

function init() {
    loadTodos();
    renderTodos();
}

todoForm.addEventListener('submit', event => {
    event.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
    todoInput.focus();
});

clearAllBtn.addEventListener('click', clearAllTodos);

window.addEventListener('DOMContentLoaded', init);