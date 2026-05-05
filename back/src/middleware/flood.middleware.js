import prisma from '../prisma/client.js';

export const checkAlreadyJoined = async (req, res, next) => {
  const { id } = req.params;

  const exist = await prisma.userEvent.findFirst({
    where: {
      id_user: req.user.id,
      id_event: id,
      member: true,
    },
  });

  if (exist) {
    return res.status(400).json({ message: 'Already joined' });
  }

  next();
};