const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'AI-powered campus placement platform API',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend test route is working',
  });
});

app.use('/api/auth', authRoutes);

module.exports = app;
