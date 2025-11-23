import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FilterTabs from '../components/FilterTabs';
import RouteSummaryCard from '../components/RouteSummaryCard';
import { findRoutes, saveFavorite } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('fastest');
  const [routes, setRoutes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const searchPayload =
    location.state ||
    JSON.parse(sessionStorage.getItem('last-search') || 'null');

  useEffect(() => {
    if (location.state) {
      sessionStorage.setItem('last-search', JSON.stringify(location.state));
    }
  }, [location.state]);

  useEffect(() => {
    const runSearch = async () => {
      if (!searchPayload?.from || !searchPayload?.to) return;
      try {
        setLoading(true);
        const response = await findRoutes({
          from: searchPayload.from.coords,
          to: searchPayload.to.coords,
        });

        // Xử lý trường hợp đề xuất đi bộ
        if (response.walkingRoute) {
          setSummary({
            from: response.from,
            to: response.to,
            walkingRoute: response.walkingRoute
          });
          setRoutes([]);
        } else {
          setRoutes(response.routes);
          setSummary({ from: response.from, to: response.to });
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Không tìm thấy lộ trình phù hợp. Vui lòng thử lại.'
        );
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [searchPayload]);

  const sortedRoutes = useMemo(() => {
    if (!routes.length) return [];
    const target = routes.find((route) => route.filter === activeFilter);
    if (!target) return routes;
    const others = routes.filter((route) => route.id !== target.id);
    return [target, ...others];
  }, [routes, activeFilter]);

  const handleSaveFavorite = async (routeId) => {
    if (!isAuthenticated) {
      setToast('Bạn cần đăng nhập để lưu lộ trình.');
      navigate('/profile');
      return;
    }
    try {
      await saveFavorite({ routeId });
      setToast('Đã lưu lộ trình vào yêu thích.');
    } catch (err) {
      setToast(err?.response?.data?.message || 'Không thể lưu lộ trình.');
    }
  };

  if (!searchPayload) {
    return (
      <div className="page">
        <p>Vui lòng nhập điểm đi/đến từ trang chủ để xem kết quả.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Từ {summary?.from?.name} đến {summary?.to?.name}</p>
          <h1>Kết quả đề xuất</h1>
        </div>
        {!summary?.walkingRoute && <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />}
      </header>

      {loading && <p>Đang tìm lộ trình tối ưu...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Hiển thị đề xuất đi bộ nếu 2 điểm gần nhau */}
      {summary?.walkingRoute && (
        <div className="info-banner" style={{ padding: '20px', margin: '20px 0' }}>
          <h2>🚶 Đề xuất: Đi bộ</h2>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            {summary.walkingRoute.message}
          </p>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Khoảng cách:</strong> {(summary.walkingRoute.distance * 1000).toFixed(0)} mét</p>
            <p><strong>Thời gian dự kiến:</strong> {summary.walkingRoute.duration} phút</p>
          </div>
          <p style={{ marginTop: '15px', color: '#666' }}>
            💡 Hai địa điểm của bạn nằm rất gần nhau, đi bộ sẽ nhanh và tiện hơn là đi xe buýt.
          </p>
        </div>
      )}

      <div className="results-grid">
        {sortedRoutes.map((route, index) => (
          <RouteSummaryCard
            key={route.id}
            route={route}
            highlight={index === 0}
            onSaveFavorite={handleSaveFavorite}
          />
        ))}
      </div>

      {!loading && !error && !summary?.walkingRoute && sortedRoutes.length === 0 && (
        <p className="info-banner">Không tìm thấy lộ trình phù hợp.</p>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

