import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/scores/me');
        setHistory(data);
      } catch (error) {
        console.error('Could not fetch score history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="page-shell">
      <section className="profile-card">
        <h2>{user?.username}</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p>Points: {user?.points}</p>
        <p>Level: {user?.level}</p>
      </section>

      <section className="panel">
        <h3>Recent game history</h3>
        {history.length === 0 ? (
          <p>No plays yet.</p>
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
                    <td>{item.game}</td>
                    <td>{item.score}</td>
                    <td>{item.result}</td>
                    <td>{item.duration}s</td>
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
