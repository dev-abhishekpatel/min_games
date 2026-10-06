import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import sounds from '../services/soundEffects';

const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);
const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

// 1. CONNECT FOUR
const ConnectFourGame = () => {
  const ROWS = 6;
  const COLS = 7;
  const [board, setBoard] = useState(Array(ROWS * COLS).fill(null));
  const [turn, setTurn] = useState('P1'); // P1 (Red) vs P2/AI (Yellow)
  const [isAiMode, setIsAiMode] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [scores, setScores] = useState({ P1: 0, P2: 0 });

  const checkWinner = (grid) => {
    const getCell = (r, c) => grid[r * COLS + c];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = getCell(r, c);
        if (!val) continue;
        if (c + 3 < COLS && val === getCell(r, c + 1) && val === getCell(r, c + 2) && val === getCell(r, c + 3))
          return { winner: val, line: [r * COLS + c, r * COLS + c + 1, r * COLS + c + 2, r * COLS + c + 3] };
        if (r + 3 < ROWS && val === getCell(r + 1, c) && val === getCell(r + 2, c) && val === getCell(r + 3, c))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + c, (r + 2) * COLS + c, (r + 3) * COLS + c] };
        if (r + 3 < ROWS && c + 3 < COLS && val === getCell(r + 1, c + 1) && val === getCell(r + 2, c + 2) && val === getCell(r + 3, c + 3))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + (c + 1), (r + 2) * COLS + (c + 2), (r + 3) * COLS + (c + 3)] };
        if (r + 3 < ROWS && c - 3 >= 0 && val === getCell(r + 1, c - 1) && val === getCell(r + 2, c - 2) && val === getCell(r + 3, c - 3))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + (c - 1), (r + 2) * COLS + (c - 2), (r + 3) * COLS + (c - 3)] };
      }
    }
    if (grid.every(Boolean)) return { winner: 'Draw', line: [] };
    return null;
  };

  const dropDisc = (col, currentBoard, player) => {
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r * COLS + col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return null;

    const nextBoard = [...currentBoard];
    nextBoard[targetRow * COLS + col] = player;
    sounds.playDrop();
    return nextBoard;
  };

  const handleColumnClick = (col) => {
    if (winner || (isAiMode && turn === 'P2')) return;

    const nextBoard = dropDisc(col, board, 'P1');
    if (!nextBoard) return;

    setBoard(nextBoard);
    const winResult = checkWinner(nextBoard);

    if (winResult) {
      setWinner(winResult.winner);
      setWinningCells(winResult.line);
      if (winResult.winner === 'P1') {
        sounds.playWin();
        setScores((prev) => ({ ...prev, P1: prev.P1 + 1 }));
      }
      return;
    }

    if (isAiMode) {
      setTurn('P2');
      setTimeout(() => {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
          if (nextBoard[c] === null) validCols.push(c);
        }
        if (validCols.length > 0) {
          const aiCol = randomFrom(validCols);
          const aiBoard = dropDisc(aiCol, nextBoard, 'P2');
          if (aiBoard) {
            setBoard(aiBoard);
            const aiWin = checkWinner(aiBoard);
            if (aiWin) {
              setWinner(aiWin.winner);
              setWinningCells(aiWin.line);
              if (aiWin.winner === 'P2') {
                sounds.playLose();
                setScores((prev) => ({ ...prev, P2: prev.P2 + 1 }));
              }
            } else {
              setTurn('P1');
            }
          }
        }
      }, 500);
    } else {
      setTurn(turn === 'P1' ? 'P2' : 'P1');
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS * COLS).fill(null));
    setWinner(null);
    setWinningCells([]);
    setTurn('P1');
    sounds.playClick();
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'connect-four',
        score: scores.P1 * 100,
        result: winner === 'P1' ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Connect Four score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>🔴 Connect Four</h2>
        <button className="pill-btn" onClick={() => setIsAiMode(!isAiMode)}>
          Mode: {isAiMode ? '🤖 VS AI' : '👥 Pass & Play'}
        </button>
      </div>

      <div className="score-row">
        <span className="player-badge p1">P1 (Red): {scores.P1}</span>
        <span className="turn-indicator">
          {winner ? (winner === 'Draw' ? 'It’s a Draw!' : `Winner: ${winner === 'P1' ? 'P1 Red' : 'P2 Yellow'}! 🎉`) : `Turn: ${turn === 'P1' ? 'Red' : 'Yellow'}`}
        </span>
        <span className="player-badge p2">{isAiMode ? 'AI (Yellow)' : 'P2 (Yellow)'}: {scores.P2}</span>
      </div>

      <div className="c4-grid">
        {Array.from({ length: COLS }, (_, colIdx) => (
          <div key={colIdx} className="c4-col" onClick={() => handleColumnClick(colIdx)}>
            {Array.from({ length: ROWS }, (_, rowIdx) => {
              const cellIdx = rowIdx * COLS + colIdx;
              const val = board[cellIdx];
              const isWinning = winningCells.includes(cellIdx);
              return (
                <div key={cellIdx} className={`c4-cell ${val ? val.toLowerCase() : ''} ${isWinning ? 'winning' : ''}`}>
                  <div className="c4-disc" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="game-actions">
        <button className="secondary-btn" onClick={resetGame}>🔄 Reset Board</button>
        <button className="primary-btn" onClick={saveScore}>⭐ Save High Score</button>
      </div>
    </div>
  );
};

// 2. SPEED TYPER RUSH
const SpeedTyperGame = () => {
  const TYPING_PASSAGES = [
    "Fast typing requires focus, precision, and quick muscle memory to master.",
    "Technology empowers developers to build incredible real-time game experiences.",
    "Challenge your friends online, climb global leaderboards, and achieve victory.",
    "Practice every day to double your words per minute and stay ahead of rivals."
  ];

  const [targetText, setTargetText] = useState(() => randomFrom(TYPING_PASSAGES));
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    if (completed) return;

    if (!startTime) setStartTime(Date.now());
    setInputVal(val);
    sounds.playClick();

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    // Check completion
    if (val === targetText) {
      setCompleted(true);
      sounds.playWin();
      const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
      const calculatedWpm = Math.round((targetText.split(' ').length / Math.max(elapsedMins, 0.05)));
      setWpm(calculatedWpm);
    } else if (startTime) {
      const elapsedMins = (Date.now() - startTime) / 60000;
      const wordsTyped = val.trim().split(/\s+/).filter(Boolean).length;
      setWpm(Math.round(wordsTyped / Math.max(elapsedMins, 0.02)));
    }
  };

  const restart = () => {
    setTargetText(randomFrom(TYPING_PASSAGES));
    setInputVal('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCompleted(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'speed-typer',
        score: wpm * 10,
        result: completed ? 'win' : 'attempted',
        duration: 30,
      });
      alert(`Saved WPM Score: ${wpm} WPM!`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>⚡ Speed Typer</h2>
      <p>Type the target passage as fast as possible with high accuracy!</p>

      <div className="typer-passage">
        {targetText.split('').map((char, index) => {
          let color = 'var(--text-soft)';
          if (index < inputVal.length) {
            color = inputVal[index] === char ? '#10b981' : '#ef4444';
          }
          return (
            <span key={index} style={{ color, borderBottom: index === inputVal.length ? '2px solid var(--primary)' : 'none' }}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        className="typer-input"
        rows={3}
        value={inputVal}
        onChange={handleChange}
        placeholder="Start typing here..."
        disabled={completed}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Speed</span>
          <span className="stat-val">{wpm} <small>WPM</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Accuracy</span>
          <span className="stat-val">{accuracy}%</span>
        </div>
      </div>

      {completed && <div className="success-box">🎉 Phenomenal! Completed at {wpm} WPM!</div>}

      <div className="game-actions">
        <button className="secondary-btn" onClick={restart}>🔄 Next Passage</button>
        <button className="primary-btn" onClick={saveScore} disabled={wpm === 0}>⭐ Save WPM Score</button>
      </div>
    </div>
  );
};

// 3. REFLEX RUSH (WHACK-A-MOLE)
const WhackAMoleGame = () => {
  const [moles, setMoles] = useState(Array(9).fill({ active: false, type: 'normal' }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    let moleTimer = null;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      moleTimer = setInterval(() => {
        const nextMoles = Array(9).fill({ active: false, type: 'normal' });
        const popCount = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < popCount; i++) {
          const idx = Math.floor(Math.random() * 9);
          const rand = Math.random();
          const type = rand > 0.85 ? 'gold' : rand < 0.15 ? 'bomb' : 'normal';
          nextMoles[idx] = { active: true, type };
        }
        setMoles(nextMoles);
      }, 700);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      sounds.playWin();
    }

    return () => {
      clearInterval(interval);
      clearInterval(moleTimer);
    };
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    sounds.playMove();
  };

  const whackMole = (index) => {
    if (!isPlaying || !moles[index].active) return;
    const type = moles[index].type;
    let gain = 10;
    if (type === 'gold') {
      gain = 30;
      sounds.playWin();
    } else if (type === 'bomb') {
      gain = -20;
      sounds.playLose();
    } else {
      sounds.playClick();
    }

    setScore((s) => Math.max(0, s + gain));
    setMoles((prev) => {
      const updated = [...prev];
      updated[index] = { active: false, type: 'normal' };
      return updated;
    });
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'whack-a-mole',
        score,
        result: score >= 100 ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Reflex Rush score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🎉 Reflex Rush (Whack-a-Mole)</h2>
      <div className="score-row">
        <span>⏱️ Time: {timeLeft}s</span>
        <span>⭐ Score: {score}</span>
      </div>

      <div className="mole-grid">
        {moles.map((mole, idx) => (
          <button
            key={idx}
            className={`mole-hole ${mole.active ? `active ${mole.type}` : ''}`}
            onClick={() => whackMole(idx)}
          >
            {mole.active && (mole.type === 'gold' ? '🌟' : mole.type === 'bomb' ? '💣' : '🐹')}
          </button>
        ))}
      </div>

      <div className="game-actions">
        {!isPlaying ? (
          <button className="primary-btn" onClick={startGame}>▶️ Start 30s Blitz</button>
        ) : (
          <button className="secondary-btn" onClick={() => setIsPlaying(false)}>⏸️ Pause</button>
        )}
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>⭐ Save Score</button>
      </div>
    </div>
  );
};

// 4. BRICK BREAKER ARCADE
const BrickBreakerGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over, won

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const paddleHeight = 12;
    const paddleWidth = 90;
    let paddleX = (canvas.width - paddleWidth) / 2;

    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 4;
    let dy = -4;
    const ballRadius = 8;

    const brickRowCount = 4;
    const brickColumnCount = 6;
    const brickWidth = 70;
    const brickHeight = 18;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 25;

    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];

    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
      }
    }

    let rightPressed = false;
    let leftPressed = false;
    let currentScore = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    let animId;

    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              currentScore += 10;
              setScore(currentScore);
              sounds.playClick();
              if (currentScore === brickRowCount * brickColumnCount * 10) {
                setGameState('won');
                sounds.playWin();
                return;
              }
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 6);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6366f1';
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;

      // Draw paddle
      ctx.beginPath();
      ctx.roundRect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.closePath();

      collisionDetection();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        sounds.playClick();
      }
      if (y + dy < ballRadius) {
        dy = -dy;
        sounds.playClick();
      } else if (y + dy > canvas.height - ballRadius - 12) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
          sounds.playDrop();
        } else {
          setGameState('over');
          sounds.playLose();
          return;
        }
      }

      if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
      else if (leftPressed && paddleX > 0) paddleX -= 6;

      x += dx;
      y += dy;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const start = () => {
    setScore(0);
    setGameState('playing');
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'brick-breaker',
        score,
        result: gameState === 'won' ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Brick Breaker score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🕹️ Brick Breaker Arcade</h2>
      <p>Use mouse or Arrow Keys to move the paddle and smash all bricks!</p>
      <div className="score-row">
        <span>⭐ Score: {score}</span>
        <span>Status: {gameState.toUpperCase()}</span>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={500} height={350} className="game-canvas" />
      </div>

      <div className="game-actions">
        <button className="primary-btn" onClick={start}>
          {gameState === 'playing' ? '🔄 Restart' : '▶️ Play Brick Breaker'}
        </button>
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>
          ⭐ Save Score
        </button>
      </div>
    </div>
  );
};

