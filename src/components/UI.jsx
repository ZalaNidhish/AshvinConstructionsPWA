import React from 'react';

/* ── Badge ──────────────────────────────────────── */
export function Badge({ status }) {
  const styles = {
    Active:    { background: '#EBF2FB', color: '#1A3C6E', border: '1px solid #C4CFDF' },
    Completed: { background: '#EBF5EE', color: '#1A6B3A', border: '1px solid #A7D3B4' },
  };
  const s = styles[status] || styles.Active;
  return (
    <span style={{
      ...s, padding: '3px 10px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

/* ── Button ─────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', fullWidth, style, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Barlow, sans-serif',
    fontWeight: 600, borderRadius: 'var(--radius-sm)', transition: 'all 0.15s', outline: 'none',
    width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.55 : 1,
    letterSpacing: '0.2px',
  };
  const sizes = {
    sm:  { padding: '7px 14px', fontSize: '13px' },
    md:  { padding: '11px 20px', fontSize: '14px' },
    lg:  { padding: '14px 24px', fontSize: '15px' },
  };
  const variants = {
    primary: { background: 'var(--navy)', color: '#fff' },
    secondary: { background: 'transparent', color: 'var(--navy)', border: '1.5px solid var(--navy)' },
    ghost:   { background: 'var(--blue-light)', color: 'var(--navy)' },
    danger:  { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #FECACA' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────── */
export function Input({ label, id, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <input
        id={id}
        style={{
          width: '100%', padding: '11px 13px',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: '15px', color: 'var(--text-primary)',
          background: '#fff', outline: 'none', transition: 'border 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

/* ── Select ─────────────────────────────────────── */
export function Select({ label, id, options, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <select
        id={id}
        style={{
          width: '100%', padding: '11px 13px',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: '15px', color: 'var(--text-primary)',
          background: '#fff', outline: 'none', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A5E78' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center',
          paddingRight: '36px',
        }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

/* ── Card ───────────────────────────────────────── */
export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        padding: '16px', cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow 0.15s, transform 0.1s' : undefined,
        ...style,
      }}
      onMouseDown={onClick ? e => e.currentTarget.style.transform = 'scale(0.99)' : undefined}
      onMouseUp={onClick ? e => e.currentTarget.style.transform = 'scale(1)' : undefined}
    >
      {children}
    </div>
  );
}

/* ── Modal ──────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,37,71,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0', animation: 'fadeIn 0.15s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '520px',
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--navy)', borderRadius: '16px 16px 0 0',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
    </div>
  );
}

/* ── PageHeader ─────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '20px', gap: '12px',
    }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.3px', textTransform: 'uppercase' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── EmptyState ─────────────────────────────────── */
export function EmptyState({ title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid var(--border)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="12" y2="13"/></svg>
      </div>
      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
      {sub && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>{sub}</p>}
    </div>
  );
}

/* ── StatCard ───────────────────────────────────── */
export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '14px 16px', borderTop: `3px solid ${accent || 'var(--navy)'}`,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: accent || 'var(--navy)', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

/* ── Divider ────────────────────────────────────── */
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      {label && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>}
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}
