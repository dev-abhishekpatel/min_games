import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import sounds from '../services/soundEffects';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, changeTheme, THEMES } = useTheme();
  const [muted, setMuted] = useState(() => sounds.isMuted());
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.playClick();
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => sounds.playClick()}>
          <span className="brand-icon">🎮</span> Mind<span className="brand-highlight">Fresh</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" onClick={() => sounds.playClick()}>🕹️ Home</NavLink>
          <NavLink to="/live" className="live-link" onClick={() => sounds.playClick()}>
            ⚡ Live Arena <span className="pulse-dot" />
          </NavLink>
          <NavLink to="/leaderboard" onClick={() => sounds.playClick()}>🏆 Leaderboard</NavLink>
          {user && <NavLink to="/profile" onClick={() => sounds.playClick()}>👤 Profile</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => sounds.playClick()}>⚙️ Admin</NavLink>}
        </div>

        <div className="nav-actions">
          {/* Theme Selector */}
          <div className="theme-dropdown-wrap">
            <button
              className="theme-toggle-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Change Theme Palette"
            >
              🎨 Theme
            </button>
            {showThemeMenu && (
              <div className="theme-menu">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-opt ${theme === t.id ? 'active' : ''}`}
                    onClick={() => {
                      changeTheme(t.id);
                      setShowThemeMenu(false);
                      sounds.playClick();
                    }}
                  >
                    <span className="theme-color-dot" style={{ background: t.primary }} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button className="sound-toggle-btn" onClick={toggleSound} title="Toggle Audio FX">
            {muted ? '🔇 Muted' : '🔊 Sound ON'}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="secondary-btn" onClick={() => sounds.playClick()}>Login</Link>
              <Link to="/register" className="primary-btn" onClick={() => sounds.playClick()}>Register</Link>
            </>
          ) : (
            <>
              <div className="user-pill">
                ⭐ <strong>{user.username}</strong>
                <span className="lvl-tag">Lvl {user.level || 1}</span>
              </div>
              <button className="secondary-btn logout-btn" onClick={() => { sounds.playClick(); logout(); }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
