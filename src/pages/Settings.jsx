import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { getPassword, setPassword } from '../components/AppLock.jsx';

export default function Settings() {
  const [mode, setMode] = useState(null); // null | 'change-pin'
  const [step, setStep] = useState('current'); // 'current' | 'new' | 'confirm'
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin]         = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  function resetPinFlow() {
    setMode(null); setStep('current');
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setError(''); setSuccess('');
  }

  function handleChangePinNext() {
    setError('');
    if (step === 'current') {
      if (currentPin !== getPassword()) { setError('Incorrect current PIN'); return; }
      setStep('new');
    } else if (step === 'new') {
      if (!/^\d{4}$/.test(newPin)) { setError('PIN must be exactly 4 digits'); return; }
      setStep('confirm');
    } else if (step === 'confirm') {
      if (confirmPin !== newPin) { setError('PINs do not match'); return; }
      setPassword(newPin);
      setSuccess('PIN changed successfully!');
      setTimeout(resetPinFlow, 1800);
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px', borderRadius: '10px', fontSize: '20px',
    border: '1.5px solid var(--border)', outline: 'none', letterSpacing: '8px',
    textAlign: 'center', boxSizing: 'border-box', background: 'var(--surface)',
    color: 'var(--text-primary)', fontWeight: 700,
  };

  const btnStyle = {
    width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    background: 'var(--navy)', color: '#fff', fontSize: '15px', fontWeight: 700,
    cursor: 'pointer', marginTop: '4px',
  };

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

      {/* App Lock section */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>App Lock</span>
        </div>

        {mode !== 'change-pin' ? (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>PIN Lock</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>App is protected with a 4-digit PIN</p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', background: '#ECFDF5', padding: '3px 10px', borderRadius: '20px', border: '1px solid #A7F3D0' }}>ACTIVE</span>
            </div>
            <button
              onClick={() => { setMode('change-pin'); setStep('current'); setError(''); }}
              style={{ ...btnStyle, background: 'var(--navy)', fontSize: '14px', padding: '11px' }}
            >
              🔑 Change PIN
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px 16px' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
              {['current', 'new', 'confirm'].map((s, i) => (
                <div key={s} style={{
                  height: '4px', borderRadius: '2px', flex: 1,
                  background: ['current', 'new', 'confirm'].indexOf(step) >= i ? 'var(--navy)' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {step === 'current' && (
              <>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Enter Current PIN</p>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="• • • •" value={currentPin}
                  onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  style={inputStyle} autoFocus />
              </>
            )}
            {step === 'new' && (
              <>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Enter New PIN</p>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="• • • •" value={newPin}
                  onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  style={inputStyle} autoFocus />
              </>
            )}
            {step === 'confirm' && (
              <>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Confirm New PIN</p>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="• • • •" value={confirmPin}
                  onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  style={inputStyle} autoFocus />
              </>
            )}

            {error   && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>{error}</p>}
            {success && <p style={{ color: 'var(--success)', fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>{success}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={resetPinFlow} style={{ ...btnStyle, background: 'var(--surface)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', flex: '0 0 80px', marginTop: 0 }}>
                Cancel
              </button>
              <button onClick={handleChangePinNext} style={{ ...btnStyle, flex: 1, marginTop: 0 }}>
                {step === 'confirm' ? 'Save PIN' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>App Info</span>
        </div>
        {[
          ['App Version', '1.0.0'],
          ['Works Offline', 'Enabled'],
          ['Data Storage', 'On-device only'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
        Ashvin Construction &mdash; All data stored privately on your device
      </div>
    </div>
  );
}