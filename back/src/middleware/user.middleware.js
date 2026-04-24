import prisma from '../prisma/client.js';

export const listUser = async (req, res) => {
  const users = await prisma.users.findMany();
  res.json(users);
};

export const me = async (req, res) => {
  const user = await prisma.users.findUnique({
    where: { id: req.user.id },
  });

  res.json(user);
};

export const editUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.users.update({
    where: { id },
    data: req.body,
  });

  res.json(user);
};

export const editRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.users.update({
    where: { id },
    data: { role },
  });

  res.json(user);
};

export const blockUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.users.update({
    where: { id },
    data: { blocked: true },
  });

  res.json(user);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  await prisma.users.delete({
    where: { id },
  });

  res.json({ message: 'Deleted' });
};