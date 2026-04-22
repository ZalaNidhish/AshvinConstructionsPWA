import React, { useEffect, useState } from 'react';
import { getByProject, addEntry, deleteEntry } from '../db.js';
import { PAYMENT_MODES, nowDateTime, fmt, fmtDate } from '../constants.js';
import { Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';

export default function PaymentsTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const data = await getByProject('payments', projectId);
    setItems(data.slice().reverse());
    setLoading(false);
  }

  function openModal() {
    const { date, time } = nowDateTime();
    setForm({ amount: '', mode: PAYMENT_MODES[0], date, time, note: '' });
    setErrors({});
    setShowModal(true);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.amount || isNaN(form.amount)) { setErrors({ amount: 'Required' }); return; }
    await addEntry('payments', {
      project_id: projectId, amount: parseFloat(form.amount),
      mode: form.mode, date: form.date, time: form.time, note: form.note.trim(),
    });
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry('payments', id);
    load();
  }

  const modeBadge = { Cash: '#1A6B3A', UPI: '#1A3C6E', Cheque: '#92400E' };

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <Btn fullWidth onClick={openModal} size="lg">+ Add Payment Received</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No payments recorded" sub="Tap above to record client payments" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', position: 'relative', paddingRight: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: modeBadge[p.mode] || '#333', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {p.mode}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(p.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(p.date)} &nbsp;{p.time}</span>
                {p.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{p.note}</span>}
              </div>
              <Btn variant="danger" size="sm" style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 8px', fontSize: '11px' }} onClick={() => handleDelete(p.id)}>Delete</Btn>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Record Payment" onClose={() => setShowModal(false)}>
          <Input label="Amount Received (₹)" type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" error={errors.amount} />
          <Select label="Payment Mode" value={form.mode} onChange={set('mode')} options={PAYMENT_MODES} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Date" type="date" value={form.date} onChange={set('date')} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} />
          </div>
          <Input label="Note (optional)" value={form.note} onChange={set('note')} placeholder="Any remarks..." />
          <Btn fullWidth size="lg" onClick={handleSave}>Save Payment</Btn>
        </Modal>
      )}
    </div>
  );
}
