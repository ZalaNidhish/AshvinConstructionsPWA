import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';

const LOCK_KEY = 'ashvin_app_password';
const DEFAULT_PASSWORD = '1981';

export function getPassword() {
  return localStorage.getItem(LOCK_KEY) || DEFAULT_PASSWORD;
}

export function setPassword(pwd) {
  localStorage.setItem(LOCK_KEY, pwd);
}

export default function AppLock({ onUnlock }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  function handleDigit(index, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    // Auto-check when last digit entered
    if (value && index === 3) {
      const entered = [...next].join('');
      setTimeout(() => checkPin([...next]), 80);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  function checkPin(d) {
    const entered = d.join('');
    if (entered === getPassword()) {
      onUnlock();
    } else {
      setShake(true);
      setError('Wrong PIN. Try again.');
      setDigits(['', '', '', '']);
      setTimeout(() => {
        setShake(false);
        inputRefs[0].current?.focus();
      }, 600);
    }
  }

  function handleSubmit() {
    if (digits.join('').length < 4) { setError('Enter 4-digit PIN'); return; }
    checkPin(digits);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #0F2547 0%, #1A3C6E 55%, #2563B0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '14px 22px',
          display: 'inline-block', marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <img src={logo} alt="Ashvin Construction" style={{ width: '160px', height: 'auto', display: 'block' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>
          Construction Manager
        </p>
      </div>

      {/* Lock card */}
      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px',
        padding: '32px 28px', width: '100%', maxWidth: '340px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Lock icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ color: '#fff', fontSize: '17px', fontWeight: 700, margin: 0 }}>Enter PIN</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>Enter your 4-digit PIN to continue</p>
        </div>

        {/* PIN dots / inputs */}
        <div
          style={{
            display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px',
            animation: shake ? 'shake 0.5s ease' : 'none',
          }}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: '54px', height: '58px', textAlign: 'center',
                fontSize: '24px', fontWeight: 700, borderRadius: '12px',
                border: `2px solid ${d ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}`,
                background: d ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                color: '#fff', outline: 'none', caretColor: 'transparent',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={{ textAlign: 'center', color: '#FCA5A5', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</p>
        )}

        {/* Unlock button */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #2563B0, #1A3C6E)',
            color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)', letterSpacing: '0.3px',
          }}
        >
          Unlock App
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
