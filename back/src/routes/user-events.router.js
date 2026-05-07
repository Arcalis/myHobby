import express from 'express';
import {
  favorites,
  registrations,
  join,
  favorite,
  deleteJoin,
  deleteFavorite,
} from '../controllers/event.controller.js';

const userEventsRoutes = express.Router();

userEventsRoutes.get('/users/me/favorites', favorites);
userEventsRoutes.get('/users/me/registrations', registrations);

userEventsRoutes.post('/events/:id/join', join);
userEventsRoutes.post('/events/:id/favorite', favorite);
userEventsRoutes.delete('/events/:id/join', deleteJoin);
userEventsRoutes.delete('/events/:id/favorite', deleteFavorite);

export default userEventsRoutes;