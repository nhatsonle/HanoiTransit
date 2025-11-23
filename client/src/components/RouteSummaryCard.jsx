import { Link } from 'react-router-dom';

export default function RouteSummaryCard({
  route,
  highlight,
  onSaveFavorite,
}) {
  return (
    <article className={`route-card ${highlight ? 'route-card--active' : ''}`}>
      <header>
        <div>
          <p className="eyebrow">{route.title}</p>
          <h3>{route.from.name} → {route.to.name}</h3>
        </div>
        <span className="duration">{route.summary.totalDuration} phút</span>
      </header>

      <div className="route-meta">
        <span>Chi phí ước tính: {route.summary.totalCost.toLocaleString()}đ</span>
        <span>{route.summary.transfers} lần chuyển tuyến</span>
        {route.summary.startWalkTime > 0 && (
          <span>Đi bộ tới trạm: {route.summary.startWalkTime} phút</span>
        )}
      </div>

      <ul className="segment-list">
        {route.segments.map((segment) => (
          <li key={`${segment.lineId}-${segment.from}-${segment.to}`}>
            <span className={`segment-badge segment-${segment.mode}`}>
              {segment.mode === 'walk' ? 'Đi bộ' : segment.lineName}
            </span>
            <span>{segment.duration} phút</span>
          </li>
        ))}
      </ul>

      <footer>
        <Link to={`/route/${route.id}`} className="secondary-btn">
          Xem chi tiết
        </Link>
        {onSaveFavorite && (
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onSaveFavorite(route.id)}
          >
            Lưu
          </button>
        )}
      </footer>
    </article>
  );
}

