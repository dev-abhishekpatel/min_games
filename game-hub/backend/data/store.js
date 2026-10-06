const users = [
  {
    id: 'admin-user',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2a$10$u9sGiJXZ4C.nvXElRr3V4eY90F4D2P9ylqD6rI2kgbo1i5fQL7f6q',
    role: 'admin',
    points: 2500,
    level: 7,
    createdAt: new Date().toISOString(),
  },
];

const games = [
  {
    id: 1,
    slug: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic square-grid strategy game.',
    category: 'Arcade',
    difficulty: 'easy',
    players: 2,
    active: true,
  },
  {
    id: 2,
    slug: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    description: 'Quick reflex and prediction challenge.',
    category: 'Arcade',
    difficulty: 'easy',
    players: 1,
    active: true,
  },
  {
    id: 3,
    slug: 'number-guess',
    name: 'Number Guess',
    description: 'Guess the hidden number under a limit.',
    category: 'Logic',
    difficulty: 'medium',
    players: 1,
    active: true,
  },
  {
    id: 4,
    slug: 'memory',
    name: 'Memory Match',
    description: 'Flip cards and match pairs under time.',
    category: 'Memory',
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
    game: 'tic-tac-toe',
    score: 150,
    result: 'win',
    duration: 45,
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
