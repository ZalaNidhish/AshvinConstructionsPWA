import React, { useEffect, useState } from 'react';
import { getByProject, addEntry, deleteEntry, updateEntry } from '../db.js';
import { PAYMENT_MODES, nowDateTime, fmt, fmtDate, fmtTime } from '../constants.js';
import { Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';

export default function PaymentsTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const data = await getByProject('payments', projectId);
    setItems(data.slice().reverse());
    setLoading(false);
  }

  function openModal(entry = null) {
    if (entry) {
      setForm({ amount: String(entry.amount), mode: entry.mode, date: entry.date, time: entry.time, note: entry.note || '' });
      setEditId(entry.id);
    } else {
      const { date, time } = nowDateTime();
      setForm({ amount: '', mode: PAYMENT_MODES[0], date, time, note: '' });
      setEditId(null);
    }
    setErrors({});
    setShowModal(true);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.amount || isNaN(form.amount)) { setErrors({ amount: 'Required' }); return; }
    if (editId) {
      await updateEntry('payments', { id: editId, project_id: projectId, amount: parseFloat(form.amount), mode: form.mode, date: form.date, time: form.time, note: form.note.trim() });
    } else {
      await addEntry('payments', { project_id: projectId, amount: parseFloat(form.amount), mode: form.mode, date: form.date, time: form.time, note: form.note.trim() });
    }
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
        <Btn fullWidth onClick={() => openModal()} size="lg">+ Add Payment Received</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No payments recorded" sub="Tap above to record client payments" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: modeBadge[p.mode] || '#333', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {p.mode}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(p.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(p.date)} &nbsp;{fmtTime(p.time)}</span>
                  {p.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '8px' }}>{p.note}</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn size="sm" style={{ padding: '3px 10px', fontSize: '11px', background: 'var(--navy)', color: '#fff' }} onClick={() => openModal(p)}>Edit</Btn>
                  <Btn variant="danger" size="sm" style={{ padding: '3px 10px', fontSize: '11px' }} onClick={() => handleDelete(p.id)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? "Edit Payment" : "Record Payment"} onClose={() => setShowModal(false)}>
          <Input label="Amount Received (₹)" type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" error={errors.amount} />
          <Select label="Payment Mode" value={form.mode} onChange={set('mode')} options={PAYMENT_MODES} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Date" type="date" value={form.date} onChange={set('date')} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} />
          </div>
          <Input label="Note (optional)" value={form.note} onChange={set('note')} placeholder="Any remarks..." />
          <Btn fullWidth size="lg" onClick={handleSave}>{editId ? 'Update Payment' : 'Save Payment'}</Btn>
        </Modal>
      )}
    </div>
  );
}