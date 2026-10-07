import { useEffect } from 'react';
import sounds from '../services/soundEffects';

const VictoryModal = ({ title, score, result, message, onPlayAgain, onSaveScore, isSaving }) => {
  const isWin = result === 'win' || result === 'victory' || result === 'win_draw';

  useEffect(() => {
    if (isWin) {
      sounds.playWin();
    } else {
      sounds.playLose();
    }
  }, [isWin]);

  return (
    <div className="modal-backdrop">
      <div className="victory-modal">
        <div className="modal-icon">{isWin ? '🏆' : '💀'}</div>
        <h2 className="modal-title">{isWin ? 'VICTORY!' : 'GAME OVER'}</h2>
        <p className="modal-game-name">{title}</p>
        
        {message && <p className="modal-subtext">{message}</p>}

        <div className="modal-score-box">
          <span className="modal-score-label">FINAL SCORE</span>
          <span className="modal-score-val">{score}</span>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          {onSaveScore && (
            <button className="primary-btn" onClick={onSaveScore} disabled={isSaving || score === 0}>
              {isSaving ? '⏳ Saving...' : '⭐ Save High Score'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
