import React, { useEffect, useState } from 'react';
import { getAllProjects, saveProject } from '../db.js';
import { PROJECT_STATUSES } from '../constants.js';
import { PageHeader, Card, Badge, Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';

export default function Projects({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', client_name: '', phone: '', address: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const all = await getAllProjects();
    setProjects(all.slice().reverse());
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', client_name: '', phone: '', address: '', status: 'Active' });
    setErrors({});
    setShowModal(true);
  }

  function openEdit(p, e) {
    e.stopPropagation();
    setEditing(p);
    setForm({ name: p.name, client_name: p.client_name, phone: p.phone || '', address: p.address || '', status: p.status });
    setErrors({});
    setShowModal(true);
  }

  async function handleSave() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.client_name.trim()) errs.client_name = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const data = { ...form, name: form.name.trim(), client_name: form.client_name.trim() };
    if (editing) data.id = editing.id;
    await saveProject(data);
    setShowModal(false);
    load();
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 'calc(var(--nav-height) + 20px)' }}>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total`}
        action={<Btn onClick={openNew} size="sm">+ New Project</Btn>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" sub='Tap "+ New Project" to get started' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.map((p) => (
            <Card key={p.id} onClick={() => onNavigate('project-detail', { id: p.id })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>{p.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{p.client_name}</div>
                  {p.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.phone}</div>}
                  {p.address && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.address}</div>}
                </div>
                <Badge status={p.status} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" onClick={(e) => openEdit(p, e)}>Edit</Btn>
                <Btn variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onNavigate('project-detail', { id: p.id }); }}>
                  Open
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          <Input label="Project Name" value={form.name} onChange={set('name')} placeholder="e.g. Sharma Residence" error={errors.name} />
          <Input label="Client Name" value={form.client_name} onChange={set('client_name')} placeholder="Client full name" error={errors.client_name} />
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="Mobile number" />
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Address</label>
            <textarea
              value={form.address}
              onChange={set('address')}
              placeholder="Site / project address"
              rows={2}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', resize: 'vertical', fontFamily: 'Barlow, sans-serif', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <Select label="Status" value={form.status} onChange={set('status')} options={PROJECT_STATUSES} />
          <Btn fullWidth onClick={handleSave} size="lg">{editing ? 'Update Project' : 'Create Project'}</Btn>
        </Modal>
      )}
    </div>
  );
}
