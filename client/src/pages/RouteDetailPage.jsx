import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapViewer from '../components/MapViewer';
import StepList from '../components/StepList';
import { getRouteDetails, saveFavorite } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RouteDetailPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await getRouteDetails(routeId);
        setRoute(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải chi tiết lộ trình.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
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

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!route) return <p>Không tìm thấy lộ trình.</p>;

  const realtimeAvailable = route.steps.some((step) => step.status);

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
            Khởi hành: {new Date(route.summary.departureTime).toLocaleTimeString()} ·
            Dự kiến đến: {new Date(route.summary.arrivalTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="detail-actions">
          <button type="button" className="secondary-btn" onClick={handleSave}>
            Lưu lộ trình
          </button>
        </div>
      </header>

      <section className="detail-grid">
        <MapViewer coordinates={route.coordinates} />
        <div className="detail-card">
          <h2>Chi tiết từng bước</h2>
          <StepList steps={route.steps} />
        </div>
      </section>

      {!realtimeAvailable && (
        <p className="info-banner">
          Dữ liệu thời gian thực hiện không khả dụng. Hiển thị theo lịch trình cố định.
        </p>
      )}

      <section className="summary-cards">
        <article>
          <h3>Tổng thời gian</h3>
          <p>{route.summary.totalDuration} phút</p>
        </article>
        <article>
          <h3>Chi phí ước tính</h3>
          <p>{route.summary.totalCost.toLocaleString()}đ</p>
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

