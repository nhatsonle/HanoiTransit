import SimpleMapViewer from './SimpleMapViewer';

export default function LineInfoPanel({ line }) {
  if (!line) {
    return <p>Chọn tuyến để xem thông tin chi tiết.</p>;
  }

  const coordinates = line.stops?.map((stop) => ({
    stopId: stop.id,
    name: stop.name,
    coords: stop.coords,
    type: 'stop'
  }));

  return (
    <div className="line-panel">
      <div className="line-panel__info">
        <h2>{line.name}</h2>
        <p>Loại phương tiện: {line.type === 'train' ? 'Tàu' : 'Xe buýt'}</p>
        <p>Giờ hoạt động: {line.serviceHours}</p>
        <p>Tần suất: {line.frequencyMinutes} phút/chuyến</p>
        <p>Giá vé: {line.fare.toLocaleString()}đ</p>
      </div>
      <div className="line-panel__map">
        <SimpleMapViewer coordinates={coordinates} />
      </div>
      <div className="line-panel__stops">
        <h3>Các điểm dừng</h3>
        <ol>
          {line.stops?.map((stop) => (
            <li key={stop.id}>{stop.name}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

