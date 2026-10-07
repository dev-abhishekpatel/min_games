import { useEffect, useState } from 'react';
import api from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaders(data);
      } catch (error) {
        console.error('Could not fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const top3 = leaders.slice(0, 3);
  const restLeaders = leaders.slice(3);

  return (
    <div className="page-shell">
      <section className="panel">
        <div className="leader-header">
          <h2>🏆 Global Leaderboard</h2>
          <p>Top players ranked by overall XP score and level progression!</p>
        </div>

        {/* Podium */}
        {!loading && top3.length > 0 && (
          <div className="podium-container">
            {top3[1] && (
              <div className="podium-card silver">
                <span className="podium-badge">🥈 #2</span>
                <h3>{top3[1].username}</h3>
                <p className="podium-pts">{top3[1].points} PTS</p>
                <span className="podium-lvl">Lvl {top3[1].level}</span>
              </div>
            )}
            {top3[0] && (
              <div className="podium-card gold">
                <span className="podium-badge">🥇 CHAMPION #1</span>
                <h3>{top3[0].username}</h3>
                <p className="podium-pts">{top3[0].points} PTS</p>
                <span className="podium-lvl">Lvl {top3[0].level}</span>
              </div>
            )}
            {top3[2] && (
              <div className="podium-card bronze">
                <span className="podium-badge">🥉 #3</span>
                <h3>{top3[2].username}</h3>
                <p className="podium-pts">{top3[2].points} PTS</p>
                <span className="podium-lvl">Lvl {top3[2].level}</span>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Points</th>
                <th>Level</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textCenter: 'center', padding: '24px' }}>⚡ Loading Rankings...</td>
                </tr>
              ) : (
                leaders.map((user, index) => (
                  <tr key={user.id} className={index < 3 ? 'top-row' : ''}>
                    <td>
                      {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                    </td>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td><span className="pts-highlight">{user.points}</span></td>
                    <td><span className="lvl-pill">Lvl {user.level || 1}</span></td>
                    <td><span className="role-tag">{user.role}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
