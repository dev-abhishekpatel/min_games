import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import GameCard from '../components/GameCard';
import sounds from '../services/soundEffects';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mf_favs')) || []; } catch { return []; }
  });
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

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

  const toggleFavorite = (slug) => {
    sounds.playClick();
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      localStorage.setItem('mf_favs', JSON.stringify(next));
      return next;
    });
  };

  const categories = ['All', '💋 Spicy & Romance', '🔞 Adult Games', 'Casino', 'Strategy', 'Trivia', '🔥 Hot Games', 'Action', 'Combat', 'Sports', 'Multiplayer', 'Arcade', 'Reflex', 'Puzzle', 'Memory', 'Word', 'Knowledge'];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      let matchesCategory = false;
      if (activeCategory === 'All') {
        matchesCategory = true;
      } else if (activeCategory === '💋 Spicy & Romance') {
        matchesCategory = game.category === 'Spicy & Romance' || game.badge?.includes('SEXY');
      } else if (activeCategory === '🔞 Adult Games') {
        matchesCategory = game.badge?.includes('ADULT') || game.badge?.includes('SEXY') || game.category === 'Spicy & Romance' || game.category === 'Casino' || game.category === 'Strategy' || game.category === 'Trivia';
      } else if (activeCategory === '🔥 Hot Games') {
        matchesCategory = game.badge?.includes('HOT') || game.badge?.includes('SEXY');
      } else {
        matchesCategory = game.category === activeCategory;
      }

      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !showOnlyFavs || favorites.includes(game.slug);
      return matchesCategory && matchesSearch && matchesFav;
    });
  }, [games, activeCategory, searchQuery, showOnlyFavs, favorites]);

  const hotGamesList = useMemo(() => {
    return games.filter((g) => g.badge?.includes('HOT') || g.badge?.includes('ADULT')).slice(0, 3);
  }, [games]);

  return (
    <div className="page-shell">
      {/* Hero Banner */}
      <section className="hero hero-neon">
        <div className="hero-content">
          <p className="eyebrow">✨ MINDFRESH • CASINO, STRATEGY & ADULT ARCADE GAMES</p>
          <h1>High-Stakes Casino, Strategy & 1v1 Games</h1>
          <p className="subtext">
            Play 24+ instant games — Cyber Blackjack 21, Texas Hold’em Poker, Cyber Vault Codebreaker, Pub Trivia, Space Blasters & 1v1 Live Duels!
          </p>

          <div className="stats-pills-row">
            <span className="stat-pill">🃏 Cyber Blackjack 21</span>
            <span className="stat-pill">♦️ Texas Hold'em Poker</span>
            <span className="stat-pill">🔐 Cyber Vault Hacker</span>
            <span className="stat-pill">🍷 Pub Trivia Master</span>
            <span className="stat-pill">⚡ 1v1 Live Arena</span>
          </div>

          <div className="hero-cta-row">
            <Link to="/live" className="primary-btn hero-btn" onClick={() => sounds.playClick()}>
              ⚡ Launch Live Arena (1v1)
            </Link>
            <button className="secondary-btn hero-btn" onClick={() => { setActiveCategory('🔥 Hot Games'); sounds.playClick(); }}>
              🔥 Play Hot Action Games
            </button>
          </div>
        </div>
      </section>

      {/* Featured HOT GAMES Carousel Section */}
      {!loading && hotGamesList.length > 0 && (
        <section className="hot-featured-section">
          <div className="section-title-row">
            <h2>🔥 Hot & Trending Action Games</h2>
            <span className="badge-flame">MOST POPULAR ⚡</span>
          </div>
          <div className="hot-games-row">
            {hotGamesList.map((g) => (
              <div key={g.slug} className="hot-card-mini">
                <span className="hot-mini-badge">{g.badge}</span>
                <h3>{g.name}</h3>
                <p>{g.description}</p>
                <Link to={`/games/${g.slug}`} className="primary-btn play-mini-btn" onClick={() => sounds.playClick()}>
                  ▶️ Play {g.name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter & Search Controls */}
      <section id="games" className="filter-section">
        <div className="search-bar-wrap">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search 20+ games by title, category, or action tag..."
          />
          <button
            className={`fav-filter-btn ${showOnlyFavs ? 'active' : ''}`}
            onClick={() => { setShowOnlyFavs(!showOnlyFavs); sounds.playClick(); }}
            title="Filter Favorites"
          >
            ❤️ {showOnlyFavs ? 'Showing Favorites' : 'Favorites'}
          </button>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); sounds.playClick(); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-grid">
        {loading ? (
          <div className="loader">⚡ Loading 20+ Action & Arcade Games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="empty-state">
            <p>No games found matching your filters.</p>
            <button className="secondary-btn" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setShowOnlyFavs(false); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredGames.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              isFav={favorites.includes(game.slug)}
              onToggleFav={() => toggleFavorite(game.slug)}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default Home;
