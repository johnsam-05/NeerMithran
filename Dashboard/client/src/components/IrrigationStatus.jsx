import React from 'react';
import { Power, Clock, Droplets } from 'lucide-react';

export default function IrrigationStatus({ relay }) {
  const on = relay === 1;

  const nextTime = () => {
    if (on) return 'Running now';
    const d = new Date();
    d.setHours(d.getHours() + 2 + Math.floor(Math.random() * 4), 0, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="card fadein">
      <div className="card-title"><Power size={16} /> Irrigation Status</div>
      <div className="irr-display">
        <div className={`irr-circle ${on ? 'on' : 'off'}`}>{on ? '💧' : '⏸️'}</div>
        <div className={`irr-label ${on ? 'on' : 'off'}`}>{on ? 'Irrigation Active' : 'Standby Mode'}</div>
        <div className="irr-next">
          <Clock size={13} />
          {on ? 'Currently irrigating' : <>Next: <strong style={{ marginLeft: 3 }}>{nextTime()}</strong></>}
        </div>
        {on && <div className="irr-pump-tag"><Droplets size={13} /> Pump running</div>}
      </div>
    </div>
  );
}
