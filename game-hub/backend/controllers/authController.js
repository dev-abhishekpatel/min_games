import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { createUser, findUserByEmail, findUserById } from '../data/store.js';

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required.' });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with that email.' });
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ username, email, passwordHash });
  const token = signToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
    },
  });
};

export const getCurrentUser = async (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    points: user.points,
    level: user.level,
  });
};
