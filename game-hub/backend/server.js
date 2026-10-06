import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 5000;

// Active rooms map: roomId -> Room state
const rooms = new Map();
// Matchmaking queue per gameType
const waitingQueues = new Map();

const SAMPLE_TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog in a high speed typing challenge.",
  "React and WebSockets enable fast real-time multiplayer gaming across the globe.",
  "Precision and consistency lead to victory in every competitive mind game duel.",
  "Sharpen your focus and react quickly to secure the top spot on the leaderboard."
];

const WIN_LINES_TIC_TAC_TOE = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Helper to check 4-in-a-row for Connect Four (6 rows, 7 columns)
function checkConnectFourWinner(board) {
  const ROWS = 6;
  const COLS = 7;
  const getCell = (r, c) => board[r * COLS + c];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = getCell(r, c);
      if (!val) continue;
      // Horizontal right
      if (c + 3 < COLS && val === getCell(r, c + 1) && val === getCell(r, c + 2) && val === getCell(r, c + 3)) return val;
      // Vertical down
      if (r + 3 < ROWS && val === getCell(r + 1, c) && val === getCell(r + 2, c) && val === getCell(r + 3, c)) return val;
      // Diagonal down-right
      if (r + 3 < ROWS && c + 3 < COLS && val === getCell(r + 1, c + 1) && val === getCell(r + 2, c + 2) && val === getCell(r + 3, c + 3)) return val;
      // Diagonal down-left
      if (r + 3 < ROWS && c - 3 >= 0 && val === getCell(r + 1, c - 1) && val === getCell(r + 2, c - 2) && val === getCell(r + 3, c - 3)) return val;
    }
  }
  if (board.every(Boolean)) return 'Draw';
  return null;
}

function createInitialRoom(roomId, gameType = 'tic-tac-toe') {
  let gameState = {};
  if (gameType === 'tic-tac-toe') {
    gameState = { board: Array(9).fill(null), turn: 0 };
  } else if (gameType === 'connect-four') {
    gameState = { board: Array(42).fill(null), turn: 0 };
  } else if (gameType === 'rock-paper-scissors') {
    gameState = { moves: {}, scores: {}, round: 1 };
  } else if (gameType === 'speed-typer') {
    const text = SAMPLE_TYPING_TEXTS[Math.floor(Math.random() * SAMPLE_TYPING_TEXTS.length)];
    gameState = { text, progress: {}, wpm: {} };
  }

  return {
    id: roomId,
    gameType,
    players: [],
    winner: null,
    status: 'waiting', // waiting, playing, finished
    createdAt: Date.now(),
    ...gameState
  };
}

function getSanitizedRoomState(room) {
  return {
    roomId: room.id,
    gameType: room.gameType,
    players: room.players,
    winner: room.winner,
    status: room.status,
    board: room.board || null,
    turn: room.turn !== undefined ? room.turn : null,
    nextPlayer: room.players.length >= 2 && room.turn !== undefined ? room.players[room.turn % room.players.length] : null,
    moves: room.moves || null,
    scores: room.scores || null,
    text: room.text || null,
    progress: room.progress || null,
    wpm: room.wpm || null,
  };
}

