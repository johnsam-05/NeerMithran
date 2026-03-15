const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  distance: { type: Number, required: true },
  voltage: { type: Number, required: true },
  soil: { type: Number, required: true },
  relay: { type: Number, required: true },
  tomorrow_weather: {
    temperature: { type: Number },
    humidity: { type: Number },
    rain_probability: { type: Number },
    state: { type: String },
    advisory: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'sensor_readings'
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
