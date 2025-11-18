import { useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbyStops } from '../services/api';

export default function NearbyStops({ onSelectStop }) {
  const { requestPosition, loading: geoLoading, error: geoError } = useGeolocation();
  const [stops, setStops] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFindNearby = async () => {
    try {
      setError(null);
      const coords = await requestPosition();
      setLoading(true);
      const response = await getNearbyStops(coords);
      setStops(response.stops);
      setOrigin(response.origin);
    } catch (err) {
      setError(err.message || 'Không thể xác định vị trí của bạn lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <p className="eyebrow">Gợi ý gần bạn</p>
          <h3>Trạm gần đây</h3>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={handleFindNearby}
          disabled={geoLoading || loading}
        >
          {geoLoading || loading ? 'Đang tìm...' : 'Tìm trạm gần đây'}
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}
      {geoError && <p className="error-text">{geoError}</p>}

      <ul className="nearby-list">
        {stops.map((stop) => (
          <li key={stop.id}>
            <div>
              <strong>{stop.name}</strong>
              <p>{stop.distanceText} · {Math.round(stop.walkingDuration)} phút đi bộ</p>
            </div>
            {onSelectStop && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => onSelectStop({ stop, origin })}
              >
                Dẫn đường
              </button>
            )}
          </li>
        ))}
        {!stops.length && <li>Nhấn "Tìm trạm gần đây" để bắt đầu.</li>}
      </ul>
    </section>
  );
}

