import { useState } from 'react';
import api from '../services/api';

const Admin = () => {
  const [form, setForm] = useState({ slug: '', name: '', description: '', category: 'Arcade', difficulty: 'easy', players: 1 });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/admin/games', {
        ...form,
        players: Number(form.players),
      });
      setMessage(`Game created: ${data.name}`);
      setForm({ slug: '', name: '', description: '', category: 'Arcade', difficulty: 'easy', players: 1 });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create game.');
    }
  };

  return (
    <div className="page-shell">
      <section className="panel admin-panel">
        <h2>Admin Dashboard</h2>
        {message && <div className="success-box">{message}</div>}
        <form onSubmit={handleSubmit} className="admin-form">
          <input name="slug" value={form.slug} placeholder="Slug" onChange={handleChange} required />
          <input name="name" value={form.name} placeholder="Game name" onChange={handleChange} required />
          <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} />
          <input name="category" value={form.category} placeholder="Category" onChange={handleChange} />
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input type="number" name="players" min="1" max="10" value={form.players} onChange={handleChange} />
          <button type="submit" className="primary-btn">Create Game</button>
        </form>
      </section>
    </div>
  );
};

export default Admin;
