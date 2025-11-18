export default function StepList({ steps = [] }) {
  if (!steps.length) {
    return <p>Không có dữ liệu chi tiết cho lộ trình này.</p>;
  }

  return (
    <ol className="step-list">
      {steps.map((step, index) => (
        <li key={`${step.lineId}-${index}`}>
          <div className="step-line">
            <span className={`badge badge-${step.lineId === 'walk' ? 'walk' : 'transit'}`}>
              {step.lineId === 'walk' ? 'Đi bộ' : step.lineName}
            </span>
            <strong>{step.title}</strong>
            <span className="step-meta">
              {step.duration} phút · {step.distance.toFixed(1)} km
            </span>
          </div>
          <p>{step.instruction}</p>
          {step.status && <small className="status">{step.status}</small>}
        </li>
      ))}
    </ol>
  );
}

