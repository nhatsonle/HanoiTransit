export default function StepList({ steps }) {
  // Filter out walk steps with 0 distance and no significant wait time
  const filteredSteps = steps.filter((step) => {
    return !(step.lineId === 'walk' && step.distance === 0 && (!step.waitTime || step.waitTime < 1));
  });

  // Format wait time with improved logic
  const formatWaitTime = (status, waitTime) => {
    if (!status && !waitTime) return null;

    // Parse existing status messages
    if (status) {
      if (status.includes('Đúng giờ') || status === 'Đúng giờ') {
        return 'Khởi hành ngay';
      }
      if (status.includes('Sớm')) {
        const match = status.match(/Sớm (\d+)/);
        if (match) {
          return `Thời gian chờ dự kiến: ${match[1]} phút`;
        }
      }
      if (status.includes('Trễ')) {
        const match = status.match(/Trễ (\d+)/);
        if (match) {
          return `Chờ chuyến tiếp theo: ${match[1]} phút`;
        }
      }
    }

    // Use waitTime if provided
    if (waitTime) {
      if (waitTime === 0) return 'Khởi hành ngay';
      return `Thời gian chờ dự kiến: ${waitTime} phút`;
    }

    return status;
  };

  return (
    <ol className="step-list">
      {filteredSteps.map((step, index) => {
        const isWalk = step.lineId === 'walk';
        const isTransfer = step.isTransfer || (index > 0 && !isWalk && filteredSteps[index - 1].lineId !== 'walk');
        const waitTimeText = formatWaitTime(step.status, step.waitTime);

        return (
          <li key={`${step.lineId}-${index}`} className={isTransfer ? 'step-transfer' : ''}>
            {isTransfer && (
              <div className="transfer-header">
                <span className="transfer-icon">🔄</span>
                <strong>Chuyển Tuyến</strong>
              </div>
            )}
            <div className="step-line">
              <span className={`badge badge-${isWalk ? 'walk' : 'transit'}`}>
                {isWalk ? 'Đi bộ' : step.lineName}
              </span>
              <strong>{step.title}</strong>
              <span className="step-meta">
                {step.duration} phút • {step.distance.toFixed(1)} km
              </span>
            </div>
            <p className="step-instruction">{step.instruction}</p>

            <div className="step-details">
              {!isWalk && step.cost > 0 && (
                <span className="step-cost">💰 Giá vé: {step.cost.toLocaleString()}₫</span>
              )}
              {waitTimeText && (
                <span className="step-wait-time">⏱️ {waitTimeText}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

