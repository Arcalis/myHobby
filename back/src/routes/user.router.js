import express from 'express';
import { authMiddleware } from '../middleware/user.middleware.js';
import {
  listUser,
  me,
  profile,
  editMe,
  editRole,
  blockUser,
  deleteUser,
} from '../controllers/user.controller.js';

const userRoutes = express.Router();

userRoutes.get('/', authMiddleware, listUser);
userRoutes.get('/me', authMiddleware, me);
userRoutes.get('/profile', authMiddleware, profile);
userRoutes.patch('/me', authMiddleware, editMe);
userRoutes.patch('/:id/role', authMiddleware, editRole);
userRoutes.patch('/:id/block', authMiddleware, blockUser);
userRoutes.delete('/:id', authMiddleware, deleteUser);

export default userRoutes;