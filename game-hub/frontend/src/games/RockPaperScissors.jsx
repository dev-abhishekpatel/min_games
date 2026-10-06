import { useMemo, useState } from 'react';
import api from '../services/api';

const options = ['Rock', 'Paper', 'Scissors'];
const outcomeMatrix = {
  Rock: { Rock: 'draw', Paper: 'lose', Scissors: 'win' },
  Paper: { Rock: 'win', Paper: 'draw', Scissors: 'lose' },
  Scissors: { Rock: 'lose', Paper: 'win', Scissors: 'draw' },
};

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);

  const outcome = useMemo(() => {
    if (!playerChoice || !computerChoice) return 'Choose your move';
    return outcomeMatrix[playerChoice][computerChoice];
  }, [playerChoice, computerChoice]);

  const play = (choice) => {
    const randomChoice = options[Math.floor(Math.random() * options.length)];
    setPlayerChoice(choice);
    setComputerChoice(randomChoice);

    const currentResult = outcomeMatrix[choice][randomChoice];
    setResult(currentResult);

    if (currentResult === 'win') {
      setScore((prev) => prev + 100);
    } else if (currentResult === 'draw') {
      setScore((prev) => prev + 50);
    }
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'rock-paper-scissors',
        score,
        result: outcome === 'win' ? 'win' : outcome === 'draw' ? 'draw' : 'lose',
        duration: 15,
      });
      alert('Rock Paper Scissors score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Rock Paper Scissors</h2>
      <div className="choice-row">
        {options.map((option) => (
          <button key={option} className="secondary-btn" onClick={() => play(option)}>
            {option}
          </button>
        ))}
      </div>
      <p>Player: {playerChoice || '—'}</p>
      <p>Computer: {computerChoice || '—'}</p>
      <p>Result: {result || '—'}</p>
      <p>Score: {score}</p>
      <button className="primary-btn" onClick={saveScore}>Save Score</button>
    </div>
  );
};

export default RockPaperScissors;
