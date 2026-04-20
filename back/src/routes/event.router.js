import express from 'express';
const eventRoute = express.Router();

eventRoute.get('/', Events);

eventRoute.get('/:id', currEvent);

eventRoute.post('/', newEvent);

eventRoute.patch('/:id/edit', editEvent);

eventRoute.patch('/:id/approve', approveEvent);

eventRoute.delete('/:id', deleteEvent);

export default eventRoute;