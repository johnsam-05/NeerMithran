import React from 'react';
import { Droplets, Thermometer, Wind, Waves } from 'lucide-react';

const icons = { soil: Droplets, temperature: Thermometer, humidity: Wind, tank: Waves };
const colors = { soil: 'green', temperature: 'orange', humidity: 'blue', tank: 'purple' };
const labels = { soil: 'Soil Moisture', temperature: 'Temperature', humidity: 'Humidity', tank: 'Tank Level' };

function getStatus(type, val) {
  if (val === null || val === undefined) return { text: '--', cls: 'tag-ok' };
  if (type === 'soil') {
    if (val < 30) return { text: 'Low', cls: 'tag-crit' };
    if (val > 70) return { text: 'High', cls: 'tag-warn' };
    return { text: 'Optimal', cls: 'tag-ok' };
  }
  if (type === 'temperature') {
    if (val < 20) return { text: 'Cool', cls: 'tag-cool' };
    if (val > 35) return { text: 'Hot', cls: 'tag-crit' };
    return { text: 'Warm', cls: 'tag-ok' };
  }
  if (type === 'humidity') {
    if (val < 40) return { text: 'Low', cls: 'tag-warn' };
    if (val > 80) return { text: 'High', cls: 'tag-warn' };
    return { text: 'Normal', cls: 'tag-ok' };
  }
  if (type === 'tank') {
    if (val < 20) return { text: 'Critical', cls: 'tag-crit' };
    if (val < 40) return { text: 'Low', cls: 'tag-warn' };
    return { text: 'Sufficient', cls: 'tag-ok' };
  }
  return { text: '--', cls: 'tag-ok' };
}

function barColor(type, val) {
  if (type === 'soil') return val < 30 ? 'bar-red' : val > 70 ? 'bar-orange' : 'bar-green';
  if (type === 'temperature') return val > 35 ? 'bar-red' : val < 20 ? 'bar-blue' : 'bar-orange';
  if (type === 'humidity') return 'bar-blue';
  if (type === 'tank') return val < 20 ? 'bar-red' : val < 40 ? 'bar-orange' : 'bar-purple';
  return 'bar-green';
}

export default function SensorCard({ type, value, unit }) {
  const Icon = icons[type] || Droplets;
  const color = colors[type] || 'green';
  const ok = value !== undefined && value !== null && !isNaN(value);

  let display = ok ? value : null;
  let pct = 0;

  if (ok) {
    if (type === 'soil') pct = value;
    else if (type === 'temperature') pct = Math.min(100, (value / 50) * 100);
    else if (type === 'humidity') pct = value;
    else if (type === 'tank') {
      pct = Math.max(0, Math.min(100, 100 - (value / 200) * 100)); // Just for the progress bar color/width
      display = value; // Keep raw distance for display
    }
  }

  const status = getStatus(type, type === 'tank' && ok ? pct : display);
  const bc = ok ? barColor(type, type === 'tank' ? pct : value) : 'bar-green';

  return (
    <div className="card fadein">
      <div className="sensor-top">
        <div className="sensor-icon" style={{ background: `var(--${color}-glow)`, color: `var(--${color})` }}>
          <Icon size={18} />
        </div>
        <span className="sensor-label">{labels[type]}</span>
      </div>
      <div className="sensor-val" style={{ color: `var(--${color})` }}>
        {display !== null ? (type === 'tank' ? display : Number(display).toFixed(1)) : '--'}
        <span className="u">{unit}</span>
      </div>
      <div className={`tag ${status.cls}`}>{status.text}</div>
      <div className="bar-track">
        <div className={`bar-fill ${bc}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}
