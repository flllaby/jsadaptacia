const API_URL = 'http://localhost:3000/api';

// ========================
// Регистрация
// ========================
async function registerUser(event) {
    event.preventDefault();

    const full_name = document.getElementById('full_name').value;
    const email = document.getElementById('email').value;
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role')?.value || 'user';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, login, password, role })
        });

        const data = await response.json();

        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = data.message || data.error || 'Ошибка регистрации';
            messageEl.className = response.ok ? 'message success' : 'message error';
        }

        if (response.ok && data.message === 'Регистрация успешна') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = 'Сервер недоступен';
            messageEl.className = 'message error';
        }
    }
}

// ========================
// Авторизация
// ========================
async function loginUser(event) {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = `Добро пожаловать, ${data.user.full_name}! Очков: ${data.user.coolness_score || 0}`;
                messageEl.className = 'message success';
            }
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = data.error || 'Ошибка входа';
                messageEl.className = 'message error';
            }
        }
    } catch (error) {
        console.error('Ошибка:', error);
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = 'Сервер недоступен';
            messageEl.className = 'message error';
        }
    }
}

// ========================
// Проверка авторизации
// ========================
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        alert('Сначала войдите в аккаунт.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ========================
// Показ текущего пользователя
// ========================
function showUserInfo() {
    const userBlock = document.getElementById('user-info');
    if (!userBlock) return;

    const user = getCurrentUser();
    if (user) {
        userBlock.innerHTML = `
            <p><strong>${escapeHtml(user.full_name)}</strong> (${user.role})</p>
            <p>Очки крутости: <strong>${user.coolness_score || 0}</strong></p>
            <button onclick="logout()" class="logout-btn">Выйти</button>
        `;
    } else {
        userBlock.innerHTML = `
            <p>Вы не вошли в систему</p>
            <a href="login.html" class="login-link">Войти</a>
            <a href="register.html" class="register-link">Зарегистрироваться</a>
        `;
    }
}

// ========================
// Загрузка крутых поступков
// ========================
async function loadCoolActions() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_URL}/cool-actions`);
        const actions = await response.json();

        const container = document.getElementById('cool-actions-list');
        if (!container) return;
        container.innerHTML = '';

        if (actions.length === 0) {
            container.innerHTML = '<p>Пока нет ни одного крутого.</p>';
            return;
        }

        actions.forEach(action => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${escapeHtml(action.title)}</h3>
                <p>${escapeHtml(action.description || 'Нет описания')}</p>
                <p>Очки: ${action.coolness_points}</p>
                <p>Автор: ${escapeHtml(action.user_login)}</p>
                <small>${new Date(action.created_at).toLocaleString('ru-RU')}</small>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка:', error);
        const container = document.getElementById('cool-actions-list');
        if (container) {
            container.innerHTML = '<p>Ошибка загрузки</p>';
        }
    }
}

// ========================
// Загрузка топа пользователей
// ========================
async function loadTopUsers() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_URL}/top-users`);
        const users = await response.json();

        const container = document.getElementById('top-users-list');
        if (!container) return;
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<p>Нет пользователей</p>';
            return;
        }

        users.forEach((user, index) => {
            const medal = index === 0 ? 'ну ты крут' : index === 1 ? 'крутой' : index === 2 ? 'чут чут крутой' : `${index + 1}.`;
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${medal} ${escapeHtml(user.login)}</h3>
                <p>Очки: ${user.coolness_score}</p>
                <p>${escapeHtml(user.full_name)}</p>
                <small>Роль: ${user.role}</small>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ========================
// Загрузка расписания
// ========================
async function loadSchedules() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_URL}/schedules`);
        const schedules = await response.json();

        const container = document.getElementById('schedules-list');
        if (!container) return;
        container.innerHTML = '';

        if (schedules.length === 0) {
            container.innerHTML = '<p>Нет мероприятий</p>';
            return;
        }

        schedules.forEach(schedule => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${escapeHtml(schedule.activity_title)}</h3>
                <p>${new Date(schedule.start_time).toLocaleString('ru-RU')}</p>
                <p>${escapeHtml(schedule.location || 'Не указано')}</p>
                <p>${escapeHtml(schedule.mentor_name)} (${escapeHtml(schedule.expertise)})</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ========================
// Добавление крутого
// ========================
async function addCoolAction(event) {
    event.preventDefault();
    
    if (!requireAuth()) return;

    const title = document.getElementById('action_title').value;
    const description = document.getElementById('action_description').value;
    const coolness_points = parseInt(document.getElementById('coolness_points').value);
    const user = getCurrentUser();

    if (!title || !coolness_points) {
        alert('Заполните название и очки!');
        return;
    }

    if (coolness_points < 1 || coolness_points > 100) {
        alert('Очки от 1 до 100!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cool-actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, user_id: user.id, coolness_points })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`${coolness_points} очков крутого!`);
            document.getElementById('action-form').reset();
            
            user.coolness_score = (user.coolness_score || 0) + coolness_points;
            localStorage.setItem('user', JSON.stringify(user));
            
            showUserInfo();
            loadCoolActions();
            loadTopUsers();
        } else {
            alert(data.error || 'Ошибка');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(' Ошибка сервера');
    }
}

// ========================
// Информация о пользователе
// ========================
async function loadUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/user/${user.id}`);
        const userData = await response.json();
        
        const container = document.getElementById('user-details');
        if (container) {
            container.innerHTML = `
                <div class="card">
                    <h3>${escapeHtml(userData.full_name)}</h3>
                    <p><strong>Логин:</strong> ${escapeHtml(userData.login)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(userData.email)}</p>
                    <p><strong>Роль:</strong> ${userData.role}</p>
                    <p><strong>Очки крутого:</strong> ${userData.coolness_score}</p>
                    <p><strong>В системе с:</strong> ${new Date(userData.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ========================
// Экранирование HTML
// ========================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========================
// Автозагрузка
// ========================
document.addEventListener('DOMContentLoaded', () => {
    showUserInfo();

    if (document.getElementById('cool-actions-list')) {
        loadCoolActions();
    }

    if (document.getElementById('top-users-list')) {
        loadTopUsers();
    }

    if (document.getElementById('schedules-list')) {
        loadSchedules();
    }

    if (document.getElementById('user-details')) {
        loadUserInfo();
    }

    const actionForm = document.getElementById('action-form');
    if (actionForm) {
        actionForm.addEventListener('submit', addCoolAction);
    }
});
