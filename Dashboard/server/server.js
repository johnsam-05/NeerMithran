require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const SensorReading = require('./models/SensorReading');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let dbConnected = false;
const mongoAtlasUri = process.env.MONGODB_URI;
const localMongoUri = 'mongodb://localhost:27017/neermithran';

const connectDb = async () => {
  const sources = [];
  if (mongoAtlasUri) sources.push({ name: 'Atlas', uri: mongoAtlasUri });
  sources.push({ name: 'Local', uri: localMongoUri });

  for (const src of sources) {
    try {
      await mongoose.connect(src.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ Connected to MongoDB (${src.name})`);
      dbConnected = true;
      return;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection error (${src.name}):`, err.message);
    }
  }

  console.error('❌ All MongoDB connection attempts failed.');
};

app.use('/api/sensor', (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      error: 'Database connection is unavailable. Check MongoDB URI and network settings.'
    });
  }
  next();
});

app.get('/api/sensor/latest', async (req, res) => {
  try {
    const latest = await SensorReading.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No sensor readings found' });
    }
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sensor/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 1;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await SensorReading.find({
      timestamp: { $gte: since }
    })
      .sort({ timestamp: 1 })
      .limit(500)
      .select('soil temperature humidity distance timestamp');

    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sensor/alerts', async (req, res) => {
  try {
    const latest = await SensorReading.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.json([]);
    }

    const alerts = [];
    const now = new Date();

    if (latest.soil < 30) {
      alerts.push({
        id: 1,
        type: 'critical',
        title: 'Low Soil Moisture',
        message: `Soil moisture is critically low at ${latest.soil}%. Irrigation recommended.`,
        timestamp: now
      });
    } else if (latest.soil > 80) {
      alerts.push({
        id: 2,
        type: 'warning',
        title: 'High Soil Moisture',
        message: `Soil moisture is high at ${latest.soil}%. Risk of waterlogging.`,
        timestamp: now
      });
    }

    const tankPercent = Math.max(0, Math.min(100, 100 - (latest.distance / 200) * 100));
    if (tankPercent < 20) {
      alerts.push({
        id: 3,
        type: 'critical',
        title: 'Tank Level Critical',
        message: `Water tank level is critically low at ${tankPercent.toFixed(0)}%.`,
        timestamp: now
      });
    } else if (tankPercent < 40) {
      alerts.push({
        id: 4,
        type: 'warning',
        title: 'Tank Level Low',
        message: `Water tank level is low at ${tankPercent.toFixed(0)}%. Consider refilling.`,
        timestamp: now
      });
    }

    if (latest.temperature > 40) {
      alerts.push({
        id: 5,
        type: 'warning',
        title: 'High Temperature',
        message: `Temperature is high at ${latest.temperature}°C. Crops may be stressed.`,
        timestamp: now
      });
    }

    if (latest.relay === 1) {
      alerts.push({
        id: 6,
        type: 'info',
        title: 'Irrigation Active',
        message: 'The irrigation system is currently running.',
        timestamp: now
      });
    }

    if (latest.tomorrow_weather && latest.tomorrow_weather.rain_probability > 70) {
      alerts.push({
        id: 7,
        type: 'info',
        title: 'Rain Expected Tomorrow',
        message: `${latest.tomorrow_weather.rain_probability}% chance of rain. ${latest.tomorrow_weather.advisory || ''}`,
        timestamp: now
      });
    }

    if (latest.voltage < 3.3) {
      alerts.push({
        id: 8,
        type: 'warning',
        title: 'Low Battery',
        message: `System battery voltage is low at ${latest.voltage}V.`,
        timestamp: now
      });
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 NeerMithran API running on http://localhost:${PORT}`);
    if (!dbConnected) {
      console.warn('⚠️ Server started without DB connection. API endpoints under /api/sensor will return 503 #ServiceUnavailable.');
    }
  });
});
