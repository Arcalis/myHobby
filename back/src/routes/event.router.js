import express from 'express';
import {
  tags,
  ages,
  events,
  currEvent,
  newEvent,
  editEvent,
  approveEvent,
  deleteEvent,
} from '../controllers/event.controller.js';

const eventRoutes = express.Router();

eventRoutes.get('/tags', tags);
eventRoutes.get('/ages', ages);
eventRoutes.get('/', events);
eventRoutes.get('/:id', currEvent);
eventRoutes.post('/', newEvent);
eventRoutes.patch('/:id/edit', editEvent);
eventRoutes.patch('/:id/approve', approveEvent);
eventRoutes.delete('/:id', deleteEvent);


export default eventRoutes;