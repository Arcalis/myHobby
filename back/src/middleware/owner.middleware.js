import prisma from '../prisma/client.js';

export const isEventOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.events.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.author !== req.user.id) {
      return res.status(403).json({ message: 'Not your event' });
    }

    next();
  } catch (e) {
    res.status(500).json({ message: 'Owner check error' });
  }
};