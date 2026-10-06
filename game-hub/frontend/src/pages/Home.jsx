import { useEffect, useState } from 'react';
import api from '../services/api';
import GameCard from '../components/GameCard';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get('/games');
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">MindFresh • live fun zone</p>
          <h1>Challenge friends, sharpen skills, and win points.</h1>
          <p className="subtext">
            MindFresh brings together quick arcade games, puzzle challenges, quiz rounds, and real-time multiplayer play in one smart game platform.
          </p>
        </div>
      </section>

      <section className="games-grid">
        {loading ? (
          <div className="loader">Loading games...</div>
        ) : (
          games.map((game) => <GameCard key={game.slug} game={game} />)
        )}
      </section>
    </div>
  );
};

export default Home;
