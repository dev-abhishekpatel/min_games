import express from 'express';
import { getGames } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getGames());
});

router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const game = getGames().find((item) => item.slug === slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  return res.json(game);
});

export default router;
