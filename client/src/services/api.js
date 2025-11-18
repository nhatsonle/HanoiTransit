import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

const unwrap = (promise) => promise.then((res) => res.data);

export const findRoutes = (payload) =>
  unwrap(apiClient.post('/route/find', payload));

export const getRouteDetails = (routeId) =>
  unwrap(apiClient.get('/route/details', { params: { id: routeId } }));

export const getNearbyStops = (coords) =>
  unwrap(apiClient.get('/nearby', { params: coords }));

export const searchLines = (query) =>
  unwrap(apiClient.get('/search/line', { params: { q: query } }));

export const getLineDetails = (id) =>
  unwrap(apiClient.get('/search/line/details', { params: { id } }));

export const register = (payload) =>
  unwrap(apiClient.post('/auth/register', payload));

export const login = (payload) =>
  unwrap(apiClient.post('/auth/login', payload));

export const getFavorites = () => unwrap(apiClient.get('/user/favorites'));

export const saveFavorite = (payload) =>
  unwrap(apiClient.post('/user/favorites', payload));

export const removeFavorite = (routeId) =>
  unwrap(apiClient.delete('/user/favorites', { params: { id: routeId } }));

export default apiClient;

