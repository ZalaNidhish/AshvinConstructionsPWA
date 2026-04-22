import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

export default function Splash({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1600);
    const t2 = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #0F2547 0%, #1A3C6E 60%, #2563B0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1, transition: 'opacity 0.5s ease',
      userSelect: 'none',
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'linear-gradient(var(--white) 1px, transparent 1px), linear-gradient(90deg, var(--white) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div style={{
        background: '#fff', borderRadius: '24px', padding: '28px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)', textAlign: 'center',
        maxWidth: '280px', width: '85%', position: 'relative',
      }}>
        <img
          src={logo}
          alt="Ashvin Construction"
          style={{ width: '100%', maxWidth: '220px', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>
          Construction Management
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'rgba(255,255,255,0.15)',
      }}>
        <div style={{
          height: '100%', background: 'rgba(255,255,255,0.7)',
          animation: 'loadBar 1.8s ease-out forwards',
        }} />
      </div>
      <style>{`@keyframes loadBar { from { width:0 } to { width:100% } }`}</style>
    </div>
  );
}
