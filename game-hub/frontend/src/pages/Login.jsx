import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sounds from '../services/soundEffects';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      sounds.playClick();
      await login(form);
      navigate('/');
    } catch (err) {
      sounds.playWrong();
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setForm({ email: 'admin@example.com', password: 'admin' });
    sounds.playClick();
  };

  return (
    <div className="page-shell auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <span className="auth-icon">🎮</span>
          <h2>Welcome Back</h2>
          <p>Login to track scores & join Live 1v1 Arena</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="primary-btn full-width" type="submit" disabled={loading}>
          {loading ? '⚡ Signing in...' : '🔑 Login'}
        </button>

        <div className="demo-fill-box">
          <span>Quick Demo Login:</span>
          <button type="button" className="pill-btn demo-btn" onClick={fillDemoAdmin}>
            🚀 Fill Admin Credentials
          </button>
        </div>

        <p className="auth-footer">
          New to MindFresh? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
