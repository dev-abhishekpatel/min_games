import { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import sounds from '../services/soundEffects';

const LiveArena = () => {
  const [selectedGame, setSelectedGame] = useState('connect-four');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('mf_username') || `Player_${Math.floor(1000 + Math.random() * 9000)}`);
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState('Select a game and click Quick Match or Create Room to start playing live!');
  const [ping, setPing] = useState(15);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [typingInput, setTypingInput] = useState('');
  const [searchingMatch, setSearchingMatch] = useState(false);

  useEffect(() => {
    localStorage.setItem('mf_username', username);
  }, [username]);

  useEffect(() => {
    // Ping check
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('ping', () => {
          setPing(Date.now() - start);
        });
      }
    }, 3000);

    socket.on('room:state', (state) => {
      setRoom(state);
      setJoined(true);
      setSearchingMatch(false);

      if (state.winner) {
        if (state.winner === username) {
          sounds.playWin();
          setMessage(`🏆 Victory! You won the match!`);
        } else if (state.winner === 'Draw') {
          setMessage(`🤝 Match ended in a draw!`);
        } else {
          sounds.playLose();
          setMessage(`💀 ${state.winner} won the game!`);
        }
      } else if (state.players.length === 2) {
        sounds.playMove();
        if (state.nextPlayer === username) {
          setMessage(`👉 Your turn to make a move!`);
        } else {
          setMessage(`⏳ Waiting for ${state.nextPlayer}'s move...`);
        }
      } else {
        setMessage('⌛ Room created! Waiting for opponent to join...');
      }
    });

    socket.on('room:error', (err) => {
      setMessage(`⚠️ ${err.message}`);
      setSearchingMatch(false);
    });

    socket.on('room:matchmaking', (data) => {
      setMessage(`⚡ ${data.message}`);
      setSearchingMatch(true);
    });

    socket.on('room:chat_message', (msg) => {
      setChatMessages((prev) => [...prev.slice(-20), msg]);
    });

    socket.on('room:emoji_reaction', (data) => {
      setFloatingEmojis((prev) => [...prev, data]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== data.id));
      }, 2500);
    });

    return () => {
      clearInterval(pingInterval);
      socket.off('room:state');
      socket.off('room:error');
      socket.off('room:matchmaking');
      socket.off('room:chat_message');
      socket.off('room:emoji_reaction');
    };
  }, [username]);

  const connectSocket = () => {
    if (!socket.connected) socket.connect();
  };

  const createRoom = () => {
    connectSocket();
    const code = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(code);
    socket.emit('room:create', { roomId: code, username, gameType: selectedGame });
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a valid Room Code to join!');
      return;
    }
    connectSocket();
    socket.emit('room:join', { roomId: roomId.trim(), username });
  };

  const quickMatch = () => {
    connectSocket();
    socket.emit('room:quickmatch', { username, gameType: selectedGame });
  };

  const handleMove = (index) => {
    if (!room || room.winner || !joined) return;
    socket.emit('room:move', { roomId: room.roomId, index, username });
  };

  const handleRpsMove = (choice) => {
    if (!room || room.winner) return;
    sounds.playClick();
    socket.emit('room:rps_move', { roomId: room.roomId, choice, username });
  };

  const handleTypingChange = (e) => {
    const val = e.target.value;
    setTypingInput(val);
    if (!room || !room.text) return;

    sounds.playClick();
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === room.text[i]) correct++;
    }
    const prog = Math.min(100, Math.round((correct / room.text.length) * 100));
    const words = val.trim().split(/\s+/).filter(Boolean).length;
    socket.emit('room:type_progress', { roomId: room.roomId, username, progress: prog, wpm: words * 6 });
  };

  const resetRoom = () => {
    if (!room) return;
    setTypingInput('');
    socket.emit('room:reset', { roomId: room.roomId });
  };

  const sendEmoji = (emoji) => {
    if (!room) return;
    socket.emit('room:emoji', { roomId: room.roomId, username, emoji });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !room) return;
    socket.emit('room:chat', { roomId: room.roomId, username, message: chatInput.trim() });
    setChatInput('');
  };

  const copyRoomCode = () => {
    if (room?.roomId) {
      navigator.clipboard.writeText(room.roomId);
      alert(`Room Code copied: ${room.roomId}`);
    }
  };

  return (
    <div className="page-shell">
      {/* Floating Emojis Overlay */}
      <div className="floating-emojis-container">
        {floatingEmojis.map((e) => (
          <div key={e.id} className="floating-emoji">
            <span>{e.emoji}</span>
            <small>{e.username}</small>
          </div>
        ))}
      </div>

      <section className="panel live-arena-wrapper">
        <div className="live-header">
          <div>
            <span className="live-badge">🟢 LIVE MULTIPLAYER ARENA</span>
            <h2>Real-Time Head-to-Head Duels</h2>
          </div>
          <div className="ping-pill">
            ⚡ {ping} ms latency
          </div>
        </div>

        {/* Game Type Selector */}
        {!joined && (
          <div className="game-select-tabs">
            <button className={`tab-btn ${selectedGame === 'connect-four' ? 'active' : ''}`} onClick={() => setSelectedGame('connect-four')}>
              🔴 Connect Four
            </button>
            <button className={`tab-btn ${selectedGame === 'speed-typer' ? 'active' : ''}`} onClick={() => setSelectedGame('speed-typer')}>
              ⚡ Speed Typer Race
            </button>
            <button className={`tab-btn ${selectedGame === 'tic-tac-toe' ? 'active' : ''}`} onClick={() => setSelectedGame('tic-tac-toe')}>
              ❌⭕ Tic Tac Toe
            </button>
            <button className={`tab-btn ${selectedGame === 'rock-paper-scissors' ? 'active' : ''}`} onClick={() => setSelectedGame('rock-paper-scissors')}>
              ✊✋✌️ RPS Duel
            </button>
          </div>
        )}

        {/* Setup Form */}
        {!joined ? (
          <div className="lobby-setup-card">
            <div className="input-group">
              <label>Player Name</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Display Name" />
            </div>

            <div className="input-group">
              <label>Room Code (Optional)</label>
              <input value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} placeholder="e.g. GAME12" />
            </div>

            <div className="lobby-actions">
              <button className="primary-btn match-btn" onClick={quickMatch} disabled={searchingMatch}>
                {searchingMatch ? '⚡ Searching for Rivals...' : '⚡ Quick Match (Instant 1v1)'}
              </button>
              <button className="secondary-btn" onClick={createRoom}>➕ Create Private Room</button>
              <button className="secondary-btn" onClick={joinRoom}>🔑 Join Room Code</button>
            </div>
          </div>
        ) : (
          <div className="live-match-banner">
            <div className="room-info-bar">
              <span>Room Code: <strong>{room.roomId}</strong></span>
              <button className="copy-btn" onClick={copyRoomCode}>📋 Copy Code</button>
              <span>Players: {room.players.join(' vs ') || 'Waiting...'}</span>
            </div>

            {/* Quick Emoji Bar */}
            <div className="emoji-bar">
              {['🔥', '👏', '🤣', '💀', '🎉', 'GG'].map((emoji) => (
                <button key={emoji} className="emoji-btn" onClick={() => sendEmoji(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="status-banner">{message}</div>

        {/* LIVE GAME BOARDS */}
        {joined && room && (
          <div className="live-game-area">

            {/* 1. CONNECT FOUR LIVE */}
            {room.gameType === 'connect-four' && (
              <div className="c4-grid live-c4">
                {Array.from({ length: 7 }, (_, colIdx) => (
                  <div key={colIdx} className="c4-col" onClick={() => handleMove(colIdx)}>
                    {Array.from({ length: 6 }, (_, rowIdx) => {
                      const cellVal = room.board ? room.board[rowIdx * 7 + colIdx] : null;
                      return (
                        <div key={rowIdx} className={`c4-cell ${cellVal ? 'filled' : ''}`}>
                          <div className="c4-disc">{cellVal}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* 2. TIC TAC TOE LIVE */}
            {room.gameType === 'tic-tac-toe' && (
              <div className="tic-board live-tic">
                {(room.board || Array(9).fill(null)).map((cell, idx) => (
                  <button key={idx} className={`cell ${cell ? cell.toLowerCase() : ''}`} onClick={() => handleMove(idx)}>
                    {cell}
                  </button>
                ))}
              </div>
            )}

            {/* 3. ROCK PAPER SCISSORS LIVE */}
            {room.gameType === 'rock-paper-scissors' && (
              <div className="rps-live-arena">
                <p>First to 3 Points Wins the Duel!</p>
                <div className="choice-row">
                  {['Rock', 'Paper', 'Scissors'].map((choice) => (
                    <button key={choice} className="primary-btn" onClick={() => handleRpsMove(choice)}>
                      {choice === 'Rock' ? '✊ Rock' : choice === 'Paper' ? '✋ Paper' : '✌️ Scissors'}
                    </button>
                  ))}
                </div>
                <div className="scores-box">
                  {room.players.map((p) => (
                    <div key={p} className="player-score-card">
                      <span>{p}</span>
                      <strong>{room.scores?.[p] || 0} PTS</strong>
                      <small>{room.moves?.[p] ? '✅ Move Locked' : '⌛ Thinking...'}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SPEED TYPER LIVE */}
            {room.gameType === 'speed-typer' && (
              <div className="typer-live-arena">
                <div className="typer-passage">{room.text}</div>
                <textarea
                  className="typer-input"
                  rows={2}
                  value={typingInput}
                  onChange={handleTypingChange}
                  placeholder="Type passage here..."
                  disabled={room.winner}
                />
                <div className="racer-bars">
                  {room.players.map((p) => {
                    const prog = room.progress?.[p] || 0;
                    return (
                      <div key={p} className="racer-row">
                        <span>{p} ({prog}%)</span>
                        <div className="race-track">
                          <div className="race-car" style={{ left: `${prog}%` }}>🏎️</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REMATCH BUTTON */}
            {room.winner && (
              <div className="rematch-section">
                <button className="primary-btn" onClick={resetRoom}>🔄 Rematch!</button>
              </div>
            )}

            {/* LIVE CHAT BOX */}
            <div className="live-chat-panel">
              <h4>💬 Live Match Chat</h4>
              <div className="chat-messages">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className="chat-msg">
                    <strong>{m.username}:</strong> <span>{m.message}</span> <small>{m.time}</small>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className="chat-form">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Send a fast message..." />
                <button type="submit" className="primary-btn">Send</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LiveArena;
