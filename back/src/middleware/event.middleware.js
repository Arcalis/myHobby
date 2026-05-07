import prisma from '../prisma/client.js';

export const eventExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    req.event = event;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const eventOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.author !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.event = event;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const canApproveEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can approve events' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};