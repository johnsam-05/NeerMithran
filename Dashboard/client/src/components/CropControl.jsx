import React, { useState } from 'react';
import { Sprout, Droplets, Calendar } from 'lucide-react';

const crops = {
  Tomato:    { water: '2.5 L/day', growth: '60-85 days', soil: '60-80%', icon: '🍅' },
  Potato:    { water: '3.0 L/day', growth: '90-120 days', soil: '55-70%', icon: '🥔' },
  Rice:      { water: '5.0 L/day', growth: '120-150 days', soil: '70-90%', icon: '🌾' },
  Wheat:     { water: '2.0 L/day', growth: '100-130 days', soil: '50-65%', icon: '🌿' },
  Corn:      { water: '3.5 L/day', growth: '60-100 days', soil: '55-75%', icon: '🌽' },
  Cotton:    { water: '4.0 L/day', growth: '150-180 days', soil: '45-65%', icon: '🌿' },
  Sugarcane: { water: '6.0 L/day', growth: '270-365 days', soil: '60-80%', icon: '🎋' },
  Soybean:   { water: '2.5 L/day', growth: '80-120 days', soil: '50-70%', icon: '🫘' },
};

export default function CropControl() {
  const [sel, setSel] = useState('Tomato');
  const c = crops[sel];

  return (
    <div className="card fadein">
      <div className="card-title">
        <Sprout size={16} />
        Crop Control
        <span style={{ marginLeft: 'auto', fontSize: 20 }}>{c.icon}</span>
      </div>
      <select className="crop-select" value={sel} onChange={e => setSel(e.target.value)}>
        {Object.keys(crops).map(n => <option key={n} value={n}>{crops[n].icon} {n}</option>)}
      </select>
      <div className="crop-grid">
        <div className="crop-slot">
          <label><Droplets size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />Water Need</label>
          <span style={{ color: 'var(--blue)' }}>{c.water}</span>
        </div>
        <div className="crop-slot">
          <label><Calendar size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />Growth Period</label>
          <span style={{ color: 'var(--green)' }}>{c.growth}</span>
        </div>
        <div className="crop-slot crop-full">
          <label>Optimal Soil Moisture</label>
          <span style={{ color: 'var(--purple)' }}>{c.soil}</span>
        </div>
      </div>
    </div>
  );
}
