import express from 'express';
import {
  events,
  currEvent,
  newEvent,
  editEvent,
  approveEvent,
  deleteEvent,
} from '../controllers/event.controller.js';

const eventRoute = express.Router();

eventRoute.get('/', events);
eventRoute.get('/:id', currEvent);
eventRoute.post('/', newEvent);
eventRoute.patch('/:id/edit', editEvent);
eventRoute.patch('/:id/approve', approveEvent);
eventRoute.delete('/:id', deleteEvent);

export default eventRoute;