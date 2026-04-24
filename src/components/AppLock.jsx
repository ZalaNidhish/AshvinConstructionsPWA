import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';

const LOCK_KEY = 'ashvin_app_password';

// ─── SHA-256 hashing (Web Crypto API — available in all modern browsers) ──────

async function sha256(text) {
  const buf    = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash of the default PIN "1981" — pre-computed so first launch works offline.
// If you change the default PIN, update this value:
//   sha256("1981") = "84cbbf9f6a29a4d7a27e5a5fb3d00d7da6a76e72d46bd1cfad5aae3e2e69d390"
const DEFAULT_HASH = 'a78f19952edd18bf02b3c9eb704b088e2120941d6acb22f6f795c42796e60252';

export async function getPasswordHash() {
  const stored = localStorage.getItem(LOCK_KEY);
  if (!stored) return DEFAULT_HASH;
  
  // If it's a plain 4-digit PIN (old format), migrate it to a hash
  if (/^\d{4}$/.test(stored)) {
    const hash = await sha256(stored);
    localStorage.setItem(LOCK_KEY, hash);
    return hash;
  }
  
  return stored;
}

export async function checkPin(pin) {
  const hash    = await sha256(pin);
  const stored  = await getPasswordHash();
  return hash === stored;
}

export async function setPassword(newPin) {
  const hash = await sha256(newPin);
  localStorage.setItem(LOCK_KEY, hash);
}

// ─── AppLock UI ───────────────────────────────────────────────────────────────

export default function AppLock({ onUnlock }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [shake,  setShake]  = useState(false);
  const [error,  setError]  = useState('');
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
    if (value && index === 3) {
      setTimeout(() => verifyPin([...next]), 80);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  async function verifyPin(d) {
    const entered = d.join('');
    const ok      = await checkPin(entered);
    if (ok) {
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
    verifyPin(digits);
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

        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px',
          animation: shake ? 'shake 0.5s ease' : 'none',
        }}>
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

        {error && (
          <p style={{ textAlign: 'center', color: '#FCA5A5', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</p>
        )}

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