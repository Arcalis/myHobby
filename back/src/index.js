// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.router.js';
import eventRoutes from './routes/event.router.js';
import userRoutes from './routes/user.router.js';
import userEventsRoutes from './routes/user-events.router.js';
import complaintsRoutes from './routes/complaints.router.js';

import { errorMiddleware } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userEventsRoutes);
app.use('/api', complaintsRoutes);

// 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработчик ошибок
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});