import React from 'react';
import logo from '../assets/logo.png';

function SettingRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>{value}</span>
    </div>
  );
}

export default function Settings() {
  return (
    <div style={{ padding: '20px 16px', paddingBottom: 'calc(var(--nav-height) + 20px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>App</p>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy)', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settings</h1>
      </div>

      {/* Logo card */}
      <div style={{
        background: 'linear-gradient(150deg, #0F2547 0%, #1A3C6E 60%, #2563B0 100%)',
        borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center',
        marginBottom: '16px', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'inline-block', marginBottom: '16px' }}>
          <img src={logo} alt="Ashvin Construction" style={{ width: '180px', height: 'auto', display: 'block' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>
          Version 1.0.0
        </p>
      </div>

      {/* Features */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>App Features</span>
        </div>
        <SettingRow label="Works Offline" value="Enabled" />
        <SettingRow label="Local Data Storage" value="IndexedDB" />
        <SettingRow label="Installable as App" value="PWA Ready" />
        <SettingRow label="Data stays on device" value="Private" />
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>App Version</span>
          <span style={{ float: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>1.0.0</span>
        </div>
      </div>

      {/* Install guide */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Install on Android</span>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Open this app in Chrome browser',
            'Tap the 3-dot menu (⋮) in the top right',
            'Tap "Add to Home screen"',
            'Tap "Add" to confirm',
            'App icon will appear on your home screen',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingTop: '2px', lineHeight: '1.4' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
        Ashvin Construction &mdash; All data stored privately on your device
      </div>
    </div>
  );
}
