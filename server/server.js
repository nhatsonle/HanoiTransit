const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routeRoutes = require('./routes/routeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { getNearbyStops } = require('./controllers/routeController');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: Date.now() })
);

app.use('/api/route', routeRoutes);
app.get('/api/nearby', getNearbyStops);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint không tồn tại' });
});

app.use((err, req, res, next) => {
  /* eslint-disable no-console */
  console.error('Server error:', err);
  res.status(500).json({ message: 'Đã xảy ra lỗi nội bộ.' });
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Mock transit API running on port ${PORT}`);
});

