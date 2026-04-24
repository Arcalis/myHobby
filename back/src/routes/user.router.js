import express from 'express';
import {
  listUser,
  me,
  editUser,
  editRole,
  blockUser,
  deleteUser,
} from '../controllers/user.controller.js';

const userRoute = express.Router();

userRoute.get('/', listUser);
userRoute.get('/me', me);
userRoute.patch('/:id/editUser', editUser);
userRoute.patch('/:id/role', editRole);
userRoute.patch('/:id/block', blockUser);
userRoute.delete('/:id', deleteUser);

export default userRoute;