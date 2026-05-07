import prisma from '../prisma/client.js';

export const complaintExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    req.complaint = complaint;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const complaintOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role !== 'admin' && complaint.from_user !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.complaint = complaint;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const complaintAdminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin allowed' });
  }

  next();
};