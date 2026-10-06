import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

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

const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);
const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const TicTacToeGame = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const status = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (board.every(Boolean)) return 'Draw!';
    return `Next turn: ${xIsNext ? 'X' : 'O'}`;
  }, [board, xIsNext, winner]);

  const handleMove = (index) => {
    if (board[index] || winner) return;
    const nextBoard = [...board];
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);

    const match = WIN_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);

    if (match) {
      const player = xIsNext ? 'X' : 'O';
      setWinner(player);
      setScore((prev) => ({ ...prev, [player]: prev[player] + 1 }));
      return;
    }

    if (nextBoard.every(Boolean)) {
      setWinner('Draw');
      return;
    }

    setXIsNext((prev) => !prev);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'tic-tac-toe',
        score: score.X * 15 + score.O * 10,
        result: winner === 'X' || winner === 'O' ? 'win' : 'draw',
        duration: 60,
      });
      alert('Score saved to MindFresh leaderboard.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Tic Tac Toe</h2>
      <div className="score-row">
        <span>X: {score.X}</span>
        <span>O: {score.O}</span>
      </div>
      <p>{status}</p>
      <div className="tic-board">
        {board.map((cell, index) => (
          <button key={index} className="cell" onClick={() => handleMove(index)}>{cell}</button>
        ))}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={resetBoard}>Reset</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
    </div>
  );
};

const SnakeGame = () => {
  const GRID_SIZE = 8;
  const initialSnake = [
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 3 },
  ];

  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 5, y: 3 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const spawnFood = (currentSnake) => {
    let nextFood;
    do {
      nextFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));
    return nextFood;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      if (map[event.key]) {
        event.preventDefault();
        setDirection((prev) => {
          const next = map[event.key];
          const isOpposite = prev.x + next.x === 0 && prev.y + next.y === 0;
          return isOpposite ? prev : next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };
        const hitWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
        const hitSelf = prevSnake.some((segment, index) => index !== prevSnake.length - 1 && segment.x === head.x && segment.y === head.y);

        if (hitWall || hitSelf) {
          setGameOver(true);
          return prevSnake;
        }

        const nextSnake = [head, ...prevSnake];
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(spawnFood(nextSnake));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [direction, food, gameOver]);

  const resetGame = () => {
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    setFood({ x: 5, y: 3 });
    setGameOver(false);
    setScore(0);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'snake',
        score,
        result: gameOver ? 'lose' : 'win',
        duration: 90,
      });
      alert('Snake score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Snake</h2>
      <p>Score: {score}</p>
      <div className="snake-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
          const isBody = snake.some((segment, idx) => idx > 0 && segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div key={`${x}-${y}`} className={`snake-cell ${isHead ? 'snake-head' : ''} ${isBody ? 'snake-body' : ''} ${isFood ? 'snake-food' : ''}`} />
          );
        })}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={() => setDirection({ x: 1, y: 0 })}>Right</button>
        <button className="secondary-btn" onClick={() => setDirection({ x: -1, y: 0 })}>Left</button>
        <button className="secondary-btn" onClick={() => setDirection({ x: 0, y: -1 })}>Up</button>
        <button className="secondary-btn" onClick={() => setDirection({ x: 0, y: 1 })}>Down</button>
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={resetGame}>Reset</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
      {gameOver && <p>Game over! Press reset to play again.</p>}
    </div>
  );
};

