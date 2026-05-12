import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';

export const listUser = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  res.json(user);
};

export const profile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      first_name: true,
      second_name: true,
      email: true,
      organizer_id: true,
      role: true,
    },
  });

  res.json(user);
};

export const editMe = async (req, res) => {
  try {
    const { first_name, second_name, name, email, currentPassword, newPassword } = req.body;
    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: 'Wrong current password' });
    }

    const data = {
      ...(first_name !== undefined && { first_name }),
      ...(second_name !== undefined && { second_name }),
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
    };

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      select: { id: true, name: true, first_name: true, second_name: true, email: true, role: true },
      data,
    });

    res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ message: 'Email already taken' });
    res.status(500).json({ message: e.message });
  }
};

export const editRole = async (req, res) => {
  const id = parseInt(req.params.id);
  const { role } = req.body;
  const user = await prisma.user.update({ where: { id }, data: { role } });
  res.json(user);
};

export const blockUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.update({ where: { id }, data: { blocked: true } });
  res.json(user);
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Deleted' });
};