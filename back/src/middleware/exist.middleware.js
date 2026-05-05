import prisma from '../prisma/client.js';

export const eventExists = async (req, res, next) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  req.event = event;

  next();
};