import React from 'react';
import { CloudSun, Thermometer, Droplets, CloudRain, Info } from 'lucide-react';

const wx = { sunny: '☀️', cloudy: '☁️', partly_cloudy: '⛅', rainy: '🌧️', overcast: '🌥️', stormy: '⛈️' };

export default function WeatherAdvisory({ weather }) {
  if (!weather) return (
    <div className="card fadein">
      <div className="card-title"><CloudSun size={16} /> Tomorrow's Forecast</div>
      <div className="empty-state"><CloudSun size={28} /><span>No forecast data</span></div>
    </div>
  );

  const icon = wx[weather.state] || '🌤️';
  const rainClr = weather.rain_probability > 70 ? 'var(--blue)' : weather.rain_probability > 40 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div className="card fadein">
      <div className="card-title"><CloudSun size={16} /> Tomorrow's Forecast</div>

      <div className="wx-hero">
        <div className="wx-icon">{icon}</div>
        <div className="wx-state">{weather.state?.replace('_', ' ') || 'Unknown'}</div>
      </div>

      <div className="wx-grid">
        <div className="wx-item">
          <label><Thermometer size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />Temp</label>
          <span style={{ color: 'var(--orange)' }}>{weather.temperature?.toFixed(1) || '--'}°C</span>
        </div>
        <div className="wx-item">
          <label><Droplets size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />Humidity</label>
          <span style={{ color: 'var(--blue)' }}>{weather.humidity?.toFixed(0) || '--'}%</span>
        </div>
        <div className="wx-item wx-full">
          <label><CloudRain size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />Rain Probability</label>
          <span style={{ color: rainClr }}>{weather.rain_probability?.toFixed(0) || '--'}%</span>
          <div className="bar-track" style={{ marginTop: 6 }}>
            <div className="bar-fill bar-blue" style={{ width: `${weather.rain_probability || 0}%` }} />
          </div>
        </div>
      </div>

      {weather.advisory && (
        <div className="wx-advisory">
          <Info size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {weather.advisory}
        </div>
      )}
    </div>
  );
}
