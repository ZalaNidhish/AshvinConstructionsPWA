/**
 * exportProject.js — Excel (.xlsx) + PDF export for construction projects.
 *
 * PDF FIX: jsPDF only supports Latin fonts by default — Gujarati characters
 * become boxes. We map every known Gujarati string (material items, labour
 * categories) to a readable English/transliterated label for PDF only.
 * Excel keeps the original Unicode because SheetJS writes UTF-8 natively.
 *
 * EXCEL: styled with SheetJS cell styles (fill, font, border, alignment).
 */

import { getProject, getByProject } from '../db.js';
import { fmt, fmtDate } from '../constants.js';

// ─── CDN loader ──────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadXLSX() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  return window.XLSX;
}

async function loadJsPDF() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  return window.jspdf.jsPDF;
}

// ─── Gujarati → English label map (for PDF rendering) ────────────────────────

const GUJ_LABELS = {
  // Materials
  'રેતી':               'Sand (Reti)',
  'કપચી':              'Gravel (Kapchi)',
  'સિમેન્ટ':           'Cement',
  'લોખંડ':             'Steel (Lokhad)',
  'પથ્થર':             'Stone (Patthar)',
  'કેમિકલ':            'Chemical',
  'બારીના':            'Window Material',
  'દરવાજના':           'Door Material',
  'ઇલેક્ટ્રીક':        'Electrical',
  'ટાઇલ્સ':            'Tiles',
  'પ્લમ્બિંગ પાઇપ':   'Plumbing Pipe',
  'પ્લમ્બિંગ સેનેટરી': 'Plumbing Sanitary',
  'માટી પુરાણ':        'Soil Filling',
  'ઈંટો':              'Bricks (Into)',
  // Labour
  'ચણતર પ્લાસ્ટ લેબર':  'Masonry / Plaster Labour',
  'સલાટ લેબર':          'Slat Labour',
  'પ્લમ્બર લેબર':        'Plumber Labour',
  'ઇલેકટ્રીક લેબર':     'Electrician Labour',
  'કલર લેબર':           'Painting Labour',
  'POP':                'POP',
  'વોટરપ્રૂફિંગ લેબર': 'Waterproofing Labour',
  'એક્સપોઝ બ્રેક':     'Exposed Brick Labour',
  'રસ્ટિક':             'Rustic Labour',
};

function pdfLabel(text) {
  return GUJ_LABELS[text] || text;
}

// ─── fetch project data ───────────────────────────────────────────────────────

async function fetchProjectData(projectId) {
  const [project, materials, labour, misc, payments] = await Promise.all([
    getProject(projectId),
    getByProject('materials', projectId),
    getByProject('labour', projectId),
    getByProject('misc', projectId),
    getByProject('payments', projectId),
  ]);
  const totalMat  = materials.reduce((a, m) => a + (m.total  || 0), 0);
  const totalLab  = labour.reduce((a, l)   => a + (l.amount || 0), 0);
  const totalMisc = misc.reduce((a, m)     => a + (m.amount || 0), 0);
  const totalExp  = totalMat + totalLab + totalMisc;
  const totalRec  = payments.reduce((a, p) => a + (p.amount || 0), 0);
  const balance   = totalRec - totalExp;
  return { project, materials, labour, misc, payments, totalMat, totalLab, totalMisc, totalExp, totalRec, balance };
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9\u0A80-\u0AFF _\-().]/g, '_').trim() || 'Project';
}

// ─── INR formatter (plain number, no ₹ symbol for cells) ─────────────────────
function inr(n) { return Number(n) || 0; }

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────

