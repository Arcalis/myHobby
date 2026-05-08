import express from 'express';
import { authMiddleware } from '../middleware/user.middleware.js';
import {
  favorites,
  registrations,
  join,
  favorite,
  deleteJoin,
  deleteFavorite,
} from '../controllers/event.controller.js';

const userEventsRoutes = express.Router();

userEventsRoutes.get('/users/me/favorites', authMiddleware, favorites);
userEventsRoutes.get('/users/me/registrations', authMiddleware, registrations);

userEventsRoutes.post('/events/:id/join', authMiddleware, join);
userEventsRoutes.post('/events/:id/favorite', authMiddleware, favorite);
userEventsRoutes.delete('/events/:id/join', authMiddleware, deleteJoin);
userEventsRoutes.delete('/events/:id/favorite', authMiddleware, deleteFavorite);

export default userEventsRoutes;