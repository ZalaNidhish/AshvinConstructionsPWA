export const MATERIAL_ITEMS = [
  'રેતી', 'કપચી', 'સિમેન્ટ', 'લોખંડ', 'પથ્થર',
  'કેમિકલ', 'બારીના', 'દરવાજના', 'ઇલેક્ટ્રીક',
  'ટાઇલ્સ', 'પ્લમ્બિંગ પાઇપ', 'પ્લમ્બિંગ સેનેટરી',
  'માટી પુરાણ', 'ઈંટો',
];

export const LABOUR_CATEGORIES = [
  'ચણતર પ્લાસ્ટ લેબર', 'સલાટ લેબર', 'પ્લમ્બર લેબર',
  'ઇલેકટ્રીક લેબર', 'કલર લેબર', 'POP',
  'વોટરપ્રૂફિંગ લેબર', 'એક્સપોઝ બ્રેક', 'રસ્ટિક',
];

export const PAYMENT_MODES = ['Cash', 'UPI', 'Cheque'];

export const UNITS = ['Bag', 'Kg', 'Ton', 'CFT', 'RFT', 'Sq.Ft', 'Nos', 'Litre', 'Meter', 'Running Ft'];

export const PROJECT_STATUSES = ['Active', 'Completed'];

export function nowDateTime() {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

export function fmt(amount) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Convert stored "HH:MM" (24hr) to "hh:MM AM/PM" for display
export function fmtTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}