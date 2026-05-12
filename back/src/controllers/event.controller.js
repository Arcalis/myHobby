import prisma from '../prisma/client.js';

export const events = async (req, res) => {
  const events = await prisma.event.findMany({
    where: {
      active: true,
      deleted: false,
      approved: true,
    },
    include: {
      _count: {
        select: {
          user_event: {
            where: {
              member: true,
            },
          },
        },
      },
    },
  });

  const result = events.map(({ _count, ...event }) => ({
    ...event,
    members: _count.user_event,
  }));

  res.json(result);
};

export const currEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = req.user?.id === event.author;
    const isAdmin = req.user?.role === 'admin';

    const isHidden =
      event.deleted ||
      !event.active ||
      !event.approved;

    if (isHidden && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const occupiedSeats = await prisma.userEvent.count({
      where: { id_event: id, member: true },
    });

    const freeSeats = (event.count_members ?? 0) - occupiedSeats;

    res.json({ ...event, members: freeSeats });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const tags = async (req, res) => {
  const tags = await prisma.tag.findMany({});
  res.json(tags);
}

export const ages = async (req, res) => {
  const ages = await prisma.age.findMany({});
  res.json(ages);
}

export const organizers = async (req, res) => {
  const organizers = await prisma.organizer.findMany({});
  res.json(organizers);
}

export const myEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { author: req.user.id, deleted: false },
      include: {
        tag: true,
        age: true,
        organizer: true,
        _count: { select: { user_event: { where: { member: true } } } },
      },
      orderBy: { created: 'desc' },
    });

    const result = events.map(({ _count, ...event }) => ({
      ...event,
      members: _count.user_event,
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const newEvent = async (req, res) => {
  try {
    const {
      date,
      tag_id,
      age_id,
      organizer_id,
      count_members,
      approved, // <-- важно: явно вытаскиваем, чтобы игнорировать
      ...rest
    } = req.body;

    const event = await prisma.event.create({
      data: {
        ...rest,

        time: rest.time?.slice(0, 5) ?? null,
        date: date ? new Date(date + 'T00:00:00.000Z') : null,

        tag_id: tag_id ? Number(tag_id) : null,
        age_id: age_id ? Number(age_id) : null,
        organizer_id: organizer_id ? Number(organizer_id) : null,
        count_members: count_members ? Number(count_members) : null,

        author: req.user.id,

        approved: false,
      },
    });

    res.json(event);
  } catch (e) {
    console.error('newEvent error:', e);
    res.status(500).json({ message: e.message });
  }
};

export const editEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { date, tag_id, age_id, organizer_id, count_members, ...rest } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.time && { time: rest.time.slice(0, 5) }),
        ...(date !== undefined && { date: date ? new Date(date + 'T00:00:00.000Z') : null }),
        tag_id: tag_id ? Number(tag_id) : null,
        age_id: age_id ? Number(age_id) : null,
        organizer_id: organizer_id ? Number(organizer_id) : null,
        ...(count_members !== undefined && { count_members: count_members ? Number(count_members) : null }),
      },
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const approveEvent = async (req, res) => {
  const id = parseInt(req.params.id);

  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      approved: !event.approved,
    },
  });

  res.json(updated);
};

export const deleteEvent = async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.event.update({ where: { id }, data: { deleted: true } });
  res.json({ message: 'Deleted' });
};

export const registrations = async (req, res) => {
  try {
    const data = await prisma.userEvent.findMany({
      where: {
        id_user: req.user.id,
        member: true,
        event: {
          active: true,
          deleted: false,
          approved: true,
        },
      },
      include: {
        event: {
          include: {
            tag: true,
            age: true,
          },
        },
      },
    });

    const result = data.map(({ event }) => ({
      ...event,
      isRegistered: true,
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrganizer = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: 'Name required' });

    const organizer = await prisma.organizer.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    res.json(organizer);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const favorites = async (req, res) => {
  try {
    const data = await prisma.userEvent.findMany({
      where: {
        id_user: req.user.id,
        favorites: true,
        event: {
          active: true,
          deleted: false,
          approved: true,
        },
      },
      include: {
        event: {
          include: {
            tag: true,
            age: true,
          },
        },
      },
    });

    const result = data.map(({ event }) => ({
      ...event,
      isFavorite: true,
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const join = async (req, res) => {
  const id_event = parseInt(req.params.id);
  const id_user = req.user.id;

  const existing = await prisma.userEvent.findUnique({
    where: { id_user_id_event: { id_user, id_event } },
  });

  const record = existing
    ? await prisma.userEvent.update({
        where: { id_user_id_event: { id_user, id_event } },
        data: { member: true },
      })
    : await prisma.userEvent.create({
        data: { id_user, id_event, member: true },
      });

  res.json(record);
};

export const favorite = async (req, res) => {
  const id_event = parseInt(req.params.id); // ← parseInt
  const id_user = req.user.id;

  const existing = await prisma.userEvent.findUnique({
    where: { id_user_id_event: { id_user, id_event } },
  });

  const record = existing
    ? await prisma.userEvent.update({
        where: { id_user_id_event: { id_user, id_event } },
        data: { favorites: true },
      })
    : await prisma.userEvent.create({
        data: { id_user, id_event, favorites: true },
      });

  res.json(record);
};

export const deleteJoin = async (req, res) => {
  const id_event = parseInt(req.params.id);
  const id_user = req.user.id;

  const record = await prisma.userEvent.findUnique({
    where: { id_user_id_event: { id_user, id_event } },
  });

  if (!record) return res.json({ message: 'Already unsubscribed' });

  if (record.favorites) {
    const updated = await prisma.userEvent.update({
      where: { id_user_id_event: { id_user, id_event } },
      data: { member: false },
    });
    return res.json(updated);
  }

  await prisma.userEvent.delete({
    where: { id_user_id_event: { id_user, id_event } },
  });
  res.json({ message: 'Unsubscribed' });
};

export const deleteFavorite = async (req, res) => {
  const id_event = parseInt(req.params.id);
  const id_user = req.user.id;

  const record = await prisma.userEvent.findUnique({
    where: { id_user_id_event: { id_user, id_event } },
  });

  if (!record) return res.json({ message: 'Already removed from favorites' });

  if (record.member) {
    const updated = await prisma.userEvent.update({
      where: { id_user_id_event: { id_user, id_event } },
      data: { favorites: false },
    });
    return res.json(updated);
  }

  await prisma.userEvent.delete({
    where: { id_user_id_event: { id_user, id_event } },
  });
  res.json({ message: 'Removed from favorites' });
};

export const adminEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        tag: true,
        age: true,
        organizer: true,
        _count: {
          select: {
            user_event: {
              where: {
                member: true,
              },
            },
          },
        },
      },
      orderBy: { created: 'desc' },
    });

    const result = events.map(({ _count, ...event }) => ({
      ...event,
      members: _count.user_event,
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
