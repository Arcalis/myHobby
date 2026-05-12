import express from 'express';
import { adminOnly } from '../middleware/admin.middleware.js';
import { authMiddleware } from '../middleware/user.middleware.js';
import {
  tags,
  ages,
  organizers,
  createOrganizer,
  events,
  currEvent,
  myEvents,
  adminEvents,
  newEvent,
  editEvent,
  approveEvent,
  deleteEvent,
} from '../controllers/event.controller.js';

const eventRoutes = express.Router();

eventRoutes.get('/tags', tags);
eventRoutes.get('/ages', ages);
eventRoutes.get('/organizers', authMiddleware, organizers);
eventRoutes.post('/newOrganizer', authMiddleware, createOrganizer);
eventRoutes.post('/newEvent', authMiddleware, newEvent);
eventRoutes.get('/my', authMiddleware, myEvents);
eventRoutes.get('/admin', authMiddleware, adminOnly, adminEvents);
eventRoutes.get('/', events);
eventRoutes.get('/:id', authMiddleware, currEvent);
eventRoutes.patch('/edit/:id/', authMiddleware, editEvent);
eventRoutes.patch('/approve/:id', authMiddleware, approveEvent);
eventRoutes.delete('/:id', authMiddleware, deleteEvent);


export default eventRoutes;