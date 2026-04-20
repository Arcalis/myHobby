import express from 'express';
const authRoutes = express.Router();

authRoutes.post('/register', register);

authRoutes.post('/login', login);

authRoutes.post('/logout', logout);

authRoutes.post('/refresh', refresh);

export default authRoutes;