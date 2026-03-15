import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SensorCard from './components/SensorCard';
import CropControl from './components/CropControl';
import SoilTrendChart from './components/SoilTrendChart';
import WeatherAdvisory from './components/WeatherAdvisory';
import IrrigationStatus from './components/IrrigationStatus';
import AlertsPanel from './components/AlertsPanel';
import SystemHealth from './components/SystemHealth';

export default function App() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  const poll = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        axios.get('/api/sensor/latest'),
        axios.get('/api/sensor/alerts')
      ]);
      setData(s.data);
      setAlerts(a.data);
      setOnline(true);
      setUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch sensor data', error);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [poll]);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <div className="loading-msg">Connecting to AgroSmart sensors…</div>
    </div>
  );

  const temp = data?.temperature ?? data?.tomorrow_weather?.temperature ?? null;
  const hum = data?.humidity ?? data?.tomorrow_weather?.humidity ?? null;

  return (
    <div className="app">
      <Header data={data} isOnline={online} alertCount={alerts.length} />

      {updated && (
        <div className="meta-bar">
          Last updated: {updated.toLocaleTimeString()} · Auto-refresh 5s
          {data?.timestamp && <> · Sensor: {new Date(data.timestamp).toLocaleString()}</>}
        </div>
      )}

      {}
      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <SensorCard type="soil" value={data?.soil} unit="%" />
        <SensorCard type="temperature" value={temp} unit="°C" />
        <SensorCard type="humidity" value={hum} unit="%" />
        <SensorCard type="tank" value={data?.distance} unit="cm" />
      </div>

      {}
      <div className="grid grid-3-1" style={{ marginBottom: 14 }}>
        <SoilTrendChart currentSoil={data?.soil} />
        <CropControl />
      </div>

      {}
      <div className="grid grid-4-bottom">
        <WeatherAdvisory weather={data?.tomorrow_weather} />
        <IrrigationStatus relay={data?.relay} />
        <AlertsPanel alerts={alerts} />
        <SystemHealth voltage={data?.voltage} />
      </div>
    </div>
  );
}
