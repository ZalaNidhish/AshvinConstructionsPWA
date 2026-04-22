import React, { useEffect, useState } from 'react';
import { getByProject, addEntry, deleteEntry } from '../db.js';
import { MATERIAL_ITEMS, UNITS, nowDateTime, fmt, fmtDate } from '../constants.js';
import { Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';

export default function MaterialsTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const data = await getByProject('materials', projectId);
    setItems(data.slice().reverse());
    setLoading(false);
  }

  function openModal() {
    const { date, time } = nowDateTime();
    setForm({ item: MATERIAL_ITEMS[0], qty: '', unit: UNITS[0], rate: '', total: '', date, time, note: '' });
    setErrors({});
    setShowModal(true);
  }

  const set = (k) => (e) => {
    setForm((f) => {
      const updated = { ...f, [k]: e.target.value };
      if (k === 'qty' || k === 'rate') {
        const q = parseFloat(k === 'qty' ? e.target.value : f.qty) || 0;
        const r = parseFloat(k === 'rate' ? e.target.value : f.rate) || 0;
        updated.total = q && r ? (q * r).toFixed(2) : '';
      }
      return updated;
    });
  };

  async function handleSave() {
    const errs = {};
    if (!form.qty || isNaN(form.qty)) errs.qty = 'Required';
    if (!form.rate || isNaN(form.rate)) errs.rate = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const qty = parseFloat(form.qty);
    const rate = parseFloat(form.rate);
    await addEntry('materials', {
      project_id: projectId, item: form.item, qty, unit: form.unit,
      rate, total: qty * rate, date: form.date, time: form.time, note: form.note.trim(),
    });
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry('materials', id);
    load();
  }

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <Btn fullWidth onClick={openModal} size="lg">+ Add Material Entry</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No material entries" sub="Tap above to add materials" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((m) => (
            <div key={m.id} style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid var(--navy)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.item}</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(m.total)}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {m.qty} {m.unit} &times; {fmt(m.rate)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(m.date)} &nbsp;{m.time}</span>
                  {m.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '8px' }}>{m.note}</span>}
                </div>
                <Btn variant="danger" size="sm" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => handleDelete(m.id)}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add Material" onClose={() => setShowModal(false)}>
          <Select label="Item" value={form.item} onChange={set('item')} options={MATERIAL_ITEMS} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Quantity" type="number" value={form.qty} onChange={set('qty')} placeholder="0" error={errors.qty} />
            <Select label="Unit" value={form.unit} onChange={set('unit')} options={UNITS} />
          </div>
          <Input label="Rate (per unit)" type="number" value={form.rate} onChange={set('rate')} placeholder="0.00" error={errors.rate} />
          <Input label="Total (auto)" type="number" value={form.total} readOnly placeholder="0.00" style={{ background: 'var(--surface)', cursor: 'default' }} />
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