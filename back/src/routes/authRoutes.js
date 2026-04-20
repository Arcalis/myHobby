import express from 'express';
const authRoutes = express.Router();

authRoutes.get('/test', (req, res) => {
  res.json({ message: 'authRoutes работает' });
});

export default authRoutes;