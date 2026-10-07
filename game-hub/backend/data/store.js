const users = [
  {
    id: 'admin-user',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2a$10$sIoNUpJ63TE4m3NS/Yirq.G7YeNcmhP3WaqKbHlAtP//69VdyC6rG',
    role: 'admin',
    points: 2500,
    level: 7,
    createdAt: new Date().toISOString(),
  },
];

const games = [
  {
    id: 15,
    slug: 'space-shooter',
    name: 'Space Cosmic Blaster',
    description: 'Pilot your starship, blast invading alien fleets, and dodge laser fire!',
    category: 'Action',
    difficulty: 'hard',
    players: 1,
    active: true,
    badge: 'HOT 🔥',
  },
  {
    id: 16,
    slug: 'highway-racer',
    name: 'Turbo Highway Racer',
    description: 'Weave through high-speed highway traffic, grab nitro boosts, and set speed records.',
    category: 'Action',
    difficulty: 'medium',
    players: 1,
    active: true,
    badge: 'HOT ⚡',
  },
  {
    id: 17,
    slug: 'tank-duel',
    name: 'Cyber Tank Blitz',
    description: 'Aim armored heavy cannons, shoot ricocheting shells, and destroy enemy tanks.',
    category: 'Combat',
    difficulty: 'medium',
    players: 1,
    active: true,
    badge: 'HOT 🛡️',
  },
  {
    id: 18,
    slug: 'penalty-shootout',
    name: 'Penalty Soccer Shootout',
    description: 'Curve electric shots past the goalkeeper to score epic match goals!',
    category: 'Sports',
    difficulty: 'medium',
    players: 1,
    active: true,
    badge: 'HOT ⚽',
  },
  {
    id: 19,
    slug: 'ninja-slash',
    name: 'Ninja Blade Slash',
    description: 'Slice through airborne targets with lightning katana swipes and avoid explosive bombs.',
    category: 'Action',
    difficulty: 'easy',
    players: 1,
    active: true,
    badge: 'HOT 🗡️',
  },
  {
    id: 20,
    slug: 'zombie-survival',
    name: 'Zombie Outbreak Defense',
    description: 'Defend your base from invading zombie waves with rapid fire weaponry.',
    category: 'Combat',
    difficulty: 'hard',
    players: 1,
    active: true,
    badge: 'HOT 🧟',
  },
  {
    id: 1,
    slug: 'connect-four',
    name: 'Connect Four',
    description: 'Connect 4 discs vertically, horizontally or diagonally in live 1v1 or AI mode.',
    category: 'Multiplayer',
    difficulty: 'medium',
    players: 2,
    active: true,
    badge: '1v1 ⚡',
  },
  {
    id: 2,
    slug: 'speed-typer',
    name: 'Speed Typer',
    description: 'Race against time or live opponents in a high-octane typing duel.',
    category: 'Multiplayer',
    difficulty: 'hard',
    players: 2,
    active: true,
    badge: 'NEW 🔥',
  },
  {
    id: 3,
    slug: 'whack-a-mole',
    name: 'Reflex Rush (Whack-a-Mole)',
    description: 'Test your lightning reflexes by whacking target moles before time expires!',
    category: 'Reflex',
    difficulty: 'easy',
    players: 1,
    active: true,
    badge: 'FUN 🎉',
  },
  {
    id: 4,
    slug: 'brick-breaker',
    name: 'Brick Breaker Arcade',
    description: 'Bounce the ball, break power blocks, and dominate retro arcade physics.',
    category: 'Arcade',
    difficulty: 'medium',
    players: 1,
    active: true,
    badge: 'CLASSIC 🕹️',
  },
  {
    id: 5,
    slug: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic board game with AI difficulty levels and Live 1v1 Arena.',
    category: 'Multiplayer',
    difficulty: 'easy',
    players: 2,
    active: true,
  },
  {
    id: 6,
    slug: 'snake',
    name: 'Snake Deluxe',
    description: 'Guide the snake, eat bonus items, grow long, and set speed records.',
    category: 'Arcade',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 7,
    slug: 'rock-paper-scissors',
    name: 'Rock Paper Scissors Duel',
    description: 'Outsmart AI or live rivals in quick animated move reveals.',
    category: 'Multiplayer',
    difficulty: 'easy',
    players: 2,
    active: true,
  },
  {
    id: 8,
    slug: 'memory',
    name: 'Memory Card Flip',
    description: 'Match pairs with smooth 3D flip card animations and timing bonuses.',
    category: 'Puzzle',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 9,
    slug: 'quiz',
    name: 'Quiz Master',
    description: 'Answer fast general knowledge questions to climb global leaderboards.',
    category: 'Knowledge',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 10,
    slug: 'number-guess',
    name: 'Number Guessing',
    description: 'Deduce the secret number with hot/cold range feedback hints.',
    category: 'Puzzle',
    difficulty: 'easy',
    players: 1,
    active: true,
  },
  {
    id: 11,
    slug: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble mixed letter tiles and master vocabulary puzzles.',
    category: 'Word',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 12,
    slug: 'math-challenge',
    name: 'Math Speed Challenge',
    description: 'Solve mental arithmetic rapid-fire equations for maximum score multiplier.',
    category: 'Educational',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 13,
    slug: 'simon-says',
    name: 'Simon Says Tone Blitz',
    description: 'Memorize expanding sound and light color patterns under pressure.',
    category: 'Memory',
    difficulty: 'hard',
    players: 1,
    active: true,
  },
  {
    id: 14,
    slug: '2048',
    name: '2048 Puzzle',
    description: 'Merge matching numbers smoothly to reach the legendary 2048 tile.',
    category: 'Arcade',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
];

const gameResults = [
  {
    id: 'demo-result-1',
    userId: 'admin-user',
    username: 'admin',
    game: 'space-shooter',
    score: 450,
    result: 'win',
    duration: 60,
    createdAt: new Date().toISOString(),
  },
];

const achievements = [
  { id: 'first-win', name: 'First Win', description: 'Win your first game.', points: 25 },
  { id: 'star-player', name: 'Star Player', description: 'Reach 500 points.', points: 100 },
];

export const inMemoryStore = {
  users,
  games,
  gameResults,
  achievements,
};

export function findUserByEmail(email) {
  return inMemoryStore.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return inMemoryStore.users.find((user) => user.id === id);
}

export function createUser({ username, email, passwordHash, role = 'user' }) {
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    username,
    email,
    passwordHash,
    role,
    points: 0,
    level: 1,
    createdAt: new Date().toISOString(),
  };

  inMemoryStore.users.push(newUser);
  return newUser;
}

