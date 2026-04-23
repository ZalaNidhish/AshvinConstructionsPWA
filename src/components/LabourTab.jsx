import React, { useEffect, useState } from 'react';
import { getByProject, addEntry, deleteEntry, updateEntry } from '../db.js';
import { LABOUR_CATEGORIES, nowDateTime, fmt, fmtDate, fmtTime } from '../constants.js';
import { Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';

export default function LabourTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const data = await getByProject('labour', projectId);
    setItems(data.slice().reverse());
    setLoading(false);
  }

  function openModal(entry = null) {
    if (entry) {
      setForm({ category: entry.category, amount: String(entry.amount), date: entry.date, time: entry.time, note: entry.note || '' });
      setEditId(entry.id);
    } else {
      const { date, time } = nowDateTime();
      setForm({ category: LABOUR_CATEGORIES[0], amount: '', date, time, note: '' });
      setEditId(null);
    }
    setErrors({});
    setShowModal(true);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.amount || isNaN(form.amount)) { setErrors({ amount: 'Required' }); return; }
    if (editId) {
      await updateEntry('labour', { id: editId, project_id: projectId, category: form.category, amount: parseFloat(form.amount), date: form.date, time: form.time, note: form.note.trim() });
    } else {
      await addEntry('labour', { project_id: projectId, category: form.category, amount: parseFloat(form.amount), date: form.date, time: form.time, note: form.note.trim() });
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry('labour', id);
    load();
  }

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <Btn fullWidth onClick={() => openModal()} size="lg">+ Add Labour Entry</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No labour entries" sub="Tap above to add labour costs" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((l) => (
            <div key={l.id} style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid var(--blue)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{l.category}</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(l.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(l.date)} &nbsp;{fmtTime(l.time)}</span>
                  {l.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '8px' }}>{l.note}</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn size="sm" style={{ padding: '3px 10px', fontSize: '11px', background: 'var(--navy)', color: '#fff' }} onClick={() => openModal(l)}>Edit</Btn>
                  <Btn variant="danger" size="sm" style={{ padding: '3px 10px', fontSize: '11px' }} onClick={() => handleDelete(l.id)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? "Edit Labour" : "Add Labour"} onClose={() => setShowModal(false)}>
          <Select label="Category" value={form.category} onChange={set('category')} options={LABOUR_CATEGORIES} />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" error={errors.amount} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Date" type="date" value={form.date} onChange={set('date')} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} />
          </div>
          <Input label="Note (optional)" value={form.note} onChange={set('note')} placeholder="Any remarks..." />
          <Btn fullWidth size="lg" onClick={handleSave}>{editId ? 'Update Entry' : 'Save Entry'}</Btn>
        </Modal>
      )}
    </div>
  );
}