function emitRoomState(room) {
  io.to(room.id).emit('room:state', getSanitizedRoomState(room));
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindFresh API & Live Multiplayer Server is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

io.on('connection', (socket) => {
  // Latency ping-pong test
  socket.on('ping', (cb) => {
    if (typeof cb === 'function') cb();
  });

  // Create room
  socket.on('room:create', ({ roomId, username, gameType = 'tic-tac-toe' }) => {
    const roomKey = (roomId || `room-${Math.random().toString(36).substring(2, 8)}`).trim().toUpperCase();
    let room = rooms.get(roomKey);

    if (room && room.players.length >= 2) {
      socket.emit('room:error', { message: 'Room is full! Try another code or Quick Match.' });
      return;
    }

    if (!room) {
      room = createInitialRoom(roomKey, gameType);
      rooms.set(roomKey, room);
    }

    if (!room.players.includes(username)) {
      room.players.push(username);
    }

    if (room.players.length === 2 && room.status === 'waiting') {
      room.status = 'playing';
    }

    socket.join(roomKey);
    socket.data.roomId = roomKey;
    socket.data.username = username;

    emitRoomState(room);
  });

  // Join room
  socket.on('room:join', ({ roomId, username }) => {
    const roomKey = (roomId || '').trim().toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      socket.emit('room:error', { message: `Room "${roomKey}" not found. Check the code.` });
      return;
    }

    if (room.players.length >= 2 && !room.players.includes(username)) {
      socket.emit('room:error', { message: 'Room is full.' });
      return;
    }

    if (!room.players.includes(username)) {
      room.players.push(username);
    }

    if (room.players.length === 2) {
      room.status = 'playing';
    }

    socket.join(roomKey);
    socket.data.roomId = roomKey;
    socket.data.username = username;

    emitRoomState(room);
  });

  // Quick Matchmaking
  socket.on('room:quickmatch', ({ username, gameType = 'tic-tac-toe' }) => {
    if (!waitingQueues.has(gameType)) {
      waitingQueues.set(gameType, []);
    }
    const queue = waitingQueues.get(gameType);

    // Check if player is already waiting
    const existingIndex = queue.findIndex((q) => q.username === username);
    if (existingIndex !== -1) {
      queue.splice(existingIndex, 1);
    }

    if (queue.length > 0) {
      const partner = queue.shift();
      const roomKey = `MATCH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const room = createInitialRoom(roomKey, gameType);
      room.players = [partner.username, username];
      room.status = 'playing';
      rooms.set(roomKey, room);

      partner.socket.join(roomKey);
      partner.socket.data.roomId = roomKey;
      partner.socket.data.username = partner.username;

      socket.join(roomKey);
      socket.data.roomId = roomKey;
      socket.data.username = username;

      emitRoomState(room);
    } else {
      queue.push({ username, socket });
      socket.emit('room:matchmaking', { message: 'Searching for an opponent...' });
    }
  });

  // Handle Game Moves (Tic Tac Toe & Connect Four)
  socket.on('room:move', ({ roomId, index, username }) => {
    const room = rooms.get(roomId);
    if (!room || room.winner || room.players.length < 2) return;

    if (room.gameType === 'tic-tac-toe') {
      const playerTurn = room.players[room.turn % 2];
      if (playerTurn !== username) {
        socket.emit('room:error', { message: "It's not your turn!" });
        return;
      }

      if (room.board[index] !== null) return;

      const symbol = room.turn % 2 === 0 ? 'X' : 'O';
      room.board[index] = symbol;

      const foundWin = WIN_LINES_TIC_TAC_TOE.some(
        ([a, b, c]) => room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]
      );

      if (foundWin) {
        room.winner = username;
        room.status = 'finished';
      } else if (room.board.every(Boolean)) {
        room.winner = 'Draw';
        room.status = 'finished';
      } else {
        room.turn += 1;
      }

      emitRoomState(room);
    } else if (room.gameType === 'connect-four') {
      const playerTurn = room.players[room.turn % 2];
      if (playerTurn !== username) {
        socket.emit('room:error', { message: "It's not your turn!" });
        return;
      }

      const col = index % 7;
      // Find lowest available row in column
      let targetRow = -1;
      for (let r = 5; r >= 0; r--) {
        if (room.board[r * 7 + col] === null) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) {
        socket.emit('room:error', { message: 'Column is full!' });
        return;
      }

      const targetIndex = targetRow * 7 + col;
      const color = room.turn % 2 === 0 ? '🔴' : '🟡';
      room.board[targetIndex] = color;

      const result = checkConnectFourWinner(room.board);
      if (result) {
        room.winner = result === 'Draw' ? 'Draw' : username;
        room.status = 'finished';
      } else {
        room.turn += 1;
      }

      emitRoomState(room);
    }
  });

  // Rock Paper Scissors moves
  socket.on('room:rps_move', ({ roomId, choice, username }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameType !== 'rock-paper-scissors') return;

    room.moves[username] = choice;
    const [p1, p2] = room.players;

    if (p1 && p2 && room.moves[p1] && room.moves[p2]) {
      const c1 = room.moves[p1];
      const c2 = room.moves[p2];

      room.scores[p1] = room.scores[p1] || 0;
      room.scores[p2] = room.scores[p2] || 0;

      if (c1 === c2) {
        // Draw round
      } else if (
        (c1 === 'Rock' && c2 === 'Scissors') ||
        (c1 === 'Paper' && c2 === 'Rock') ||
        (c1 === 'Scissors' && c2 === 'Paper')
      ) {
        room.scores[p1] += 1;
      } else {
        room.scores[p2] += 1;
      }

      if (room.scores[p1] >= 3) {
        room.winner = p1;
        room.status = 'finished';
      } else if (room.scores[p2] >= 3) {
        room.winner = p2;
        room.status = 'finished';
      } else {
        // Reset moves for next round
        setTimeout(() => {
          room.moves = {};
          emitRoomState(room);
        }, 2000);
      }
    }

    emitRoomState(room);
  });

  // Speed Typer progress
  socket.on('room:type_progress', ({ roomId, username, progress, wpm }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameType !== 'speed-typer' || room.winner) return;

    room.progress[username] = progress;
    room.wpm[username] = wpm;

    if (progress >= 100) {
      room.winner = username;
      room.status = 'finished';
    }

    emitRoomState(room);
  });

  // Reset / Rematch
  socket.on('room:reset', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const fresh = createInitialRoom(room.id, room.gameType);
    fresh.players = room.players;
    fresh.status = room.players.length >= 2 ? 'playing' : 'waiting';

    rooms.set(roomId, fresh);
    emitRoomState(fresh);
  });

  // Live Chat & Emoji Reactions
  socket.on('room:chat', ({ roomId, username, message }) => {
    io.to(roomId).emit('room:chat_message', { username, message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  });

  socket.on('room:emoji', ({ roomId, username, emoji }) => {
    io.to(roomId).emit('room:emoji_reaction', { username, emoji, id: Date.now() });
  });

  // Disconnect cleanup
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const username = socket.data.username;

    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.players = room.players.filter((p) => p !== username);
      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        room.status = 'waiting';
        emitRoomState(room);
      }
    }
  });
});

await connectDB();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
