import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sounds from '../services/soundEffects';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🎮</span> Mind<span className="brand-highlight">Fresh</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/">🕹️ Home</NavLink>
          <NavLink to="/live" className="live-link">
            ⚡ Live Arena <span className="pulse-dot" />
          </NavLink>
          <NavLink to="/leaderboard">🏆 Leaderboard</NavLink>
          {user && <NavLink to="/profile">👤 Profile</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">⚙️ Admin</NavLink>}
        </div>

        <div className="nav-actions">
          <button className="sound-toggle-btn" onClick={toggleSound} title="Toggle Audio FX">
            {muted ? '🔇 Sound OFF' : '🔊 Sound ON'}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="secondary-btn">Login</Link>
              <Link to="/register" className="primary-btn">Register</Link>
            </>
          ) : (
            <>
              <span className="user-pill">
                ⭐ {user.username} <small>(Lvl {user.level || 1})</small>
              </span>
              <button className="secondary-btn" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
