import { useEffect, useState } from 'react';
import socket from '../services/socket';

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const LiveArena = () => {
  const [roomId, setRoomId] = useState('mindfresh-room-1');
  const [username, setUsername] = useState('Player 1');
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState({ players: [], board: Array(9).fill(null), winner: null, next: null });
  const [message, setMessage] = useState('Create or join a room to start live play.');

  useEffect(() => {
    socket.on('room:state', (state) => {
      setRoom(state);
      setJoined(true);
      if (state.winner) {
        setMessage(`Winner: ${state.winner}`);
      } else if (state.players.length === 2) {
        setMessage(`Current turn: ${state.next}`);
      } else {
        setMessage('Waiting for another player to join the room...');
      }
    });

    socket.on('room:error', (error) => {
      setMessage(error.message || 'Room error');
    });

    return () => {
      socket.off('room:state');
      socket.off('room:error');
    };
  }, []);

  const createRoom = () => {
    socket.connect();
    socket.emit('room:create', { roomId, username });
  };

  const joinRoom = () => {
    socket.connect();
    socket.emit('room:join', { roomId, username });
  };

  const handleMove = (index) => {
    if (!room.board || room.board[index] || room.winner || !joined) return;
    socket.emit('room:move', { roomId, index, username });
  };

  return (
    <div className="page-shell">
      <section className="panel live-arena">
        <h2>Live Arena</h2>
        <p>{message}</p>

        <div className="admin-form">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room id" />
        </div>

        <div className="game-actions">
          <button className="primary-btn" onClick={createRoom}>Create Room</button>
          <button className="secondary-btn" onClick={joinRoom}>Join Room</button>
        </div>

        <div className="score-row">
          <span>Players: {room.players.join(' vs ') || 'Waiting'}</span>
          <span>Turn: {room.next || '—'}</span>
        </div>

        <div className="tic-board">
          {room.board.map((cell, index) => (
            <button key={index} className="cell" onClick={() => handleMove(index)}>
              {cell}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LiveArena;
