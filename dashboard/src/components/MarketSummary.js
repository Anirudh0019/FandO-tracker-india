import React, { useMemo } from 'react';

export default function MarketSummary({ data, onSelectStock }) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    const bullish = data.filter(r => r.PCR_OI != null && r.PCR_OI < 0.7).length;
    const bearish = data.filter(r => r.PCR_OI != null && r.PCR_OI > 1.3).length;
    const neutral = data.length - bullish - bearish;
    const sorted = [...data].sort((a, b) => (b.CE_Volume || 0) - (a.CE_Volume || 0));
    const topActive = sorted.slice(0, 5);
    const totalCEVol = data.reduce((s, r) => s + (r.CE_Volume || 0), 0);
    const totalPEVol = data.reduce((s, r) => s + (r.PE_Volume || 0), 0);
    const marketPCR = totalCEVol > 0 ? (totalPEVol / totalCEVol) : null;
    return { bullish, bearish, neutral, topActive, marketPCR };
  }, [data]);

  if (!stats) return null;

  const s = {
    bar: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: 14 },
    dot: (c) => ({ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', marginRight: 6 }),
    label: { color: '#888', marginRight: 4 },
    divider: { width: 1, height: 20, background: '#333', flexShrink: 0 },
    topBtn: { background: 'none', border: 'none', color: '#22d3ee', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '2px 4px' },
  };

  return (
    <div style={s.bar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span><span style={s.dot('#34d399')} /><span style={s.label}>Bullish</span><strong style={{ color: '#34d399' }}>{stats.bullish}</strong></span>
        <span><span style={s.dot('#facc15')} /><span style={s.label}>Neutral</span><strong style={{ color: '#facc15' }}>{stats.neutral}</strong></span>
        <span><span style={s.dot('#f87171')} /><span style={s.label}>Bearish</span><strong style={{ color: '#f87171' }}>{stats.bearish}</strong></span>
      </div>

      <div style={s.divider} />

      <span>
        <span style={s.label}>Market PCR (Vol):</span>
        <strong style={{ color: stats.marketPCR > 1 ? '#f87171' : stats.marketPCR > 0.7 ? '#facc15' : '#34d399' }}>
          {stats.marketPCR?.toFixed(2) || '-'}
        </strong>
      </span>

      <div style={s.divider} />

      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={s.label}>Most Active:</span>
        {stats.topActive.map(r => (
          <button key={r.Symbol} onClick={() => onSelectStock(r.Symbol)} style={s.topBtn}>
            {r.Symbol}
          </button>
        ))}
      </span>
    </div>
  );
}
