import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import sounds from '../services/soundEffects';

const AVATARS = ['🎮', '⚡', '🐉', '🤖', '🦊', '👾', '🚀', '🔥', '👑'];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('mf_avatar') || '🎮');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/scores/me');
        setHistory(data);
      } catch (error) {
        console.error('Could not fetch score history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const changeAvatar = (av) => {
    setSelectedAvatar(av);
    localStorage.setItem('mf_avatar', av);
    sounds.playClick();
  };

  const totalPoints = user?.points || 0;
  const currentLvl = user?.level || 1;
  const xpInCurrentLvl = totalPoints % 250;
  const xpProgressPct = Math.min(100, Math.round((xpInCurrentLvl / 250) * 100));

  const totalGames = history.length;
  const bestScore = Math.max(0, ...history.map((h) => Number(h.score) || 0));

  return (
    <div className="page-shell">
      <section className="profile-hero-panel">
        <div className="profile-top">
          <div className="avatar-large">{selectedAvatar}</div>
          <div className="profile-info">
            <h2>{user?.username}</h2>
            <p className="profile-email">📧 {user?.email}</p>
            <span className="role-tag">{user?.role?.toUpperCase()}</span>
          </div>
        </div>

        {/* Avatar Picker */}
        <div className="avatar-picker-row">
          <label>Choose Avatar:</label>
          <div className="avatar-opts">
            {AVATARS.map((av) => (
              <button
                key={av}
                className={`avatar-btn ${selectedAvatar === av ? 'active' : ''}`}
                onClick={() => changeAvatar(av)}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Level & XP Progress Bar */}
        <div className="xp-bar-container">
          <div className="xp-label-row">
            <span>LEVEL {currentLvl} PROGRESS</span>
            <span>{xpInCurrentLvl} / 250 XP</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpProgressPct}%` }} />
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="profile-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Points</span>
          <span className="stat-val">⭐ {totalPoints}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Matches Played</span>
          <span className="stat-val">🎮 {totalGames}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest Score</span>
          <span className="stat-val">🏆 {bestScore}</span>
        </div>
      </section>

      {/* Game History */}
      <section className="panel">
        <h3>📜 Recent Match History</h3>
        {loading ? (
          <p>Loading score history...</p>
        ) : history.length === 0 ? (
          <div className="empty-state">No games played yet. Play a match to record scores!</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.game}</strong></td>
                    <td><span className="pts-highlight">+{item.score}</span></td>
                    <td>
                      <span className={`result-tag ${item.result}`}>
                        {item.result === 'win' ? '🏆 WIN' : '⚡ PLAYED'}
                      </span>
                    </td>
                    <td>{item.duration || 30}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
