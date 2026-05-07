const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        const { full_name, email, login, password, role } = req.body;

        if (!full_name || !email || !login || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, login, password_hash, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email, login, role, created_at, coolness_score`,
            [full_name, email, login, password_hash, role || 'user']
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Пользователь с таким email или логином уже существует' });
        }

        res.status(500).json({ error: 'Ошибка регистрации' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        const result = await pool.query(
            'SELECT id, full_name, email, login, password_hash, role, coolness_score FROM users WHERE login = $1',
            [login]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        res.json({
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                login: user.login,
                role: user.role,
                coolness_score: user.coolness_score
            }
        });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

module.exports = router;
