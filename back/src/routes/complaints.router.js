import express from 'express';
import {
  complaint,
  getComplaint,
  editComplaint,
  deleteComplaint,
} from '../controllers/complaint.controller.js';

const complaintsRoutes = express.Router();

complaintsRoutes.post('/complaints', complaint);
complaintsRoutes.get('/complaints', getComplaint);
complaintsRoutes.patch('/complaints/:id', editComplaint);
complaintsRoutes.delete('/complaints/:id', deleteComplaint);

export default complaintsRoutes;