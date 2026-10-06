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
const rooms = new Map();

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const getRoomState = (room) => ({
  roomId: room.id,
  players: room.players,
  board: room.board,
  winner: room.winner,
  next: room.players[room.turn % room.players.length] || null,
  turn: room.turn,
});

const emitRoomState = (room) => {
  io.to(room.id).emit('room:state', getRoomState(room));
};

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindFresh API is running.' });
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
  socket.on('room:create', ({ roomId, username }) => {
    const roomKey = roomId || 'mindfresh-default';
    const existing = rooms.get(roomKey);

    if (existing && existing.players.length >= 2) {
      socket.emit('room:error', { message: 'Room is full.' });
      return;
    }

    const room = existing || {
      id: roomKey,
      players: [],
      board: Array(9).fill(null),
      turn: 0,
      winner: null,
    };

    if (!room.players.includes(username)) room.players.push(username);
    rooms.set(roomKey, room);
    socket.join(roomKey);
    socket.data.roomId = roomKey;
    emitRoomState(room);
  });

  socket.on('room:join', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('room:error', { message: 'Room not found. Create a room first.' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('room:error', { message: 'Room already has two players.' });
      return;
    }

    if (!room.players.includes(username)) room.players.push(username);
    socket.join(roomId);
    socket.data.roomId = roomId;
    emitRoomState(room);
  });

  socket.on('room:move', ({ roomId, index, username }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (room.winner) return;
    if (room.players.length < 2) {
      socket.emit('room:error', { message: 'Waiting for the second player.' });
      return;
    }

    const playerTurn = room.players[room.turn % room.players.length];
    if (playerTurn !== username) {
      socket.emit('room:error', { message: 'It is not your turn.' });
      return;
    }

    if (room.board[index] !== null) return;

    const nextBoard = [...room.board];
    nextBoard[index] = room.turn % 2 === 0 ? 'X' : 'O';
    room.board = nextBoard;

    const foundWin = WIN_LINES.some(([a, b, c]) => {
      return nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c];
    });

    if (foundWin) {
      room.winner = username;
    } else if (nextBoard.every(Boolean)) {
      room.winner = 'Draw';
    }

    room.turn += 1;
    emitRoomState(room);
  });
});

await connectDB();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
