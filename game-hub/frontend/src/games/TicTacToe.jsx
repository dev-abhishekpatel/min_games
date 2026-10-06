import { useMemo, useState } from 'react';
import api from '../services/api';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const TicTacToe = () => {
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

    const line = WINNING_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);

    if (line) {
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
        score: score.X * 50 + score.O * 25,
        result: winner === 'X' || winner === 'O' ? 'win' : 'draw',
        duration: 45,
      });
      alert('Score saved to profile and leaderboard.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Tic-Tac-Toe</h2>
      <div className="score-row">
        <span>X: {score.X}</span>
        <span>O: {score.O}</span>
      </div>
      <p>{status}</p>
      <div className="tic-board">
        {board.map((cell, index) => (
          <button key={index} className="cell" onClick={() => handleMove(index)}>
            {cell}
          </button>
        ))}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={resetBoard}>Reset</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
    </div>
  );
};

export default TicTacToe;
