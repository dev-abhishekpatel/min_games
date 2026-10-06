import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import GameCard from '../components/GameCard';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const categories = ['All', 'Multiplayer', 'Arcade', 'Reflex', 'Puzzle', 'Memory', 'Word', 'Knowledge'];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [games, activeCategory, searchQuery]);

  return (
    <div className="page-shell">
      <section className="hero hero-neon">
        <div className="hero-content">
          <p className="eyebrow">🚀 MINDFRESH • LIVE GAMING PLATFORM</p>
          <h1>Next-Gen Arcade & Live 1v1 Multiplayer Games</h1>
          <p className="subtext">
            Play 14+ instant games, compete in real-time live duels, track leaderboard rankings, and challenge players worldwide with zero latency.
          </p>
          <div className="hero-cta-row">
            <Link to="/live" className="primary-btn hero-btn">
              ⚡ Launch Live Arena (1v1)
            </Link>
            <a href="#games" className="secondary-btn hero-btn">
              🎮 Browse All 14 Games
            </a>
          </div>
        </div>
      </section>

      {/* Filter & Search Controls */}
      <section id="games" className="filter-section">
        <div className="search-bar-wrap">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search 14+ games by name or category..."
          />
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-grid">
        {loading ? (
          <div className="loader">⚡ Loading Arcade Games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="empty-state">No games found matching your search.</div>
        ) : (
          filteredGames.map((game) => <GameCard key={game.slug} game={game} />)
        )}
      </section>
    </div>
  );
};

export default Home;
