import React, { useEffect, useState } from 'react';
import { getProject } from '../db.js';
import { Badge } from '../components/UI.jsx';
import MaterialsTab from '../components/MaterialsTab.jsx';
import LabourTab from '../components/LabourTab.jsx';
import PaymentsTab from '../components/PaymentsTab.jsx';
import MiscTab from '../components/MiscTab.jsx';
import SummaryTab from '../components/SummaryTab.jsx';

const TABS = [
  { id: 'materials', label: 'Materials' },
  { id: 'labour',    label: 'Labour' },
  { id: 'payments',  label: 'Payments' },
  { id: 'misc',      label: 'Misc' },
  { id: 'summary',   label: 'Summary' },
];

export default function ProjectDetail({ params, onNavigate }) {
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    getProject(params.id).then(setProject);
  }, [params.id]);

  if (!project) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--navy)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => onNavigate('projects')}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          &#8592;
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {project.name}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
            {project.client_name}
            {project.phone && ` · ${project.phone}`}
          </div>
        </div>
        <Badge status={project.status} />
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', overflowX: 'auto', background: '#fff',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '0 0 auto', padding: '12px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--navy)' : 'var(--text-muted)',
                borderBottom: isActive ? '2.5px solid var(--navy)' : '2.5px solid transparent',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
                fontFamily: 'Barlow, sans-serif', letterSpacing: '0.2px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
        {activeTab === 'materials' && <MaterialsTab projectId={project.id} />}
        {activeTab === 'labour'    && <LabourTab    projectId={project.id} />}
        {activeTab === 'payments'  && <PaymentsTab  projectId={project.id} />}
        {activeTab === 'misc'      && <MiscTab      projectId={project.id} />}
        {activeTab === 'summary'   && <SummaryTab   projectId={project.id} />}
      </div>
    </div>
  );
}
