import express from 'express';
const complaintsRoutes = express.Router();

authRoutes.post('/complaints', complaint);

authRoutes.get('/complaints', getComplaint);

authRoutes.patch('/complaints/:id', editComplaint);

authRoutes.delete('/complaints/:id', deleteComplaint);

export default authRoutes;