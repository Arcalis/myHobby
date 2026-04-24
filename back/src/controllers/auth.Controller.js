import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exist = await prisma.users.findUnique({ where: { email } });
    if (exist) return res.status(400).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password: hash,
        name,
        role: 'USER',
      },
    });

    res.json(user);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Wrong password' });

    const tokens = generateTokens(user);

    res.json({ user, ...tokens });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const data = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.users.findUnique({
      where: { id: data.id },
    });

    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};