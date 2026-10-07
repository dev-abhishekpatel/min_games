import { Link } from 'react-router-dom';
import sounds from '../services/soundEffects';

const GameCard = ({ game, isFav, onToggleFav }) => (
  <div className="game-card">
    <div className="game-card-top">
      <span className="tag">{game.category}</span>
      {game.badge && <span className="game-badge">{game.badge}</span>}
      <span className={`difficulty ${game.difficulty}`}>{game.difficulty}</span>
      <button
        className={`fav-btn ${isFav ? 'active' : ''}`}
        onClick={onToggleFav}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFav ? '❤️' : '🤍'}
      </button>
    </div>

    <h3>{game.name}</h3>
    <p>{game.description}</p>

    <div className="meta-row">
      <span>👥 {game.players === 2 ? '1v1 / Live' : 'Single Player'}</span>
      <span className="status-dot">🟢 Ready</span>
    </div>

    <div className="card-actions">
      <Link
        to={`/games/${game.slug}`}
        className="primary-btn play-card-btn"
        onClick={() => sounds.playClick()}
      >
        ▶️ Play Now
      </Link>
      {game.players === 2 && (
        <Link
          to="/live"
          className="secondary-btn live-card-btn"
          title="Play 1v1 Live Multiplayer"
          onClick={() => sounds.playClick()}
        >
          ⚡ 1v1 Live
        </Link>
      )}
    </div>
  </div>
);

export default GameCard;
