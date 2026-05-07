import express from 'express';
import { authMiddleware } from '../middleware/user.middleware.js';
import {
  listUser,
  me,
  profile,
  editUser,
  editRole,
  blockUser,
  deleteUser,
} from '../controllers/user.controller.js';

const userRoutes = express.Router();

userRoutes.get('/', listUser);
userRoutes.get('/me', authMiddleware, me);
userRoutes.get('/profile', authMiddleware, profile);
userRoutes.patch('/:id/editUser', editUser);
userRoutes.patch('/:id/role', editRole);
userRoutes.patch('/:id/block', blockUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;