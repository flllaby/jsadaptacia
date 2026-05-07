const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const coolActionsRoutes = require('./routes/cool_actions');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api', coolActionsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Cool Actions API',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            cool_actions: 'GET /api/cool-actions',
            top_users: 'GET /api/top-users',
            schedules: 'GET /api/schedules',
            add_action: 'POST /api/cool-actions',
            user: 'GET /api/user/:id'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не айден' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Регистрация: http://localhost:${PORT}/register.html`);
    console.log(`Логин: http://localhost:${PORT}/login.html`);
    console.log(`Главная: http://localhost:${PORT}/`);
});
