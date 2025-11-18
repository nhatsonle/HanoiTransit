const ROUTE_TTL_MS = 1000 * 60 * 30;
const routeCache = new Map();

function saveRoute(route) {
  routeCache.set(route.id, {
    ...route,
    cachedAt: Date.now(),
  });
}

function getRoute(id) {
  const data = routeCache.get(id);
  if (!data) return null;
  if (Date.now() - data.cachedAt > ROUTE_TTL_MS) {
    routeCache.delete(id);
    return null;
  }
  return data;
}

module.exports = {
  saveRoute,
  getRoute,
};

