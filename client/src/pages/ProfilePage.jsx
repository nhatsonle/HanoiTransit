import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, removeFavorite } from '../services/api';

export default function ProfilePage() {
  const { user, isAuthenticated, login, register } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const data = await getFavorites();
        setFavorites(data.favorites);
      } catch (err) {
        setError('Không thể tải danh sách yêu thích.');
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      setMessage('Đăng nhập thành công.');
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xử lý yêu cầu.');
    }
  };

  const handleRemoveFavorite = async (routeId) => {
    try {
      await removeFavorite(routeId);
      setFavorites((prev) => prev.filter((fav) => fav.routeId !== routeId));
    } catch (err) {
      setMessage('Không thể xoá lộ trình.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page auth-page">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
          >
            Đăng ký
          </button>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-row">
              <label htmlFor="name">Họ tên</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          {message && <p className="info-banner">{message}</p>}
          <button type="submit" className="primary-btn">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Xin chào</p>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      </header>

      <section className="card">
        <h2>Lộ trình đã lưu</h2>
        {loading && <p>Đang tải...</p>}
        {!loading && favorites.length === 0 && <p>Chưa có lộ trình nào được lưu.</p>}
        <ul className="favorites-list">
          {favorites.map((fav) => (
            <li key={fav.routeId}>
              <div>
                <strong>{fav.label}</strong>
                <p>Lưu lúc: {new Date(fav.savedAt).toLocaleString()}</p>
              </div>
              <div className="favorite-actions">
                <Link to={`/route/${fav.routeId}`} className="secondary-btn">
                  Xem lại
                </Link>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => handleRemoveFavorite(fav.routeId)}
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

