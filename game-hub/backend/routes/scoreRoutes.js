import express from 'express';
import { getGameResultsByUser, saveGameResult } from '../data/store.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { game, score, result, duration } = req.body;

  if (!game || typeof score !== 'number' || score < 0) {
    return res.status(400).json({ message: 'Valid game and score are required.' });
  }

  const savedResult = saveGameResult({
    userId: req.user.id,
    username: req.user.username,
    game,
    score,
    result: result || 'completed',
    duration: duration || 0,
  });

  return res.status(201).json(savedResult);
});

router.get('/me', authMiddleware, (req, res) => {
  const history = getGameResultsByUser(req.user.id);
  return res.json(history);
});

export default router;
