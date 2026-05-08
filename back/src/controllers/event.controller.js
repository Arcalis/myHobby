import prisma from '../prisma/client.js';

export const events = async (req, res) => {
  const events = await prisma.event.findMany({
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
  const { id } = req.params;

  const [event, free_members, max_members] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
    }),
    prisma.userEvent.count({
      where: {
        id_event: id,
        member: true,
      },
    }),
    prisma.event.findUnique({
      where: { id },
      select: { count_members: true }
    }),
  ]);

  const members = (max_members?.count_members ?? 0) - free_members;

  res.json({
    ...event,
    members,
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const { _count, ...rest } = event;

  res.json({
    ...rest,
    members: _count.user_event,
  });
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

export const registrations = async (req, res) => {
  try {
    const data = await prisma.userEvent.findMany({
      where: {
        id_user: req.user.id,
        member: true,
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

export const favorites = async (req, res) => {
  try {
    const data = await prisma.userEvent.findMany({
      where: {
        id_user: req.user.id,
        favorites: true,
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
  const { id } = req.params;

  const existing = await prisma.userEvent.findUnique({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  const record = existing
    ? await prisma.userEvent.update({
      where: {
        id_user_id_event: {
          id_user: req.user.id,
          id_event: id,
        },
      },
      data: { member: true },
    })
    : await prisma.userEvent.create({
      data: {
        id_user: req.user.id,
        id_event: id,
        member: true,
      },
    });

  res.json(record);
};

export const favorite = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.userEvent.findUnique({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  const record = existing
    ? await prisma.userEvent.update({
      where: {
        id_user_id_event: {
          id_user: req.user.id,
          id_event: id,
        },
      },
      data: { favorites: true },
    })
    : await prisma.userEvent.create({
      data: {
        id_user: req.user.id,
        id_event: id,
        favorites: true,
      },
    });

  res.json(record);
};

export const deleteJoin = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.userEvent.findUnique({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  if (!record) {
    return res.json({ message: 'Already unsubscribed' });
  }

  if (record.favorites) {
    const updated = await prisma.userEvent.update({
      where: {
        id_user_id_event: {
          id_user: req.user.id,
          id_event: id,
        },
      },
      data: { member: false },
    });

    return res.json(updated);
  }

  await prisma.userEvent.delete({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  res.json({ message: 'Unsubscribed' });
};

export const deleteFavorite = async (req, res) => {
  const { id } = req.params;

  const record = await prisma.userEvent.findUnique({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  if (!record) {
    return res.json({ message: 'Already removed from favorites' });
  }

  if (record.member) {
    const updated = await prisma.userEvent.update({
      where: {
        id_user_id_event: {
          id_user: req.user.id,
          id_event: id,
        },
      },
      data: { favorites: false },
    });

    return res.json(updated);
  }

  await prisma.userEvent.delete({
    where: {
      id_user_id_event: {
        id_user: req.user.id,
        id_event: id,
      },
    },
  });

  res.json({ message: 'Removed from favorites' });
};
