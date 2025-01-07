const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Загрузка конфигурации администратора
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userIP = req.ip;

    if (username === config.admin.username && password === config.admin.password) {
        req.session.user = { username, isAdmin: true, ip: userIP };
        res.redirect('/admin.html');
    } else {
        // Здесь можно добавить проверку для обычных пользователей
        req.session.user = { username, isAdmin: false, ip: userIP };
        res.redirect('/dashboard.html');
    }
});

app.get('/dashboard.html', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/admin.html', (req, res) => {
    if (req.session.user && req.session.user.isAdmin) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 