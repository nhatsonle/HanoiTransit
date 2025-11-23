import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SimpleMapViewer from '../components/SimpleMapViewer';
import StepList from '../components/StepList';
import ErrorBoundary from '../components/ErrorBoundary';
import { getRouteDetails, saveFavorite } from '../services/api';

export default function RouteDetailPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    console.log('🔍 RouteDetailPage mounted, routeId:', routeId);

    const loadDetails = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching route details...');
        const data = await getRouteDetails(routeId);
        console.log('✅ Route data received:', data);
        setRoute(data);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading route:', err);
        setError(err?.response?.data?.message || 'Không thể tải chi tiết lộ trình.');
      } finally {
        setLoading(false);
      }
    };

    if (routeId) {
      loadDetails();
    } else {
      setError('Thiếu ID lộ trình');
      setLoading(false);
    }
  }, [routeId]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setToast('Đăng nhập để lưu lộ trình.');
      navigate('/profile');
      return;
    }
    try {
      await saveFavorite({ routeId });
      setToast('Đã lưu vào yêu thích.');
    } catch (err) {
      setToast(err?.response?.data?.message || 'Không thể lưu lộ trình này.');
    }
  };

  console.log('🎨 Rendering RouteDetailPage:', { loading, error, hasRoute: !!route });

  if (loading) {
    console.log('⏳ Showing loading state');
    return <div className="page"><p>Đang tải chi tiết lộ trình...</p></div>;
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return <div className="page"><p className="error-text">{error}</p></div>;
  }

  if (!route) {
    console.log('⚠️ No route data');
    return <div className="page"><p>Không tìm thấy lộ trình.</p></div>;
  }

  console.log('✅ Rendering route details:', {
    from: route.from?.name,
    to: route.to?.name,
    coordinatesCount: route.coordinates?.length,
    geometriesCount: route.geometries?.length,
    stepsCount: route.steps?.length
  });

  const realtimeAvailable = route.steps && route.steps.some((step) => step.status);

  return (
    <div className="page route-detail">
      <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <header className="page-header">
        <div>
          <p className="eyebrow">{route.title}</p>
          <h1>
            {route.from.name} → {route.to.name}
          </h1>
          <p>
            Khởi hành: {new Date(route.summary.departureTime).toLocaleTimeString()} •
            Dự kiến đến: {new Date(route.summary.arrivalTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="detail-actions">
          <button type="button" className="secondary-btn" onClick={handleSave}>
            Lưu lộ trình
          </button>
        </div>
      </header>

      {route.notices && route.notices.length > 0 && (
        <div className="info-banner">
          {route.notices.map((notice, idx) => (
            <p key={idx}>ℹ️ {notice}</p>
          ))}
        </div>
      )}

      <section className="detail-grid">
        <ErrorBoundary>
          <div className="map-container">
            <SimpleMapViewer
              coordinates={route.coordinates || []}
              geometries={route.geometries || []}
              segments={route.segments || []}
            />
          </div>
        </ErrorBoundary>
        <div className="detail-card">
          <h2>Chi tiết từng bước</h2>
          {route.steps && route.steps.length > 0 ? (
            <StepList steps={route.steps} />
          ) : (
            <p>Không có thông tin chi tiết.</p>
          )}
        </div>
      </section>

      {!realtimeAvailable && (
        <p className="info-banner">
          Dữ liệu thời gian thực hiện chưa khả dụng. Hiển thị theo lịch trình cố định.
        </p>
      )}

      <section className="summary-cards">
        <article>
          <h3>Tổng thời gian</h3>
          <p>{route.summary.totalDuration} phút</p>
        </article>
        <article>
          <h3>Chi phí ước tính</h3>
          <p>{route.summary.totalCost.toLocaleString()}₫</p>
        </article>
        <article>
          <h3>Số lần chuyển tuyến</h3>
          <p>{route.summary.transfers}</p>
        </article>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

