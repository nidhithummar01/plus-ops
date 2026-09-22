import { useState } from 'react';
import { LayoutDashboard, Activity, AlertTriangle, Bell, BarChart2, Plug, Settings, ChevronRight, Zap } from 'lucide-react';

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard',    id: 'dashboard' },
  { icon: Activity,        label: 'Operations',   id: 'operations' },
  { icon: AlertTriangle,   label: 'Incidents',    id: 'incidents' },
  { icon: Bell,            label: 'Alerts',       id: 'alerts',   badge: 2 },
  { icon: BarChart2,       label: 'Analytics',    id: 'analytics' },
  { icon: Plug,            label: 'Integrations', id: 'integrations' },
  { icon: Settings,        label: 'Settings',     id: 'settings' },
];

export default function Sidebar({ active, onNav }) {
  const [hovered, setHovered] = useState(null);

  return (
    <aside style={{
      width: 236, minHeight: '100vh', background: '#fff',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>

      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-l)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(67,56,202,0.3)',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>PulseOps</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Ops Intelligence</div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-l)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--success-bg)', border: '1px solid var(--success-b)',
          borderRadius: 20, padding: '5px 10px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
            animation: 'pulse-r 2s infinite', flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Live — All systems</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>5s</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--muted-l)',
          letterSpacing: '0.7px', textTransform: 'uppercase', padding: '0 10px 10px',
        }}>Menu</div>

        {nav.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isHov = hovered === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(90deg, #EEF2FF, #F5F3FF)'
                  : isHov ? '#F8FAFC' : 'transparent',
                color: isActive ? '#4338CA' : isHov ? '#1E293B' : '#334155',
                fontWeight: isActive ? 700 : 500, fontSize: 13,
                marginBottom: 2, textAlign: 'left',
                borderLeft: isActive ? '3px solid #4338CA' : '3px solid transparent',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 1px 4px rgba(67,56,202,0.08)' : 'none',
              }}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: '#DC2626', color: '#fff', borderRadius: 9,
                  fontSize: 10, fontWeight: 700, padding: '1px 6px',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.35)',
                }}>{item.badge}</span>
              )}
              {isActive && <ChevronRight size={12} color="#A5B4FC" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-l)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Last sync: 10:42:31 AM</div>
        <div style={{ fontSize: 10, color: 'var(--muted-l)' }}>v1.0.0-poc · PulseOps</div>
      </div>
    </aside>
  );
}
