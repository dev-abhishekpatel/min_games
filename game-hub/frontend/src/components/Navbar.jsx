import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">GameHub</Link>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          {user && <NavLink to="/profile">Profile</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </div>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="secondary-btn">Login</Link>
              <Link to="/register" className="primary-btn">Register</Link>
            </>
          ) : (
            <>
              <span className="user-pill">{user.username}</span>
              <button className="secondary-btn" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