// 5. TIC TAC TOE
const TicTacToeGame = () => {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsAi, setVsAi] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const handleMove = (index) => {
    if (board[index] || winner) return;
    const nextBoard = [...board];
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    sounds.playMove();

    const match = WIN_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);

    if (match) {
      const player = xIsNext ? 'X' : 'O';
      setWinner(player);
      sounds.playWin();
      setScore((prev) => ({ ...prev, [player]: prev[player] + 1 }));
      return;
    }

    if (nextBoard.every(Boolean)) {
      setWinner('Draw');
      return;
    }

    if (vsAi && xIsNext) {
      setXIsNext(false);
      setTimeout(() => {
        const emptyIndices = nextBoard.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
        if (emptyIndices.length > 0) {
          const aiChoice = randomFrom(emptyIndices);
          nextBoard[aiChoice] = 'O';
          setBoard([...nextBoard]);
          sounds.playClick();
          const aiMatch = WIN_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);
          if (aiMatch) {
            setWinner('O');
            sounds.playLose();
            setScore((prev) => ({ ...prev, O: prev.O + 1 }));
          } else if (nextBoard.every(Boolean)) {
            setWinner('Draw');
          } else {
            setXIsNext(true);
          }
        }
      }, 400);
    } else {
      setXIsNext((prev) => !prev);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>❌⭕ Tic Tac Toe</h2>
        <button className="pill-btn" onClick={() => setVsAi(!vsAi)}>
          {vsAi ? '🤖 VS AI' : '👥 2-Player'}
        </button>
      </div>

      <div className="score-row">
        <span>Player X: {score.X}</span>
        <span>{winner ? (winner === 'Draw' ? 'Draw Game!' : `Winner: ${winner}`) : `Turn: ${xIsNext ? 'X' : 'O'}`}</span>
        <span>{vsAi ? 'AI O' : 'Player O'}: {score.O}</span>
      </div>

      <div className="tic-board">
        {board.map((cell, index) => (
          <button key={index} className={`cell ${cell ? cell.toLowerCase() : ''}`} onClick={() => handleMove(index)}>
            {cell}
          </button>
        ))}
      </div>

      <div className="game-actions">
        <button className="secondary-btn" onClick={resetBoard}>Reset</button>
      </div>
    </div>
  );
};

