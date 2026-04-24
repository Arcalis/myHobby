import prisma from '../prisma/client.js';

export const events = async (req, res) => {
  const events = await prisma.events.findMany({
    where: { deleted: false, approved: true },
  });

  res.json(events);
};

export const currEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.events.findUnique({
    where: { id },
  });

  res.json(event);
};

export const newEvent = async (req, res) => {
  const event = await prisma.events.create({
    data: {
      ...req.body,
      author: req.user.id,
      approved: false,
    },
  });

  res.json(event);
};

export const editEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.events.update({
    where: { id },
    data: req.body,
  });

  res.json(event);
};

export const approveEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.events.update({
    where: { id },
    data: { approved: true },
  });

  res.json(event);
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  await prisma.events.update({
    where: { id },
    data: { deleted: true },
  });

  res.json({ message: 'Deleted' });
};



// --- USER EVENTS ---

export const join = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.user_event.create({
    data: {
      id_user: req.user.id,
      id_event: id,
      member: true,
    },
  });

  res.json(record);
};

export const deleteJoin = async (req, res) => {
  const { id } = req.params;

  await prisma.user_event.deleteMany({
    where: {
      id_user: req.user.id,
      id_event: id,
    },
  });

  res.json({ message: 'Unsubscribed' });
};

export const favorite = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.user_event.create({
    data: {
      id_user: req.user.id,
      id_event: id,
      favorites: true,
    },
  });

  res.json(record);
};

export const deleteFavorite = async (req, res) => {
  const { id } = req.params;

  await prisma.user_event.deleteMany({
    where: {
      id_user: req.user.id,
      id_event: id,
    },
  });

  res.json({ message: 'Removed from favorites' });
};

export const favorites = async (req, res) => {
  const data = await prisma.user_event.findMany({
    where: {
      id_user: req.user.id,
      favorites: true,
    },
    include: { event: true },
  });

  res.json(data);
};

export const registrations = async (req, res) => {
  const data = await prisma.user_event.findMany({
    where: {
      id_user: req.user.id,
      member: true,
    },
    include: { event: true },
  });

  res.json(data);
};