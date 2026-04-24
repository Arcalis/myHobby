import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/auth.controller.js';

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refresh);

export default authRoutes;