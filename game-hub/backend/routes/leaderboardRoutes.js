import express from 'express';
import { getLeaderboard } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const leaderboard = getLeaderboard();
  return res.json(leaderboard);
});

router.get('/:game', (req, res) => {
  const { game } = req.params;
  const leaderboard = getLeaderboard().filter((entry) => entry.username && entry.id);

  const scoreMap = leaderboard.map((user) => ({
    username: user.username,
    points: user.points,
    level: user.level,
  }));

  return res.json(
    scoreMap.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      game,
    }))
  );
});

export default router;