export function getGames() {
  return inMemoryStore.games;
}

export function saveGameResult({ userId, username, game, score, result, duration }) {
  const newEntry = {
    id: `result-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    username,
    game,
    score,
    result,
    duration,
    createdAt: new Date().toISOString(),
  };

  inMemoryStore.gameResults.unshift(newEntry);

  const user = findUserById(userId);
  if (user) {
    user.points += Math.max(0, Number(score) || 0);
    user.level = Math.max(1, Math.floor(user.points / 250) + 1);
  }

  return newEntry;
}

export function getGameResultsByUser(userId) {
  return inMemoryStore.gameResults.filter((entry) => entry.userId === userId).slice(0, 10);
}

export function getLeaderboard() {
  return [...inMemoryStore.users]
    .sort((a, b) => b.points - a.points)
    .map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      points: user.points,
      level: user.level,
      role: user.role,
    }));
}

export function createGame({ slug, name, description, category, difficulty, players }) {
  const game = {
    id: Date.now(),
    slug,
    name,
    description,
    category,
    difficulty,
    players,
    active: true,
  };

  inMemoryStore.games.push(game);
  return game;
}

export function getProfileStats(userId) {
  const user = findUserById(userId);
  const results = getGameResultsByUser(userId);
  return {
    user,
    totalGames: results.length,
    totalPoints: user?.points || 0,
    bestScore: Math.max(0, ...results.map((item) => Number(item.score) || 0)),
  };
}
