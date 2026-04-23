import React, { useEffect, useState } from 'react';
import { getByProject, addEntry, deleteEntry } from '../db.js';
import { nowDateTime, fmt, fmtDate, fmtTime } from '../constants.js';
import { Btn, Modal, Input, EmptyState } from '../components/UI.jsx';

export default function MiscTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const data = await getByProject('misc', projectId);
    setItems(data.slice().reverse());
    setLoading(false);
  }

  function openModal() {
    const { date, time } = nowDateTime();
    setForm({ description: '', amount: '', date, time, note: '' });
    setErrors({});
    setShowModal(true);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.amount || isNaN(form.amount)) errs.amount = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await addEntry('misc', {
      project_id: projectId, description: form.description.trim(),
      amount: parseFloat(form.amount), date: form.date, time: form.time, note: form.note.trim(),
    });
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry('misc', id);
    load();
  }

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <Btn fullWidth onClick={openModal} size="lg">+ Add Misc Entry (પરચૂરણ)</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No misc entries" sub="Tap above to add miscellaneous expenses" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((m) => (
            <div key={m.id} style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid #92400E', borderRadius: 'var(--radius-sm)', padding: '12px 14px', position: 'relative', paddingRight: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.description}</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--danger)', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(m.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(m.date)} &nbsp;{fmtTime(m.time)}</span>
                {m.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{m.note}</span>}
              </div>
              <Btn variant="danger" size="sm" style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 8px', fontSize: '11px' }} onClick={() => handleDelete(m.id)}>Delete</Btn>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add Misc / પરચૂરણ" onClose={() => setShowModal(false)}>
          <Input label="Description" value={form.description} onChange={set('description')} placeholder="e.g. Transport, Tools..." error={errors.description} />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" error={errors.amount} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Date" type="date" value={form.date} onChange={set('date')} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} />
          </div>
          <Input label="Note (optional)" value={form.note} onChange={set('note')} placeholder="Any remarks..." />
          <Btn fullWidth size="lg" onClick={handleSave}>Save Entry</Btn>
        </Modal>
      )}
    </div>
  );
}