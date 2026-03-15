import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import axios from 'axios';

const filters = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13,19,33,0.95)', border: '1px solid rgba(0,230,118,0.2)',
      borderRadius: 8, padding: '6px 10px', fontSize: 11, backdropFilter: 'blur(8px)'
    }}>
      <div style={{ color: '#4e5a6e', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#00e676', fontWeight: 700 }}>Soil: {payload[0].value.toFixed(1)}%</div>
    </div>
  );
};

export default function SoilTrendChart({ currentSoil }) {
  const [active, setActive] = useState('1H');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (hours) => {
    setLoading(true);
    try {
      const r = await axios.get(`/api/sensor/history?hours=${hours}`);
      setData(r.data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        soil: d.soil
      })));
    } catch {
      const mock = [];
      const now = Date.now();
      for (let i = hours * 6; i >= 0; i--) {
        mock.push({
          time: new Date(now - i * 600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          soil: 40 + Math.random() * 30
        });
      }
      setData(mock);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(filters.find(f => f.label === active)?.hours || 1);
  }, [active]);

  const statusColor = !currentSoil ? 'var(--text-3)' : currentSoil < 30 ? 'var(--red)' : currentSoil > 70 ? 'var(--orange)' : 'var(--green)';
  const statusText = !currentSoil ? '--' : currentSoil < 30 ? 'Low' : currentSoil > 70 ? 'High' : 'Optimal';

  return (
    <div className="card fadein">
      <div className="chart-head">
        <div className="card-title" style={{ marginBottom: 0 }}>
          <TrendingUp size={16} />
          Soil Moisture Trend
        </div>
        <div className="chart-pills">
          {filters.map(f => (
            <button key={f.label} className={`pill ${active === f.label ? 'on' : ''}`} onClick={() => setActive(f.label)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 200 }}>
        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e676" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="time" stroke="#4e5a6e" fontSize={10} tickLine={false} interval="preserveStartEnd" />
              <YAxis stroke="#4e5a6e" fontSize={10} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={60} stroke="rgba(0,230,118,0.25)" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="soil" stroke="#00e676" strokeWidth={2} fill="url(#sg)" dot={false}
                activeDot={{ r: 3, fill: '#00e676', stroke: '#060b18', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-stats">
        <div className="stat-group">
          <label>Current</label>
          <span style={{ color: statusColor }}>{currentSoil?.toFixed(1) || '--'}%</span>
        </div>
        <div className="stat-group">
          <label>Optimal</label>
          <span style={{ color: 'var(--green)' }}>60%</span>
        </div>
        <div className="stat-group">
          <label>Status</label>
          <span style={{ color: statusColor }}>{statusText}</span>
        </div>
      </div>
    </div>
  );
}
