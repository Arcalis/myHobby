import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokens = (user) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are not set');
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    accessSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { email, password, first_name, second_name } = req.body;

    const exist = await prisma.user.findFirst({ where: { email } });
    if (exist) return res.status(400).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);

    const name = `${second_name}_${first_name?.trim()?.[0] || ''}`.toLowerCase();

    const user = await prisma.user.create({
      data: {
        first_name,
        second_name,
        name,
        email,
        password: hash,
        role: 'user',
      },
    });

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) {
    console.error('REGISTER ERROR:', e);
    res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Not found' });

    if (!user.password) {
      return res.status(500).json({ message: 'User password is empty' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Wrong password' });

    const tokens = generateTokens(user);
    const { password: _, ...safeUser } = user;

    res.json({ user: safeUser, ...tokens });
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    res.status(500).json({ message: e.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT refresh secret is not set');

    const data = jwt.verify(refreshToken, secret);

    const user = await prisma.user.findUnique({
      where: { id: data.id },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (e) {
    console.error('REFRESH ERROR:', e);
    res.status(401).json({ message: e.message });
  }
};