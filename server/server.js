import express from 'express';
import path from 'path';

const app = express();
const __dirname = path.resolve(); // Для корректной работы с путями
const port = 3000;

// Обслуживание статических файлов (например, `index.html`)
app.use(express.static(path.join(__dirname, 'dist')));

// Обработка запроса по пути /start
app.get('/start', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/main.html'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
