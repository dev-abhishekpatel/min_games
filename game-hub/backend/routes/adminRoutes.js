import express from 'express';
import { createGame } from '../data/store.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', (req, res) => {
  res.json({ message: 'Admin stats are available.', user: req.user.username });
});

router.post('/games', (req, res) => {
  const { slug, name, description, category, difficulty, players } = req.body;

  if (!slug || !name) {
    return res.status(400).json({ message: 'Game slug and name are required.' });
  }

  const game = createGame({ slug, name, description, category, difficulty, players });
  return res.status(201).json(game);
});

export default router;
