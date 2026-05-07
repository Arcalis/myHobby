import prisma from '../prisma/client.js';

export const events = async (req, res) => {
   const events = await prisma.event.findMany({
      include: {
        _count: {
          select:{
            user_event: { 
            where: { member: true }, // подсчёт записей в UserEvent
        }}},
      },
    });

    const result = events.map(event => ({
      ...event,
      count_members: event._count.registrations, // количество занятых мест
    }));

    res.json(result);
};

export const currEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  res.json(event);
};

export const tags = async (req, res) => {
  const tags = await prisma.tag.findMany({});
  res.json(tags);
}

export const ages = async (req, res) => {
  const ages = await prisma.age.findMany({});
  res.json(ages);
}

export const newEvent = async (req, res) => {
  const event = await prisma.event.create({
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

  const event = await prisma.event.update({
    where: { id },
    data: req.body,
  });

  res.json(event);
};

export const approveEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.update({
    where: { id },
    data: { approved: true },
  });

  res.json(event);
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  await prisma.event.update({
    where: { id },
    data: { deleted: true },
  });

  res.json({ message: 'Deleted' });
};

export const join = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.userEvent.create({
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

  await prisma.userEvent.deleteMany({
    where: {
      id_user: req.user.id,
      id_event: id,
    },
  });

  res.json({ message: 'Unsubscribed' });
};

export const favorite = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.userEvent.create({
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

  await prisma.userEvent.deleteMany({
    where: {
      id_user: req.user.id,
      id_event: id,
    },
  });

  res.json({ message: 'Removed from favorites' });
};

export const favorites = async (req, res) => {
  const data = await prisma.userEvent.findMany({
    where: {
      id_user: req.user.id,
      favorites: true,
    },
    include: { event: true },
  });

  res.json(data);
};

export const registrations = async (req, res) => {
  const data = await prisma.userEvent.findMany({
    where: {
      id_user: req.user.id,
      member: true,
    },
    include: { event: true },
  });

  res.json(data);
};