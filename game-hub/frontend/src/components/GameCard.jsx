import { Link } from 'react-router-dom';

const GameCard = ({ game }) => (
  <div className="game-card">
    <div className="game-card-top">
      <span className="tag">{game.category}</span>
      <span className="difficulty">{game.difficulty}</span>
    </div>
    <h3>{game.name}</h3>
    <p>{game.description}</p>
    <div className="meta-row">
      <span>{game.players} player{game.players > 1 ? 's' : ''}</span>
      <span>{game.active ? 'Active' : 'Coming soon'}</span>
    </div>
    <Link to={`/games/${game.slug}`} className="primary-btn">Play Now</Link>
  </div>
);

export default GameCard;
