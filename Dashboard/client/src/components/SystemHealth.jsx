import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Battery, Clock } from 'lucide-react';

function fmtUp(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SystemHealth({ voltage }) {
  const rssi = -40 - Math.floor(Math.random() * 30);
  const sigPct = Math.min(100, Math.max(0, ((rssi + 90) / 50) * 100)).toFixed(0);
  const sigClr = sigPct < 40 ? 'var(--red)' : sigPct < 65 ? 'var(--orange)' : 'var(--green)';

  const batPct = voltage ? Math.min(100, Math.max(0, ((voltage - 3.2) / 1.0) * 100)).toFixed(0) : 0;
  const batClr = batPct < 20 ? 'var(--red)' : batPct < 40 ? 'var(--orange)' : 'var(--green)';

  return (
    <div className="card fadein">
      <div className="card-title"><Activity size={16} /> System Health</div>
      <div className="health-rows">
        <div className="health-row">
          <div className="health-left">
            <div className="health-icon" style={{ background: 'var(--green-glow)', color: sigClr }}><Wifi size={14} /></div>
            <div><div className="health-lbl">Signal</div><div className="health-sub">{rssi} dBm</div></div>
          </div>
          <div className="health-val" style={{ color: sigClr }}>{sigPct}%</div>
        </div>

        <div className="health-row">
          <div className="health-left">
            <div className="health-icon" style={{ background: 'var(--orange-glow)', color: batClr }}><Battery size={14} /></div>
            <div><div className="health-lbl">Battery</div><div className="health-sub">{voltage?.toFixed(2) || '--'}V</div></div>
          </div>
          <div className="health-val" style={{ color: batClr }}>{batPct}%</div>
        </div>

        <div style={{ padding: '0 2px' }}>
          <div className="bar-track">
            <div className={`bar-fill ${batPct > 40 ? 'bar-green' : batPct > 20 ? 'bar-orange' : 'bar-red'}`} style={{ width: `${batPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
