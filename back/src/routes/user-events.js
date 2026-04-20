import express from 'express';
const userEventsRoute = express.Router();

eventRoute.get('/users/me/fovorites', favorites);

eventRoute.get('/users/me/registrations', registrations);

eventRoute.post('/events/:id/join', join);

eventRoute.post('/events/:id/favorite', favorite);

eventRoute.delete('/events/:id/join', deleteJoin);

eventRoute.delete('/events/:id/favorite', deleteFavorite);

export default userEventsRoute;