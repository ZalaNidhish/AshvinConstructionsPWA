import React, { useEffect, useState } from 'react';
import { getByProject } from '../db.js';
import { fmt } from '../constants.js';

function SummaryRow({ label, value, bold, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: bold ? '14px' : '13px', fontWeight: bold ? 700 : 500, color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontSize: bold ? '15px' : '14px', fontWeight: bold ? 800 : 600, color: accent || 'var(--text-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, total }) {
  return (
    <div style={{ background: 'var(--navy)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{title}</span>
      <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(total)}</span>
    </div>
  );
}

export default function SummaryTab({ projectId }) {
  const [data, setData] = useState(null);

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    const [mats, labs, miscs, pays] = await Promise.all([
      getByProject('materials', projectId),
      getByProject('labour', projectId),
      getByProject('misc', projectId),
      getByProject('payments', projectId),
    ]);

    // Group materials by item
    const matGroups = {};
    mats.forEach((m) => { matGroups[m.item] = (matGroups[m.item] || 0) + (m.total || 0); });

    // Group labour by category
    const labGroups = {};
    labs.forEach((l) => { labGroups[l.category] = (labGroups[l.category] || 0) + (l.amount || 0); });

    const totalMat = mats.reduce((a, m) => a + (m.total || 0), 0);
    const totalLab = labs.reduce((a, l) => a + (l.amount || 0), 0);
    const totalMisc = miscs.reduce((a, m) => a + (m.amount || 0), 0);
    const totalExp = totalMat + totalLab + totalMisc;
    const totalRec = pays.reduce((a, p) => a + (p.amount || 0), 0);
    const balance = totalRec - totalExp;

    setData({ matGroups, labGroups, miscs, pays, totalMat, totalLab, totalMisc, totalExp, totalRec, balance });
  }

  if (!data) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Materials breakdown */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <SectionHeader title="Materials" total={data.totalMat} />
        {Object.keys(data.matGroups).length === 0 ? (
          <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>No materials</div>
        ) : Object.entries(data.matGroups).map(([item, total]) => (
          <SummaryRow key={item} label={item} value={fmt(total)} />
        ))}
      </div>

      {/* Labour breakdown */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <SectionHeader title="Labour" total={data.totalLab} />
        {Object.keys(data.labGroups).length === 0 ? (
          <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>No labour entries</div>
        ) : Object.entries(data.labGroups).map(([category, total]) => (
          <SummaryRow key={category} label={category} value={fmt(total)} />
        ))}
      </div>

      {/* Misc breakdown */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <SectionHeader title="Misc / પરચૂરણ" total={data.totalMisc} />
        {data.miscs.length === 0 ? (
          <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>No misc entries</div>
        ) : data.miscs.map((m) => (
          <SummaryRow key={m.id} label={m.description} value={fmt(m.amount)} />
        ))}
      </div>

      {/* Final totals */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--navy)', padding: '10px 14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Final Summary</span>
        </div>
        <SummaryRow label="Total Material Cost" value={fmt(data.totalMat)} bold />
        <SummaryRow label="Total Labour Cost" value={fmt(data.totalLab)} bold />
        <SummaryRow label="Total Misc Cost" value={fmt(data.totalMisc)} bold />
        <div style={{ background: '#FEF9EE', borderBottom: '1px solid var(--border)' }}>
          <SummaryRow label="Total Expense" value={fmt(data.totalExp)} bold accent="var(--danger)" />
        </div>
        <div style={{ background: '#EBF5EE', borderBottom: '1px solid var(--border)' }}>
          <SummaryRow label="Total Received" value={fmt(data.totalRec)} bold accent="var(--success)" />
        </div>
        <div style={{ background: data.balance >= 0 ? '#EBF5EE' : '#FEF2F2', borderBottom: 'none' }}>
          <SummaryRow
            label={data.balance >= 0 ? 'Balance' : 'Balance Due'}
            value={fmt(Math.abs(data.balance))}
            bold
            accent={data.balance >= 0 ? 'var(--success)' : 'var(--danger)'}
          />
        </div>
      </div>

      {/* Payments list */}
      {data.pays.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <SectionHeader title="Payments Received" total={data.totalRec} />
          {data.pays.map((p) => (
            <SummaryRow key={p.id} label={`${p.mode} — ${p.date}`} value={fmt(p.amount)} />
          ))}
        </div>
      )}
    </div>
  );
}