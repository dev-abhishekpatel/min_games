import { useState } from 'react';
import api from '../services/api';

const NumberGuess = () => {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const submitGuess = () => {
    const entered = Number(guess);
    if (!entered || entered < 1 || entered > 100) {
      setMessage('Enter a number between 1 and 100.');
      return;
    }

    setAttempts((prev) => prev + 1);
    if (entered === target) {
      const newScore = Math.max(50, 200 - attempts * 15);
      setScore(newScore);
      setMessage(`Correct! You guessed it in ${attempts + 1} tries. Score: ${newScore}`);
    } else if (entered < target) {
      setMessage('Too low. Try a higher number.');
    } else {
      setMessage('Too high. Try a lower number.');
    }
  };

  const resetGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('New number created.');
    setAttempts(0);
    setScore(0);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'number-guess',
        score,
        result: message.includes('Correct') ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Guess game score has been saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Number Guess</h2>
      <p>Guess a number from 1 to 100</p>
      <input type="number" value={guess} onChange={(e) => setGuess(e.target.value)} min="1" max="100" />
      <div className="game-actions">
        <button className="primary-btn" onClick={submitGuess}>Submit Guess</button>
        <button className="secondary-btn" onClick={resetGame}>New Game</button>
      </div>
      <p>{message}</p>
      <p>Current score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

export default NumberGuess;
