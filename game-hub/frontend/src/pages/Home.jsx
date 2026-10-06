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
          <p className="eyebrow">Multiplayer-ready gaming platform</p>
          <h1>Play, compete, and climb the leaderboard.</h1>
          <p className="subtext">
            A full game hub with auth, profiles, score tracking, and multiple arcade games.
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
