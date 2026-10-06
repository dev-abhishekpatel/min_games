import { useParams } from 'react-router-dom';
import MemoryGame from '../games/MemoryGame';
import TicTacToe from '../games/TicTacToe';
import RockPaperScissors from '../games/RockPaperScissors';
import NumberGuess from '../games/NumberGuess';

const gamesMap = {
  'tic-tac-toe': TicTacToe,
  'rock-paper-scissors': RockPaperScissors,
  'number-guess': NumberGuess,
  memory: MemoryGame,
};

const GamePage = () => {
  const { slug } = useParams();
  const GameComponent = gamesMap[slug] || null;

  if (!GameComponent) {
    return (
      <div className="page-shell">
        <div className="panel">
          <h2>Game not found</h2>
          <p>This game is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <GameComponent />
    </div>
  );
};

export default GamePage;
