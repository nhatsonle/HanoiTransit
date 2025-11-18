const { v4: uuidv4 } = require('uuid');
const { planRoute, stops, getStopById } = require('../utils/graph');
const { findNearestStop, haversineDistance } = require('../utils/geo');
const { saveRoute, getRoute } = require('../utils/routeStore');

function buildSegmentSteps(segments) {
  return segments.map((segment) => {
    const fromStop = getStopById(segment.from);
    const toStop = getStopById(segment.to);
    const verb =
      segment.mode === 'walk'
        ? 'Đi bộ'
        : segment.mode === 'train'
        ? 'Đi tàu'
        : 'Đi xe buýt';

    return {
      title: `${verb} ${segment.mode === 'walk' ? '' : segment.lineName}`.trim(),
      instruction:
        segment.mode === 'walk'
          ? `Đi bộ tới ${toStop?.name || 'điểm kế tiếp'}`
          : `Lên tuyến ${segment.lineName} từ ${fromStop?.name} đến ${toStop?.name}`,
      duration: segment.duration,
      cost: segment.cost,
      distance: segment.distance,
      lineId: segment.lineId,
      from: fromStop,
      to: toStop,
      status: segment.mode === 'walk' ? 'Tự di chuyển' : randomStatus(),
    };
  });
}

function randomStatus() {
  const statuses = ['Đúng giờ', 'Trễ 5 phút', 'Sớm 3 phút'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function buildRoutePayload({ filter, planResult, fromStop, toStop }) {
  const id = uuidv4();
  const segments = planResult.segments;
  const steps = buildSegmentSteps(segments);

  const startTime = new Date();
  const totalMinutes = planResult.summary.totalDuration;
  const arrivalTime = new Date(startTime.getTime() + totalMinutes * 60000);

  const route = {
    id,
    filter,
    title:
      filter === 'fastest'
        ? 'Nhanh nhất'
        : filter === 'fewest_transfers'
        ? 'Ít chuyển tuyến'
        : 'Rẻ nhất',
    from: fromStop,
    to: toStop,
    segments,
    steps,
    coordinates: planResult.coordinates,
    summary: {
      ...planResult.summary,
      departureTime: startTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
    },
    notices: [],
  };

  saveRoute(route);
  return route;
}

exports.findRoutes = (req, res) => {
  const { from, to, filter } = req.body || {};

  if (
    !from ||
    !to ||
    typeof from.lat !== 'number' ||
    typeof from.lng !== 'number' ||
    typeof to.lat !== 'number' ||
    typeof to.lng !== 'number'
  ) {
    return res.status(400).json({
      message: 'Vui lòng cung cấp điểm đi và điểm đến hợp lệ.',
    });
  }

  const fromStop = findNearestStop(from);
  const toStop = findNearestStop(to);

  if (!fromStop || !toStop) {
    return res.status(404).json({
      message: 'Không thể xác định trạm phù hợp từ thông tin vị trí.',
    });
  }

  if (fromStop.id === toStop.id) {
    return res.status(400).json({
      message: 'Điểm đi và điểm đến đang trùng nhau.',
    });
  }

  const filters = filter
    ? [filter]
    : ['fastest', 'fewest_transfers', 'cheapest'];

  const results = filters
    .map((criterion) => {
      const planResult = planRoute(fromStop.id, toStop.id, criterion);
      if (!planResult) return null;

      return buildRoutePayload({
        filter: criterion,
        planResult,
        fromStop,
        toStop,
      });
    })
    .filter(Boolean);

  if (!results.length) {
    return res.status(404).json({
      message:
        'Không tìm thấy lộ trình phù hợp. Vui lòng thử lại với địa điểm khác.',
    });
  }

  const summaries = results.map((route) => ({
    id: route.id,
    filter: route.filter,
    title: route.title,
    summary: route.summary,
    from: route.from,
    to: route.to,
    segments: route.segments.map((segment) => ({
      lineId: segment.lineId,
      lineName: segment.lineName,
      mode: segment.mode,
      duration: segment.duration,
      cost: segment.cost,
    })),
  }));

  return res.json({
    from: fromStop,
    to: toStop,
    routes: summaries,
  });
};

exports.getRouteDetails = (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Thiếu id lộ trình' });
  }

  const route = getRoute(id);
  if (!route) {
    return res
      .status(404)
      .json({ message: 'Không tìm thấy thông tin lộ trình.' });
  }

  return res.json(route);
};

exports.getNearbyStops = (req, res) => {
  const { lat, lng } = req.query;
  if (typeof lat === 'undefined' || typeof lng === 'undefined') {
    return res
      .status(400)
      .json({ message: 'Thiếu thông tin vị trí lat & lng.' });
  }

  const coords = { lat: Number(lat), lng: Number(lng) };
  if (Number.isNaN(coords.lat) || Number.isNaN(coords.lng)) {
    return res.status(400).json({ message: 'Toạ độ không hợp lệ.' });
  }

  const nearby = stops
    .map((stop) => {
      const distanceKm = haversineDistance(coords, stop.coords);
      return {
        ...stop,
        distanceKm,
        distanceText:
          distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : `${distanceKm.toFixed(2)} km`,
        walkingDuration: Math.round((distanceKm * 1000) / 80), // 80 m/min walk
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);

  return res.json({ origin: coords, stops: nearby });
};

