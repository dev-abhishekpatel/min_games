import { useParams } from 'react-router-dom';
import GameLibrary from '../games/GameLibrary';

const GamePage = () => {
  const { slug } = useParams();

  return (
    <div className="page-shell">
      <GameLibrary slug={slug} />
    </div>
  );
};

export default GamePage;
