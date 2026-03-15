import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';

const ic = { critical: AlertTriangle, warning: AlertCircle, info: Info };

function ago(ts) {
  const s = (Date.now() - new Date(ts)) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function AlertsPanel({ alerts }) {
  return (
    <div className="card fadein">
      <div className="card-title">
        <Bell size={16} /> Alerts
        {alerts.length > 0 && (
          <span style={{
            background: 'var(--red-glow)', color: 'var(--red)',
            padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700
          }}>{alerts.length}</span>
        )}
      </div>
      <div className="alerts-scroll">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={28} style={{ color: 'var(--green)' }} />
            <span>All systems normal</span>
          </div>
        ) : alerts.map((a, i) => {
          const Icon = ic[a.type] || Info;
          return (
            <div key={a.id || i} className="alert-row">
              <div className={`alert-dot ${a.type}`}><Icon size={14} /></div>
              <div className="alert-body">
                <h4>{a.title}</h4>
                <p>{a.message}</p>
              </div>
              <span className="alert-ts">{ago(a.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
