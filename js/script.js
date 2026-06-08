const authSection = document.getElementById('auth-section');
const authForm = document.getElementById('auth-form');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const authToggle = document.getElementById('auth-toggle');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit');
const authToggleText = document.getElementById('auth-toggle-text');
const todoApp = document.getElementById('todo-app');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const clearAllBtn = document.getElementById('clear-all');
const emptyState = document.getElementById('empty-state');
const paginationContainer = document.getElementById('pagination');
const welcomeMessage = document.getElementById('welcome-message');
const logoutBtn = document.getElementById('logout-btn');

const USERS_KEY = 'simple_todo_app_users';
const SESSION_KEY = 'simple_todo_app_session';
const STORAGE_KEY = 'simple_todo_app_items';
const ITEMS_PER_PAGE = 5;

let todos = [];
let currentPage = 1;
let currentUser = null;
let authMode = 'login';

function getStoredUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getTodoStorageKey() {
    return `${STORAGE_KEY}_${currentUser}`;
}

function getSessionUser() {
    return localStorage.getItem(SESSION_KEY);
}

function setSessionUser(username) {
    currentUser = username;
    localStorage.setItem(SESSION_KEY, username);
}

function clearSession() {
    currentUser = null;
    localStorage.removeItem(SESSION_KEY);
}

function loadTodos() {
    if (!currentUser) {
        todos = [];
        return;
    }

    const saved = localStorage.getItem(getTodoStorageKey());
    todos = saved ? JSON.parse(saved) : [];
}

function saveTodos() {
    if (!currentUser) return;
    localStorage.setItem(getTodoStorageKey(), JSON.stringify(todos));
}

function showAuth() {
    authSection.classList.remove('hidden');
    todoApp.classList.add('hidden');
    updateAuthMode(authMode);
    authForm.reset();
    authUsername.focus();
}

function showTodoApp() {
    authSection.classList.add('hidden');
    todoApp.classList.remove('hidden');
    welcomeMessage.textContent = `مرحبا ${currentUser}، هذه قائمة مهامك.`;
}

function updateAuthMode(mode) {
    authMode = mode;
    authTitle.textContent = mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
    authSubmitBtn.textContent = mode === 'login' ? 'دخول' : 'تسجيل';
    authToggleText.textContent = mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟';
    authToggle.textContent = mode === 'login' ? 'إنشاء حساب' : 'تسجيل دخول';
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

function authenticateUser(event) {
    event.preventDefault();

    const username = authUsername.value.trim();
    const password = authPassword.value;

    if (!username || !password) {
        alert('يرجى إدخال اسم مستخدم وكلمة مرور صالحين.');
        return;
    }

    const users = getStoredUsers();

    if (authMode === 'login') {
        if (!users[username] || users[username] !== password) {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة.');
            return;
        }

        setSessionUser(username);
        loadTodos();
        renderTodos();
        showTodoApp();
        return;
    }

    if (users[username]) {
        alert('اسم المستخدم موجود مسبقاً. اختر اسمًا مختلفًا.');
        return;
    }

    users[username] = password;
    saveUsers(users);
    setSessionUser(username);
    loadTodos();
    renderTodos();
    showTodoApp();
}

function handleLogout() {
    clearSession();
    todos = [];
    currentPage = 1;
    renderTodos();
    showAuth();
}

function init() {
    const savedUser = getSessionUser();

    if (savedUser) {
        setSessionUser(savedUser);
        loadTodos();
        renderTodos();
        showTodoApp();
        return;
    }

    showAuth();
}

authForm.addEventListener('submit', authenticateUser);
authToggle.addEventListener('click', () => {
    updateAuthMode(authMode === 'login' ? 'register' : 'login');
});

todoForm.addEventListener('submit', event => {
    event.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
    todoInput.focus();
});

clearAllBtn.addEventListener('click', clearAllTodos);
logoutBtn.addEventListener('click', handleLogout);

window.addEventListener('DOMContentLoaded', init);