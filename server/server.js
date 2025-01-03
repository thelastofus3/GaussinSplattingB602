import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';

const app = express();
const port = 3000;

// Создаем подключение к базе данных MySQL
const db = mysql.createPool({
    host: 'localhost',     // Адрес хоста (может быть 'localhost' или IP-адрес)
    user: 'root',          // Ваш MySQL пользователь
    password: 'rootpassword', // Ваш пароль для пользователя
    database: 'user_db'    // Имя вашей базы данных
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(session({
    secret: 'aGVsbG9fbXlfZnJpZW5k',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Регистрация нового пользователя
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Проверяем, существует ли пользователь с таким email
    db.execute('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Вставляем нового пользователя в базу данных
        db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(200).json({ message: 'Registration successful' });
        });
    });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь с таким email и паролем
    db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Сохраняем информацию о пользователе в сессии
        const user = result[0];
        req.session.user = { id: user.email, name: user.name };
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Session error' });
            }
            res.status(200).json({
                message: 'Login successful',
                user: { name: user.name, email: user.email }
            });
        });
    });
});

// Главная страница (доступна только авторизованным пользователям)
app.get('/main', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'You must log in to access this page' });
    }
    res.status(200).json({
        message: 'Welcome to the main page',
        user: req.session.user
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
