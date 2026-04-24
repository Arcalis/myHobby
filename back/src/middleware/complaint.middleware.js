import prisma from '../prisma/client.js';

export const complaint = async (req, res) => {
  const { message } = req.body;

  const data = await prisma.complaints.create({
    data: {
      message,
      from_user: req.user.id,
    },
  });

  res.json(data);
};

export const getComplaint = async (req, res) => {
  const data = await prisma.complaints.findMany();
  res.json(data);
};

export const editComplaint = async (req, res) => {
  const { id } = req.params;

  const data = await prisma.complaints.update({
    where: { id },
    data: req.body,
  });

  res.json(data);
};

export const deleteComplaint = async (req, res) => {
  const { id } = req.params;

  await prisma.complaints.delete({
    where: { id },
  });

  res.json({ message: 'Deleted' });
};