const RockPaperScissorsGame = () => {
  const options = ['Rock', 'Paper', 'Scissors'];
  const [playerChoice, setPlayerChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [result, setResult] = useState('Choose your move');
  const [score, setScore] = useState(0);

  const play = (choice) => {
    const computer = randomFrom(options);
    setPlayerChoice(choice);
    setComputerChoice(computer);

    const outcome = {
      Rock: { Rock: 'draw', Paper: 'lose', Scissors: 'win' },
      Paper: { Rock: 'win', Paper: 'draw', Scissors: 'lose' },
      Scissors: { Rock: 'lose', Paper: 'win', Scissors: 'draw' },
    };

    const nextResult = outcome[choice][computer];
    setResult(nextResult);

    if (nextResult === 'win') setScore((prev) => prev + 100);
    else if (nextResult === 'draw') setScore((prev) => prev + 50);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'rock-paper-scissors',
        score,
        result,
        duration: 20,
      });
      alert('RPS score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Rock Paper Scissors</h2>
      <div className="choice-row">
        {options.map((option) => (
          <button key={option} className="secondary-btn" onClick={() => play(option)}>{option}</button>
        ))}
      </div>
      <p>Player: {playerChoice || '—'}</p>
      <p>Computer: {computerChoice || '—'}</p>
      <p>Result: {result}</p>
      <p>Score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [score, setScore] = useState(0);

  const buildDeck = () =>
    shuffleArray(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
      .map((value, idx) => ({ id: `${value}-${idx}`, value, matched: false }));

  const startNewGame = () => {
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setScore(0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [firstId, secondId] = flipped;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) return;

    if (firstCard.value === secondCard.value) {
      setCards((prev) => prev.map((card) => (card.id === firstId || card.id === secondId ? { ...card, matched: true } : card)));
      setMatched((prev) => prev + 1);
      setScore((prev) => prev + 120);
      setFlipped([]);
    } else {
      setTimeout(() => setFlipped([]), 700);
    }

    setMoves((prev) => prev + 1);
  }, [cards, flipped]);

  const handleFlip = (cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId)) return;
    setFlipped((prev) => [...prev, cardId]);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'memory',
        score,
        result: matched === 8 ? 'win' : 'in-progress',
        duration: 60,
      });
      alert('Memory card score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Memory Card</h2>
      <p>Moves: {moves} | Matched: {matched}/8</p>
      <p>Score: {score}</p>
      <div className="tic-board" style={{ gridTemplateColumns: 'repeat(4, minmax(52px, 1fr))' }}>
        {cards.map((card) => {
          const reveal = flipped.includes(card.id) || card.matched;
          return (
            <button key={card.id} className="cell" onClick={() => handleFlip(card.id)} style={{ background: reveal ? '#2f4d8c' : '#0c182e' }}>
              {reveal ? card.value : '?'}
            </button>
          );
        })}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={startNewGame}>Reset</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
    </div>
  );
};

const QuizGame = () => {
  const questions = [
    { q: 'Which planet is known as the Red Planet?', a: 'Mars', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'] },
    { q: 'Which language runs in a web browser?', a: 'JavaScript', options: ['Python', 'JavaScript', 'C', 'Ruby'] },
    { q: 'What does HTML stand for?', a: 'HyperText Markup Language', options: ['HighText Machine Language', 'HyperText Markup Language', 'HyperTool Multi Language', 'Home Tool Markup Language'] },
  ];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState('');

  const current = questions[index];

  const handleAnswer = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === current.a) setScore((prev) => prev + 100);
  };

  const nextQuestion = () => {
    if (index === questions.length - 1) {
      setIndex(0);
      setAnswered(false);
      setSelected('');
      return;
    }
    setIndex((prev) => prev + 1);
    setAnswered(false);
    setSelected('');
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'quiz',
        score,
        result: score >= 100 ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Quiz score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Quiz</h2>
      <p>Question {index + 1}</p>
      <p>{current.q}</p>
      <div className="choice-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {current.options.map((option) => (
          <button key={option} className="secondary-btn" onClick={() => handleAnswer(option)} style={{ background: selected === option ? '#2f7d5b' : undefined }}>
            {option}
          </button>
        ))}
      </div>
      {answered && <p>{selected === current.a ? 'Correct!' : `Wrong! The answer is ${current.a}.`}</p>}
      <p>Score: {score}</p>
      <div className="game-actions">
        <button className="secondary-btn" onClick={nextQuestion}>Next</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
    </div>
  );
};