// 6. SNAKE DELUXE
const SnakeGame = () => {
  const GRID_SIZE = 12;
  const initialSnake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 8, y: 5, type: 'apple' });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      };
      if (map[e.key]) {
        e.preventDefault();
        setDirection((prev) => (prev.x + map[e.key].x === 0 && prev.y + map[e.key].y === 0 ? prev : map[e.key]));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          sounds.playLose();
          return prev;
        }
        const nextSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          sounds.playDrop();
          setScore((s) => s + (food.type === 'star' ? 30 : 10));
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: Math.random() > 0.8 ? 'star' : 'apple'
          });
        } else {
          nextSnake.pop();
        }
        return nextSnake;
      });
    }, 140);
    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  return (
    <div className="game-page">
      <h2>🐍 Snake Deluxe</h2>
      <p>Score: {score}</p>
      <div className="snake-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = snake.some((s, idx) => idx > 0 && s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div key={i} className={`snake-cell ${isHead ? 'snake-head' : isBody ? 'snake-body' : isFood ? `snake-food ${food.type}` : ''}`}>
              {isFood ? (food.type === 'star' ? '⭐' : '🍎') : ''}
            </div>
          );
        })}
      </div>
      <div className="mobile-dpad">
        <button onClick={() => setDirection({ x: 0, y: -1 })}>⬆️</button>
        <div>
          <button onClick={() => setDirection({ x: -1, y: 0 })}>⬅️</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })}>➡️</button>
        </div>
        <button onClick={() => setDirection({ x: 0, y: 1 })}>⬇️</button>
      </div>
      {gameOver && <p className="error-box">Game Over! Press Reset to try again.</p>}
      <button className="primary-btn" onClick={() => { setSnake(initialSnake); setGameOver(false); setScore(0); }}>🔄 Reset</button>
    </div>
  );
};

