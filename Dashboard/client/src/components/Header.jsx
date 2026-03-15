import React, { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';

const wx = { sunny: '☀️', cloudy: '☁️', partly_cloudy: '⛅', rainy: '🌧️', overcast: '🌥️', stormy: '⛈️' };

export default function Header({ data, isOnline, alertCount }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const state = data?.tomorrow_weather?.state || '';
  const icon = wx[state] || '🌤️';

  return (
    <header className="header fadein">
      <div className="hdr-left">
        <div className="hdr-logo">🌱</div>
        <div>
          <div className="hdr-name">NeerMithran</div>
          <div className="hdr-sub">TerraTechie</div>
        </div>
      </div>
      <div className="hdr-right">
        <div className="hdr-chip">
          <span>{icon}</span>
          <span style={{ textTransform: 'capitalize' }}>{state.replace('_', ' ') || 'N/A'}</span>
        </div>
        <div className="hdr-time">
          <Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.5 }} />
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
        <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
          <span className="pulse-dot" />
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <button className="bell-btn" aria-label="Notifications">
          <Bell size={16} />
          {alertCount > 0 && <span className="bell-count">{alertCount > 9 ? '9+' : alertCount}</span>}
        </button>
      </div>
    </header>
  );
}