const NumberGuessGame = () => {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number between 1 and 100');
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const submitGuess = () => {
    const entered = Number(guess);
    if (!entered || entered < 1 || entered > 100) {
      setMessage('Enter a valid number between 1 and 100');
      return;
    }

    setAttempts((prev) => prev + 1);
    if (entered === target) {
      const bonus = Math.max(50, 200 - attempts * 15);
      setScore(bonus);
      setMessage(`Correct! You solved it in ${attempts + 1} tries. Score: ${bonus}`);
      return;
    }

    setMessage(entered < target ? 'Too low. Try higher.' : 'Too high. Try lower.');
  };

  const resetGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts(0);
    setScore(0);
    setMessage('New number generated. Make a guess.');
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'number-guess',
        score,
        result: message.includes('Correct') ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Number guess score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Number Guessing</h2>
      <input type="number" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Guess" />
      <div className="game-actions">
        <button className="primary-btn" onClick={submitGuess}>Submit</button>
        <button className="secondary-btn" onClick={resetGame}>New Number</button>
      </div>
      <p>{message}</p>
      <p>Attempts: {attempts}</p>
      <p>Score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

const WordScrambleGame = () => {
  const words = ['PLANET', 'ROCKET', 'BREEZE', 'PUZZLE', 'GARDEN'];
  const [word, setWord] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Unscramble the letters');

  const getScrambled = (text) => shuffleArray(text.split('')).join('');

  useEffect(() => {
    const nextWord = randomFrom(words);
    setWord(nextWord);
    setGuess('');
    setMessage(`Unscramble: ${getScrambled(nextWord)}`);
  }, []);

  const checkGuess = () => {
    if (guess.toUpperCase() === word) {
      const nextScore = score + 100;
      setScore(nextScore);
      const nextWord = randomFrom(words);
      setWord(nextWord);
      setGuess('');
      setMessage(`Correct! Next word: ${getScrambled(nextWord)}`);
    } else {
      setMessage('Not quite. Try again!');
    }
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'word-scramble',
        score,
        result: score > 0 ? 'win' : 'attempted',
        duration: 40,
      });
      alert('Word scramble score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Word Scramble</h2>
      <p>{message}</p>
      <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your answer" />
      <div className="game-actions">
        <button className="primary-btn" onClick={checkGuess}>Check</button>
        <button className="secondary-btn" onClick={() => setMessage(`Unscramble: ${getScrambled(word)}`)}>Hint</button>
      </div>
      <p>Score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

const MathChallengeGame = () => {
  const [question, setQuestion] = useState({ a: 3, b: 5, op: '+', answer: 8 });
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('Solve the equation');
  const [score, setScore] = useState(0);

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = randomFrom(ops);
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    let answer = 0;
    if (op === '+') answer = a + b;
    if (op === '-') answer = a - b;
    if (op === '*') answer = a * b;
    setQuestion({ a, b, op, answer });
    setInput('');
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const submitAnswer = () => {
    const value = Number(input);
    if (value === question.answer) {
      setScore((prev) => prev + 50);
      setMessage('Correct! Great job.');
    } else {
      setMessage(`Wrong! ${question.a} ${question.op} ${question.b} = ${question.answer}`);
    }
    generateQuestion();
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'math-challenge',
        score,
        result: score > 0 ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Math challenge score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Math Challenge</h2>
      <p>{question.a} {question.op} {question.b} = ?</p>
      <input type="number" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Your answer" />
      <div className="game-actions">
        <button className="primary-btn" onClick={submitAnswer}>Check</button>
        <button className="secondary-btn" onClick={generateQuestion}>Next</button>
      </div>
      <p>{message}</p>
      <p>Score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

const SimonSaysGame = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showing, setShowing] = useState(false);
  const [score, setScore] = useState(0);

  const pushSequence = () => {
    const next = [...sequence, randomFrom(colors)];
    setSequence(next);
    setPlayerSequence([]);
    setShowing(true);
    setTimeout(() => setShowing(false), 700 + next.length * 180);
  };

  useEffect(() => {
    setSequence([randomFrom(colors)]);
    setShowing(true);
    setTimeout(() => setShowing(false), 600);
  }, []);

  const handleColorClick = (color) => {
    if (showing) return;
    const updated = [...playerSequence, color];
    setPlayerSequence(updated);

    if (updated[updated.length - 1] !== sequence[updated.length - 1]) {
      setMessage('Game over! You missed the pattern.');
      setScore(0);
      setSequence([randomFrom(colors)]);
      setPlayerSequence([]);
      return;
    }

    if (updated.length === sequence.length) {
      setScore((prev) => prev + 80);
      setTimeout(pushSequence, 500);
    }
  };

  const [message, setMessage] = useState('Watch the pattern');

  return (
    <div className="game-page">
      <h2>Simon Says</h2>
      <p>{message}</p>
      <p>Score: {score}</p>
      <div className="simon-grid">
        {colors.map((color) => (
          <button key={color} className="simon-button" style={{ background: color }} onClick={() => handleColorClick(color)}>
            {color}
          </button>
        ))}
      </div>
      <div className="game-actions">
        <button className="primary-btn" onClick={pushSequence}>Start Round</button>
      </div>
    </div>
  );
};

const createEmptyGrid = () => Array.from({ length: 4 }, () => Array(4).fill(0));

const addRandomTile = (grid) => {
  const emptyPositions = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) emptyPositions.push({ rowIndex, colIndex });
    });
  });

  if (!emptyPositions.length) return grid;
  const target = randomFrom(emptyPositions);
  const nextGrid = grid.map((row) => [...row]);
  nextGrid[target.rowIndex][target.colIndex] = Math.random() > 0.9 ? 4 : 2;
  return nextGrid;
};

