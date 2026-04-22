import React, { useEffect, useState } from 'react';
import { getAllProjects, getByProject } from '../db.js';
import { fmt } from '../constants.js';
import { PageHeader, StatCard, Card, Badge, EmptyState } from '../components/UI.jsx';

export default function Dashboard({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const all = await getAllProjects();
    setProjects(all);
    const s = await Promise.all(
      all.slice().reverse().slice(0, 6).map(async (p) => {
        const [mats, labs, miscs, pays] = await Promise.all([
          getByProject('materials', p.id),
          getByProject('labour', p.id),
          getByProject('misc', p.id),
          getByProject('payments', p.id),
        ]);
        const expense =
          mats.reduce((a, m) => a + (m.total || 0), 0) +
          labs.reduce((a, l) => a + (l.amount || 0), 0) +
          miscs.reduce((a, m) => a + (m.amount || 0), 0);
        const received = pays.reduce((a, p) => a + (p.amount || 0), 0);
        return { ...p, expense, received, balance: received - expense };
      })
    );
    setSummaries(s);
    setLoading(false);
  }

  const active = projects.filter((p) => p.status === 'Active').length;
  const completed = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 'calc(var(--nav-height) + 20px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy)', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
        <StatCard label="Total" value={projects.length} sub="Projects" accent="var(--navy)" />
        <StatCard label="Active" value={active} sub="In Progress" accent="var(--blue)" />
        <StatCard label="Done" value={completed} sub="Completed" accent="var(--success)" />
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
          Recent Projects
        </span>
        <button onClick={() => onNavigate('projects')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          View All
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : summaries.length === 0 ? (
        <EmptyState title="No projects yet" sub="Tap Projects to create your first project" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {summaries.map((p) => (
            <Card key={p.id} onClick={() => onNavigate('project-detail', { id: p.id })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.client_name}</div>
                </div>
                <Badge status={p.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Expense', value: fmt(p.expense), color: 'var(--danger)' },
                  { label: 'Received', value: fmt(p.received), color: 'var(--success)' },
                  { label: 'Balance', value: fmt(Math.abs(p.balance)), color: p.balance >= 0 ? 'var(--success)' : 'var(--danger)' },
                ].map((col) => (
                  <div key={col.label} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '8px 10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>{col.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: col.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{col.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
