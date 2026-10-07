import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sounds from '../services/soundEffects';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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
      await register(form);
      navigate('/');
    } catch (err) {
      sounds.playWrong();
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <span className="auth-icon">🚀</span>
          <h2>Join MindFresh</h2>
          <p>Create your arcade account to claim your username</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="input-group">
          <label>Gamer Tag / Username</label>
          <input
            type="text"
            name="username"
            placeholder="e.g. PixelMaster"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

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
          {loading ? '⚡ Creating account...' : '🚀 Register'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