const slideLine = (line) => {
  const numbers = line.filter(Boolean);
  const merged = [];
  let scoreGain = 0;

  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] === numbers[i + 1]) {
      const combined = numbers[i] * 2;
      merged.push(combined);
      scoreGain += combined;
      i += 1;
    } else {
      merged.push(numbers[i]);
    }
  }

  while (merged.length < 4) merged.push(0);
  return { line: merged, scoreGain };
};

const move2048 = (grid, direction) => {
  const nextGrid = grid.map((row) => [...row]);
  let totalGain = 0;

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < 4; row += 1) {
      const original = [...nextGrid[row]];
      const line = direction === 'left' ? original : [...original].reverse();
      const { line: moved, scoreGain } = slideLine(line);
      totalGain += scoreGain;
      nextGrid[row] = direction === 'left' ? moved : [...moved].reverse();
    }
  } else {
    for (let col = 0; col < 4; col += 1) {
      const line = [nextGrid[0][col], nextGrid[1][col], nextGrid[2][col], nextGrid[3][col]];
      const ordered = direction === 'up' ? line : [...line].reverse();
      const { line: moved, scoreGain } = slideLine(ordered);
      totalGain += scoreGain;
      const restored = direction === 'up' ? moved : [...moved].reverse();
      for (let row = 0; row < 4; row += 1) nextGrid[row][col] = restored[row];
    }
  }

  return { grid: nextGrid, totalGain };
};

const Game2048 = () => {
  const [grid, setGrid] = useState(() => addRandomTile(addRandomTile(createEmptyGrid())));
  const [score, setScore] = useState(0);

  const handleMove = (direction) => {
    const { grid: nextGrid, totalGain } = move2048(grid, direction);
    if (JSON.stringify(nextGrid) === JSON.stringify(grid)) return;
    setGrid(addRandomTile(nextGrid));
    setScore((prev) => prev + totalGain);
  };

  const resetGame = () => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
    setScore(0);
  };

  return (
    <div className="game-page">
      <h2>2048</h2>
      <p>Score: {score}</p>
      <div className="grid-2048">
        {grid.flat().map((cell, index) => (
          <div key={index} className="tile-box">{cell || ''}</div>
        ))}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={() => handleMove('up')}>Up</button>
        <button className="secondary-btn" onClick={() => handleMove('left')}>Left</button>
        <button className="secondary-btn" onClick={() => handleMove('right')}>Right</button>
        <button className="secondary-btn" onClick={() => handleMove('down')}>Down</button>
      </div>
      <button className="primary-btn" onClick={resetGame}>Reset</button>
    </div>
  );
};

const GameLibrary = ({ slug }) => {
  switch (slug) {
    case 'tic-tac-toe':
      return <TicTacToeGame />;
    case 'snake':
      return <SnakeGame />;
    case 'rock-paper-scissors':
      return <RockPaperScissorsGame />;
    case 'memory':
      return <MemoryGame />;
    case 'quiz':
      return <QuizGame />;
    case 'number-guess':
      return <NumberGuessGame />;
    case 'word-scramble':
      return <WordScrambleGame />;
    case 'math-challenge':
      return <MathChallengeGame />;
    case 'simon-says':
      return <SimonSaysGame />;
    case '2048':
      return <Game2048 />;
    default:
      return (
        <div className="game-page">
          <h2>Game not found</h2>
          <p>This game is not available in MindFresh yet.</p>
        </div>
      );
  }
};

export default GameLibrary;