export async function exportExcel(projectId) {
  const XLSX = await loadXLSX();
  const d    = await fetchProjectData(projectId);
  const { project } = d;

  const wb = XLSX.utils.book_new();

  // ── colour palette ──
  const C = {
    navyFg:   { rgb: 'FFFFFF' },
    navyBg:   { rgb: '1A3C6E' },
    greenFg:  { rgb: '14532D' },
    greenBg:  { rgb: 'D1FAE5' },
    redFg:    { rgb: '7F1D1D' },
    redBg:    { rgb: 'FEE2E2' },
    blueBg:   { rgb: 'EBF2FB' },
    blueFg:   { rgb: '1A3C6E' },
    grayBg:   { rgb: 'F1F5F9' },
    grayFg:   { rgb: '334155' },
    totalBg:  { rgb: '0F172A' },
    totalFg:  { rgb: 'FFFFFF' },
    border:   { style: 'thin', color: { rgb: 'CBD5E1' } },
  };

  function hdr(value, bg, fg) {
    return {
      v: value, t: 's',
      s: {
        font:      { bold: true, color: fg, sz: 10 },
        fill:      { fgColor: bg, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border:    { top: C.border, bottom: C.border, left: C.border, right: C.border },
      },
    };
  }

  function cell(value, opts = {}) {
    const isNum = typeof value === 'number';
    return {
      v: value,
      t: isNum ? 'n' : 's',
      s: {
        font:      { bold: opts.bold || false, color: opts.fg || { rgb: '1E293B' }, sz: opts.sz || 10 },
        fill:      opts.bg ? { fgColor: opts.bg, patternType: 'solid' } : undefined,
        alignment: { horizontal: opts.align || (isNum ? 'right' : 'left'), vertical: 'center' },
        border:    { top: C.border, bottom: C.border, left: C.border, right: C.border },
        numFmt:    isNum && opts.currency ? '₹#,##0.00' : undefined,
      },
    };
  }

  function emptyCell() {
    return { v: '', t: 's', s: { border: { top: C.border, bottom: C.border, left: C.border, right: C.border } } };
  }

  // ──────────────────────────────────────────
  // SHEET 1 — Summary
  // ──────────────────────────────────────────
  const sumData = [];

  // Title row
  sumData.push([
    { v: `PROJECT REPORT — ${project.name}`, t: 's',
      s: { font: { bold: true, sz: 14, color: C.navyFg }, fill: { fgColor: C.navyBg, patternType: 'solid' },
           alignment: { horizontal: 'center', vertical: 'center' } } },
    null,
  ]);

  // Spacer
  sumData.push([{ v: '', t: 's' }, null]);

  // Project info
  const info = [
    ['Project Name', project.name],
    ['Client',       project.client_name],
    ...(project.phone   ? [['Phone',   project.phone]]   : []),
    ...(project.address ? [['Address', project.address]] : []),
    ['Status',      project.status],
    ['Export Date', new Date().toLocaleDateString('en-IN')],
  ];
  info.forEach(([k, v]) => sumData.push([
    cell(k, { bold: true, fg: C.blueFg, bg: C.blueBg }),
    cell(v),
  ]));

  sumData.push([{ v: '', t: 's' }, null]);

  // Financial summary sub-header
  sumData.push([
    { v: 'FINANCIAL SUMMARY', t: 's',
      s: { font: { bold: true, sz: 11, color: C.navyFg }, fill: { fgColor: C.navyBg, patternType: 'solid' },
           alignment: { horizontal: 'center' } } },
    null,
  ]);
  sumData.push([hdr('Description', C.navyBg, C.navyFg), hdr('Amount (₹)', C.navyBg, C.navyFg)]);

  const summaryRows = [
    ['Total Material Cost',  d.totalMat,  null],
    ['Total Labour Cost',    d.totalLab,  null],
    ['Total Misc Cost',      d.totalMisc, null],
    ['Total Expense',        d.totalExp,  { fg: C.redFg, bg: C.redBg }],
    ['Total Received',       d.totalRec,  { fg: C.greenFg, bg: C.greenBg }],
    [d.balance >= 0 ? 'Balance' : 'Balance Due', Math.abs(d.balance),
     d.balance >= 0 ? { fg: C.greenFg, bg: C.greenBg } : { fg: C.redFg, bg: C.redBg }],
  ];
  summaryRows.forEach(([label, val, style]) => sumData.push([
    cell(label, { bold: true, ...(style || {}) }),
    cell(inr(val), { currency: true, bold: true, align: 'right', ...(style || {}) }),
  ]));

  const wsSummary = XLSX.utils.aoa_to_sheet(sumData);
  wsSummary['!cols'] = [{ wch: 26 }, { wch: 20 }];
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: sumData.length - 7, c: 0 }, e: { r: sumData.length - 7, c: 1 } }, // FINANCIAL SUMMARY merge
  ];
  wsSummary['!rows'] = [{ hpt: 30 }]; // title row taller
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ──────────────────────────────────────────
  // Helper: build a styled data sheet
  // ──────────────────────────────────────────
  function buildSheet(title, headers, rows, totalRow, colWidths) {
    const data = [];

    // Sheet title
    data.push([
      { v: title, t: 's',
        s: { font: { bold: true, sz: 13, color: C.navyFg }, fill: { fgColor: C.navyBg, patternType: 'solid' },
             alignment: { horizontal: 'center', vertical: 'center' } } },
      ...Array(headers.length - 1).fill(null),
    ]);

    data.push(headers.map(h => hdr(h, { rgb: 'E2E8F0' }, { rgb: '1A3C6E' })));

    rows.forEach((row, ri) => {
      const bg = ri % 2 === 0 ? undefined : { rgb: 'F8FAFC' };
      data.push(row.map((v, ci) => {
        const isLast = ci === row.length - 1;
        const isCurrency = typeof v === 'number' && ci >= 2;
        return cell(v, { bg, currency: isCurrency, align: typeof v === 'number' ? 'right' : 'left' });
      }));
    });

    if (totalRow) {
      data.push(totalRow.map((v, ci) =>
        v === '' ? emptyCell() :
        cell(v, { bold: true, fg: C.totalFg, bg: C.totalBg, currency: typeof v === 'number', align: typeof v === 'number' ? 'right' : 'left' })
      ));
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = colWidths;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
    ws['!rows'] = [{ hpt: 28 }, { hpt: 20 }];
    return ws;
  }

  // ── Materials ──
  if (d.materials.length > 0) {
    const ws = buildSheet(
      'MATERIALS',
      ['#', 'Item', 'Qty', 'Unit', 'Rate (₹)', 'Total (₹)', 'Date', 'Note'],
      d.materials.map((m, i) => [i + 1, m.item, m.qty, m.unit, inr(m.rate), inr(m.total), fmtDate(m.date), m.note || '']),
      ['', '', '', '', 'TOTAL', inr(d.totalMat), '', ''],
      [{ wch: 4 }, { wch: 22 }, { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 26 }],
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Materials');
  }

  // ── Labour ──
  if (d.labour.length > 0) {
    const ws = buildSheet(
      'LABOUR',
      ['#', 'Category', 'Amount (₹)', 'Date', 'Note'],
      d.labour.map((l, i) => [i + 1, l.category, inr(l.amount), fmtDate(l.date), l.note || '']),
      ['', 'TOTAL', inr(d.totalLab), '', ''],
      [{ wch: 4 }, { wch: 30 }, { wch: 14 }, { wch: 13 }, { wch: 26 }],
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Labour');
  }

  // ── Misc ──
  if (d.misc.length > 0) {
    const ws = buildSheet(
      'MISC / PARCHURAN',
      ['#', 'Description', 'Amount (₹)', 'Date', 'Note'],
      d.misc.map((m, i) => [i + 1, m.description, inr(m.amount), fmtDate(m.date), m.note || '']),
      ['', 'TOTAL', inr(d.totalMisc), '', ''],
      [{ wch: 4 }, { wch: 30 }, { wch: 14 }, { wch: 13 }, { wch: 26 }],
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Misc');
  }

  // ── Payments ──
  if (d.payments.length > 0) {
    const ws = buildSheet(
      'PAYMENTS RECEIVED',
      ['#', 'Mode', 'Amount (₹)', 'Date', 'Note'],
      d.payments.map((p, i) => [i + 1, p.mode, inr(p.amount), fmtDate(p.date), p.note || '']),
      ['', 'TOTAL', inr(d.totalRec), '', ''],
      [{ wch: 4 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 26 }],
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
  }

  XLSX.writeFile(wb, `${safeFilename(project.name)}_App.xlsx`);
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
//
// jsPDF's built-in helvetica font only covers Latin-1 characters.
// The ₹ symbol (U+20B9) is NOT in Latin-1, so it renders as ¹.
// Fix: use "Rs." for all currency in the PDF.
// Gujarati text is already mapped to English via pdfLabel().

function pdfMoney(amount) {
  const n = Number(amount) || 0;
  // Format with Indian comma grouping, prefix Rs.
  return 'Rs.' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export async function exportPDF(projectId) {
  const JsPDF = await loadJsPDF();
  const d     = await fetchProjectData(projectId);
  const { project } = d;

  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const NAVY  = [26,  60, 110];
  const GREEN = [21, 128,  61];
  const RED   = [185,  28,  28];
  const GRAY  = [100, 116, 139];
  const WHITE = [255, 255, 255];
  const LGRAY = [241, 245, 249];

  const PAGE_W = 210;
  const M      = 13;
  const CW     = PAGE_W - M * 2;

  let y = 0;

  // ── Header band ──────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text(project.name, M, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${project.client_name}`, M, 21);
  if (project.phone)   doc.text(`Phone: ${project.phone}`, M, 27);
  if (project.address) doc.text(project.address.substring(0, 50), M, 33);

  // Right-aligned info
  doc.setFontSize(8.5);
  const rLines = [
    `Status: ${project.status}`,
    `Date: ${new Date().toLocaleDateString('en-IN')}`,
  ];
  rLines.forEach((line, i) => {
    doc.text(line, PAGE_W - M - doc.getTextWidth(line), 15 + i * 7);
  });

  y = 46;

  // ── Summary cards (2 rows × 3 cols) ─────────────────────
  const cardH = 18;
  const gap   = 3;
  const cardW = (CW - gap * 2) / 3;

  const cards = [
    { label: 'Materials',     value: pdfMoney(d.totalMat),        accent: NAVY  },
    { label: 'Labour',        value: pdfMoney(d.totalLab),        accent: NAVY  },
    { label: 'Misc',          value: pdfMoney(d.totalMisc),       accent: NAVY  },
    { label: 'Total Expense', value: pdfMoney(d.totalExp),        accent: RED   },
    { label: 'Received',      value: pdfMoney(d.totalRec),        accent: GREEN },
    {
      label: d.balance >= 0 ? 'Balance' : 'Balance Due',
      value: pdfMoney(Math.abs(d.balance)),
      accent: d.balance >= 0 ? GREEN : RED,
    },
  ];

  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx  = M + col * (cardW + gap);
    const cy  = y + row * (cardH + gap);

    // White card with left accent border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...c.accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cardW, cardH, 1.5, 1.5, 'FD');

    // Thick left colour bar
    doc.setFillColor(...c.accent);
    doc.rect(cx, cy, 3, cardH, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(c.label, cx + 6, cy + 7);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...c.accent);
    doc.text(c.value, cx + 6, cy + 14.5);
  });

  y += 2 * (cardH + gap) + 7;

  // ── Section renderer ─────────────────────────────────────
  function section(title, head, rows, footRow, colStyles) {
    if (rows.length === 0) return;

    // Estimate table height: ~7px per row + 10px head + 10px foot + 10px title
    const estH = rows.length * 8 + 30;
    // If table won't fit on remaining page, start a new one
    // But always allow at least partial tables (autoTable handles page breaks itself)
    if (y + estH > 272 && y > 80) {
      doc.addPage();
      y = 14;
    }

    // Section title bar
    doc.setFillColor(...NAVY);
    doc.rect(M, y, CW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(title, M + 4, y + 5.5);
    y += 8;

    doc.autoTable({
      startY: y,
      head:   [head],
      body:   rows,
      foot:   footRow ? [footRow] : undefined,
      margin: { left: M, right: M },
      tableWidth: CW,
      showFoot: 'lastPage',
      styles: {
        font:        'helvetica',
        fontSize:    9,
        cellPadding: { top: 3.5, bottom: 3.5, left: 3.5, right: 3.5 },
        lineColor:   [210, 218, 228],
        lineWidth:   0.2,
        textColor:   [30, 41, 59],
        valign:      'middle',
        overflow:    'linebreak',
      },
      headStyles: {
        fillColor:   [225, 235, 248],
        textColor:   NAVY,
        fontStyle:   'bold',
        fontSize:    8.5,
      },
      footStyles: {
        fillColor:   NAVY,
        textColor:   WHITE,
        fontStyle:   'bold',
        fontSize:    9,
      },
      alternateRowStyles: { fillColor: [248, 250, 253] },
      columnStyles: colStyles || {},
      didParseCell(data) {
        // Right-align amount/rate/total columns (index >= 2 for most tables)
        if (data.section === 'body' || data.section === 'foot') {
          const v = String(data.cell.raw || '');
          if (v.startsWith('Rs.') || v === 'TOTAL') {
            data.cell.styles.halign = 'right';
          }
        }
      },
    });

    y = doc.lastAutoTable.finalY + 6;
  }

  // ── Materials ────────────────────────────────────────────
  section(
    'MATERIALS',
    ['#', 'Item', 'Qty', 'Unit', 'Rate', 'Total', 'Date', 'Note'],
    d.materials.map((m, i) => [
      i + 1,
      pdfLabel(m.item),
      m.qty,
      m.unit,
      pdfMoney(m.rate),
      pdfMoney(m.total),
      fmtDate(m.date),
      m.note || '-',
    ]),
    d.materials.length > 0
      ? ['', 'TOTAL', '', '', '', pdfMoney(d.totalMat), '', '']
      : null,
    { 0: { halign: 'center', cellWidth: 8 }, 2: { halign: 'center' }, 3: { halign: 'center' } },
  );

  // ── Labour ───────────────────────────────────────────────
  section(
    'LABOUR',
    ['#', 'Category', 'Amount', 'Date', 'Note'],
    d.labour.map((l, i) => [
      i + 1,
      pdfLabel(l.category),
      pdfMoney(l.amount),
      fmtDate(l.date),
      l.note || '-',
    ]),
    d.labour.length > 0 ? ['', 'TOTAL', pdfMoney(d.totalLab), '', ''] : null,
    { 0: { halign: 'center', cellWidth: 8 } },
  );

  // ── Misc ─────────────────────────────────────────────────
  section(
    'MISC / OTHER EXPENSES',
    ['#', 'Description', 'Amount', 'Date', 'Note'],
    d.misc.map((m, i) => [
      i + 1,
      m.description,
      pdfMoney(m.amount),
      fmtDate(m.date),
      m.note || '-',
    ]),
    d.misc.length > 0 ? ['', 'TOTAL', pdfMoney(d.totalMisc), '', ''] : null,
    { 0: { halign: 'center', cellWidth: 8 } },
  );

  // ── Payments ─────────────────────────────────────────────
  section(
    'PAYMENTS RECEIVED',
    ['#', 'Mode', 'Amount', 'Date', 'Note'],
    d.payments.map((p, i) => [
      i + 1,
      p.mode,
      pdfMoney(p.amount),
      fmtDate(p.date),
      p.note || '-',
    ]),
    d.payments.length > 0 ? ['', 'TOTAL', pdfMoney(d.totalRec), '', ''] : null,
    { 0: { halign: 'center', cellWidth: 8 }, 1: { cellWidth: 22 } },
  );

  // ── Footer on every page ─────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.2);
    doc.line(M, 289, PAGE_W - M, 289);
    doc.text(project.name, M, 293);
    const pg = `Page ${i} of ${totalPages}`;
    doc.text(pg, PAGE_W - M - doc.getTextWidth(pg), 293);
  }

  doc.save(`${safeFilename(project.name)}_App.pdf`);
}