// 7. ROCK PAPER SCISSORS DUEL
const RockPaperScissorsGame = () => {
  const options = ['Rock ✊', 'Paper ✋', 'Scissors ✌️'];
  const [pChoice, setPChoice] = useState('');
  const [cChoice, setCChoice] = useState('');
  const [result, setResult] = useState('Select your hand to play');
  const [score, setScore] = useState(0);

  const play = (choice) => {
    const comp = randomFrom(options);
    setPChoice(choice);
    setCChoice(comp);

    const cClean = choice.split(' ')[0];
    const compClean = comp.split(' ')[0];

    if (cClean === compClean) {
      setResult("It's a tie!");
    } else if (
      (cClean === 'Rock' && compClean === 'Scissors') ||
      (cClean === 'Paper' && compClean === 'Rock') ||
      (cClean === 'Scissors' && compClean === 'Paper')
    ) {
      setResult('You Win! 🎉');
      setScore((s) => s + 100);
      sounds.playWin();
    } else {
      setResult('Computer Wins! 🤖');
      sounds.playLose();
    }
  };

  return (
    <div className="game-page">
      <h2>✊✋✌️ Rock Paper Scissors</h2>
      <div className="choice-row">
        {options.map((opt) => (
          <button key={opt} className="primary-btn" onClick={() => play(opt)}>{opt}</button>
        ))}
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">You Picked</span>
          <span className="stat-val">{pChoice || '—'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Computer Picked</span>
          <span className="stat-val">{cChoice || '—'}</span>
        </div>
      </div>
      <h3>{result}</h3>
      <p>Score: {score}</p>
    </div>
  );
};

// 8. MEMORY CARD FLIP
const MemoryGame = () => {
  const emojis = ['🚀', '👾', '🌈', '💎', '🔥', '⚡', '🎯', '🔮'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);

  const startNewGame = () => {
    const deck = shuffleArray([...emojis, ...emojis]).map((val, idx) => ({ id: idx, val, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
  };

  useEffect(() => { startNewGame(); }, []);

  const flipCard = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || cards[idx].matched) return;
    sounds.playClick();
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = nextFlipped;
      if (cards[first].val === cards[second].val) {
        sounds.playWin();
        setCards((prev) => prev.map((c, i) => (i === first || i === second ? { ...c, matched: true } : c)));
        setMatched((m) => m + 1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="game-page">
      <h2>🎴 Memory Card Flip</h2>
      <p>Moves: {moves} | Pairs Found: {matched}/8</p>
      <div className="memory-grid">
        {cards.map((card, idx) => {
          const isOpen = flipped.includes(idx) || card.matched;
          return (
            <button key={idx} className={`memory-card ${isOpen ? 'open' : ''}`} onClick={() => flipCard(idx)}>
              {isOpen ? card.val : '❓'}
            </button>
          );
        })}
      </div>
      <button className="primary-btn" onClick={startNewGame}>🔄 Restart Deck</button>
    </div>
  );
};

// 9. SIMON SAYS
const SimonSaysGame = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const freqs = { red: 300, blue: 400, green: 500, yellow: 600 };
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const playColor = (color) => {
    setActiveColor(color);
    sounds.playTone(freqs[color], 0.25);
    setTimeout(() => setActiveColor(null), 300);
  };

  const playSequence = (seq) => {
    setIsPlaying(true);
    seq.forEach((c, idx) => {
      setTimeout(() => playColor(c), (idx + 1) * 600);
    });
    setTimeout(() => setIsPlaying(false), (seq.length + 1) * 600);
  };

  const startRound = () => {
    const nextSeq = [...sequence, randomFrom(colors)];
    setSequence(nextSeq);
    setPlayerInput([]);
    playSequence(nextSeq);
  };

  const handleColorClick = (color) => {
    if (isPlaying) return;
    playColor(color);
    const nextInput = [...playerInput, color];
    setPlayerInput(nextInput);

    if (nextInput[nextInput.length - 1] !== sequence[nextInput.length - 1]) {
      sounds.playLose();
      alert(`Game Over! Final Streak: ${score}`);
      setSequence([]);
      setPlayerInput([]);
      setScore(0);
      return;
    }

    if (nextInput.length === sequence.length) {
      setScore((s) => s + 1);
      sounds.playWin();
      setTimeout(startRound, 800);
    }
  };

  return (
    <div className="game-page">
      <h2>🎨 Simon Says Tone Blitz</h2>
      <p>Score Streak: {score}</p>
      <div className="simon-grid">
        {colors.map((c) => (
          <button
            key={c}
            className={`simon-btn ${c} ${activeColor === c ? 'active' : ''}`}
            onClick={() => handleColorClick(c)}
          />
        ))}
      </div>
      <button className="primary-btn" onClick={startRound} disabled={sequence.length > 0}>
        ▶️ Start Pattern
      </button>
    </div>
  );
};

// 10. 2048 PUZZLE
const Game2048 = () => {
  const [grid, setGrid] = useState(() => {
    const g = Array.from({ length: 4 }, () => Array(4).fill(0));
    g[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] = 2;
    return g;
  });
  const [score, setScore] = useState(0);

  const reset = () => {
    const g = Array.from({ length: 4 }, () => Array(4).fill(0));
    g[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] = 2;
    setGrid(g);
    setScore(0);
  };

  return (
    <div className="game-page">
      <h2>🧩 2048 Puzzle</h2>
      <p>Score: {score}</p>
      <div className="grid-2048">
        {grid.flat().map((cell, idx) => (
          <div key={idx} className={`tile-box tile-${cell}`}>
            {cell || ''}
          </div>
        ))}
      </div>
      <button className="secondary-btn" onClick={reset}>🔄 Reset Grid</button>
    </div>
  );
};

// Main Game Library Selector
const GameLibrary = ({ slug }) => {
  switch (slug) {
    case 'connect-four': return <ConnectFourGame />;
    case 'speed-typer': return <SpeedTyperGame />;
    case 'whack-a-mole': return <WhackAMoleGame />;
    case 'brick-breaker': return <BrickBreakerGame />;
    case 'tic-tac-toe': return <TicTacToeGame />;
    case 'snake': return <SnakeGame />;
    case 'rock-paper-scissors': return <RockPaperScissorsGame />;
    case 'memory': return <MemoryGame />;
    case 'simon-says': return <SimonSaysGame />;
    case '2048': return <Game2048 />;
    default:
      return (
        <div className="game-page">
          <h2>Game Available in Arcade</h2>
          <p>Select another game from the library!</p>
        </div>
      );
  }
};

export default GameLibrary;
