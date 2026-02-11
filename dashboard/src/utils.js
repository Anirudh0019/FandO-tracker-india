export function formatNum(n) {
  if (n == null || isNaN(n)) return '-';
  if (Math.abs(n) >= 1e7) return (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return (n / 1e5).toFixed(1) + ' L';
  return n.toLocaleString('en-IN');
}

export function formatChange(n) {
  if (n == null || isNaN(n)) return '-';
  const prefix = n > 0 ? '+' : '';
  if (Math.abs(n) >= 1e7) return prefix + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return prefix + (n / 1e5).toFixed(1) + ' L';
  return prefix + n.toLocaleString('en-IN');
}

export function formatCr(n) {
  if (n == null || isNaN(n)) return '-';
  const val = n / 1e7;
  if (Math.abs(val) >= 1000) return '\u20B9' + (val / 1000).toFixed(1) + 'K Cr';
  return '\u20B9' + val.toFixed(1) + ' Cr';
}

export function getPCRColor(pcr) {
  if (pcr == null) return '';
  if (pcr > 1.3) return 'pcr-bearish';
  if (pcr > 1.0) return 'pcr-mod-bearish';
  if (pcr > 0.7) return 'pcr-neutral';
  return 'pcr-bullish';
}

export function getSentimentLabel(pcr) {
  if (pcr == null) return '';
  if (pcr > 1.3) return 'Bearish';
  if (pcr > 1.0) return 'Mod Bear';
  if (pcr > 0.7) return 'Neutral';
  return 'Bullish';
}

export function getSentimentFull(pcr) {
  if (pcr == null) return { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-800' };
  if (pcr > 1.5) return { label: 'Strong Bearish', sublabel: 'Contrarian Bullish?', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (pcr > 1.3) return { label: 'Strong Bearish', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (pcr > 1.0) return { label: 'Moderate Bearish', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  if (pcr > 0.7) return { label: 'Neutral', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  return { label: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
}

export function formatDateShort(d) {
  if (!d) return '';
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = d.split('-');
  return `${parseInt(parts[2])} ${months[parseInt(parts[1])]}`;
}
