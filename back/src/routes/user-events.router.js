import express from 'express';
import {
  favorites,
  registrations,
  join,
  favorite,
  deleteJoin,
  deleteFavorite,
} from '../controllers/event.controller.js';

const userEventsRoute = express.Router();

userEventsRoute.get('/users/me/favorites', favorites);
userEventsRoute.get('/users/me/registrations', registrations);
userEventsRoute.post('/events/:id/join', join);
userEventsRoute.post('/events/:id/favorite', favorite);
userEventsRoute.delete('/events/:id/join', deleteJoin);
userEventsRoute.delete('/events/:id/favorite', deleteFavorite);

export default userEventsRoute;