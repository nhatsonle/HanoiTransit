import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import RouteDetailPage from './pages/RouteDetailPage';
import LineLookupPage from './pages/LineLookupPage';
import ProfilePage from './pages/ProfilePage';
import TestMapPage from './pages/TestMapPage';
import { useAuth } from './contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Tìm lộ trình' },
  { to: '/lines', label: 'Tra cứu tuyến' },
  { to: '/profile', label: 'Trang cá nhân' },
];

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Transit<span>Smart</span>
        </Link>
        <nav>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="auth-cta">
          {user ? (
            <>
              <span className="welcome">Chào, {user.name}</span>
              <button type="button" className="ghost-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/profile" className="primary-btn">
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<SearchResultsPage />} />
          <Route path="/route/:routeId" element={<RouteDetailPage />} />
          <Route path="/lines" element={<LineLookupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/test-map" element={<TestMapPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} TransitSmart. Giả lập dữ liệu phục vụ demo.</p>
      </footer>
    </div>
  );
}

