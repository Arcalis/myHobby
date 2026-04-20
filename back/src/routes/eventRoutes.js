import express from 'express';
const eventRoute = express.Router();

eventRoute.get('/test', (req, res) => {
  res.json({ message: 'eventRoutes работает' });
});

export default eventRoute;