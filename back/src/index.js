// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Позволяем серверу понимать JSON

// --- Подключаем маршруты (раскомментируете, когда создадите файлы) ---
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// --- Простой тестовый маршрут ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend работает!' });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});