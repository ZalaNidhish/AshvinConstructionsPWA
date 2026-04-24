import React, { useEffect, useState } from 'react';
import { getAllProjects, saveProject } from '../db.js';
import { PROJECT_STATUSES } from '../constants.js';
import { PageHeader, Card, Badge, Btn, Modal, Input, Select, EmptyState } from '../components/UI.jsx';
import { exportExcel, exportPDF } from '../utils/exportProject.js';

export default function Projects({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', client_name: '', phone: '', address: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  // Export state
  const [exportProject, setExportProject] = useState(null);
  const [exporting, setExporting] = useState(false);

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

  function openExport(p, e) {
    e.stopPropagation();
    setExportProject(p);
  }

  async function handleExport(format) {
    if (!exportProject) return;
    setExporting(true);
    try {
      if (format === 'excel') {
        await exportExcel(exportProject.id);
      } else {
        await exportPDF(exportProject.id);
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setExportProject(null);
    }
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
                <Btn
                  size="sm"
                  style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
                  onClick={(e) => openExport(p, e)}
                >
                  ↓ Export
                </Btn>
                <Btn variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onNavigate('project-detail', { id: p.id }); }}>
                  Open
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New / Edit project modal */}
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

      {/* Export format picker — bottom sheet */}
      {exportProject && (
        <div
          onClick={() => !exporting && setExportProject(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px 20px 0 0',
              width: '100%', maxWidth: '480px',
              padding: '20px 20px 36px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
            }}
          >
            {/* drag handle */}
            <div style={{ width: 40, height: 4, background: '#DDD', borderRadius: 2, margin: '0 auto 18px' }} />

            <div style={{ marginBottom: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Export Project
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {exportProject.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {exportProject.client_name}
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Choose format
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Excel */}
              <button
                disabled={exporting}
                onClick={() => handleExport('excel')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: exporting ? '#f5f5f5' : '#F0FDF4',
                  border: '1.5px solid #BBF7D0', borderRadius: '12px',
                  padding: '14px 16px', cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.65 : 1, width: '100%', textAlign: 'left',
                  transition: 'opacity 0.15s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                  📊
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#14532D', marginBottom: '3px' }}>Excel (.xlsx)</div>
                  <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>All data — Materials, Labour, Misc, Payments &amp; Summary in separate sheets</div>
                </div>
              </button>

              {/* PDF */}
              <button
                disabled={exporting}
                onClick={() => handleExport('pdf')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: exporting ? '#f5f5f5' : '#FFF7ED',
                  border: '1.5px solid #FED7AA', borderRadius: '12px',
                  padding: '14px 16px', cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.65 : 1, width: '100%', textAlign: 'left',
                  transition: 'opacity 0.15s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#7C2D12', marginBottom: '3px' }}>PDF Report</div>
                  <div style={{ fontSize: '12px', color: '#9A3412', lineHeight: 1.4 }}>Formatted A4 report — easy to share, print or view on mobile</div>
                </div>
              </button>
            </div>

            {exporting ? (
              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                ⏳ Preparing your file…
              </div>
            ) : (
              <button
                onClick={() => setExportProject(null)}
                style={{
                  width: '100%', marginTop: '14px', padding: '12px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600,
                  fontFamily: 'Barlow, sans-serif',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}