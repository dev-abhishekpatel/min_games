import { useEffect, useState } from 'react';
import api from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaders(data);
      } catch (error) {
        console.error('Could not fetch leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="page-shell">
      <section className="panel">
        <h2>Global Leaderboard</h2>
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
              {leaders.map((user, index) => (
                <tr key={user.id}>
                  <td>#{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.points}</td>
                  <td>{user.level}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
