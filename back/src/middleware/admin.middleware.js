import prisma from '../prisma/client.js';

export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};