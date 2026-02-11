import React, { useState, useMemo } from 'react';
import { formatNum, formatChange, formatCr, getPCRColor, getSentimentLabel } from '../utils';

const COLUMN_GROUPS = [
  {
    group: '',
    cols: [
      { key: '_rank', label: '#', sortable: false },
      { key: 'Symbol', label: 'Symbol', sortable: true },
    ],
  },
  {
    group: 'Volume',
    cols: [
      { key: 'CE_Volume', label: 'CE', sortable: true, format: formatNum },
      { key: 'PE_Volume', label: 'PE', sortable: true, format: formatNum },
    ],
  },
  {
    group: 'Open Interest',
    cols: [
      { key: 'CE_OI', label: 'CE', sortable: true, format: formatNum },
      { key: 'PE_OI', label: 'PE', sortable: true, format: formatNum },
    ],
  },
  {
    group: 'OI Change',
    cols: [
      { key: 'CE_OI_Change', label: 'CE', sortable: true, format: formatChange, isChange: true },
      { key: 'PE_OI_Change', label: 'PE', sortable: true, format: formatChange, isChange: true },
    ],
  },
  {
    group: 'Turnover',
    cols: [
      { key: 'CE_Turnover', label: 'CE', sortable: true, format: formatCr },
      { key: 'PE_Turnover', label: 'PE', sortable: true, format: formatCr },
    ],
  },
  {
    group: 'PCR',
    cols: [
      { key: 'PCR_OI', label: 'OI', sortable: true, format: v => v != null ? v.toFixed(2) : '-', isPCR: true },
      { key: 'PCR_Volume', label: 'Vol', sortable: true, format: v => v != null ? v.toFixed(2) : '-' },
    ],
  },
];

export default function MainTable({ data, onSelectStock, activeDate }) {
  const [sortKey, setSortKey] = useState('CE_Volume');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toUpperCase();
      result = result.filter(r => r.Symbol.toUpperCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (av == null) av = -Infinity;
      if (bv == null) bv = -Infinity;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [data, sortKey, sortDir, search]);

  const handleSort = (key) => {
    if (key === '_rank') return;
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const styles = {
    wrapper: { marginBottom: 16 },
    toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 18, fontWeight: 700, color: '#fff' },
    badge: { fontSize: 13, color: '#999', background: '#1e1e1e', padding: '2px 10px', borderRadius: 12, marginLeft: 10 },
    searchWrap: { position: 'relative' },
    searchInput: {
      background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
      padding: '10px 14px 10px 38px', fontSize: 15, color: '#e0e0e0',
      outline: 'none', width: 240,
    },
    tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid #2a2a2a' },
    groupHeader: { background: '#161616', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2, color: '#666', textAlign: 'center', padding: '8px 10px 2px' },
    groupHeaderPCR: { color: '#22d3ee' },
    colHeader: { background: '#161616', fontSize: 13, fontWeight: 600, color: '#aaa', textAlign: 'left', padding: '8px 14px', cursor: 'pointer', userSelect: 'none', borderBottom: '1px solid #2a2a2a' },
    sortArrow: { color: '#22d3ee', fontSize: 10, marginLeft: 4 },
    cell: { padding: '10px 14px', fontSize: 14, color: '#ccc', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    symbolCell: { padding: '10px 14px', fontSize: 15, fontWeight: 600, color: '#5eead4', textAlign: 'left', cursor: 'pointer' },
    rankCell: { padding: '10px 8px', fontSize: 12, color: '#555', textAlign: 'center', width: 40 },
    groupBorder: { borderLeft: '1px solid #222' },
    hint: { fontSize: 12, color: '#555', textAlign: 'center', marginTop: 8 },
  };

  function sentimentBadge(pcr) {
    if (pcr == null) return null;
    let bg, color;
    if (pcr > 1.3) { bg = 'rgba(239,68,68,0.2)'; color = '#f87171'; }
    else if (pcr > 1.0) { bg = 'rgba(251,146,60,0.15)'; color = '#fb923c'; }
    else if (pcr > 0.7) { bg = 'rgba(250,204,21,0.15)'; color = '#facc15'; }
    else { bg = 'rgba(52,211,153,0.2)'; color = '#34d399'; }
    return (
      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: bg, color, marginLeft: 6 }}>
        {getSentimentLabel(pcr)}
      </span>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={styles.title}>All F&O Stocks</span>
          <span style={styles.badge}>{filtered.length} stocks</span>
        </div>
        <div style={styles.searchWrap}>
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* Group headers row */}
            <tr>
              {COLUMN_GROUPS.map((g, gi) => (
                <th
                  key={gi}
                  colSpan={g.cols.length}
                  style={{
                    ...styles.groupHeader,
                    ...(g.group === 'PCR' ? styles.groupHeaderPCR : {}),
                    ...(gi > 1 ? styles.groupBorder : {}),
                    color: g.group === '' ? 'transparent' : (g.group === 'PCR' ? '#22d3ee' : '#666'),
                  }}
                >
                  {g.group || '\u00A0'}
                </th>
              ))}
            </tr>
            {/* Column headers row */}
            <tr>
              {COLUMN_GROUPS.map((g, gi) =>
                g.cols.map((col, ci) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{
                      ...styles.colHeader,
                      ...(ci === 0 && gi > 1 ? styles.groupBorder : {}),
                      textAlign: col.key === '_rank' ? 'center' : (col.key === 'Symbol' ? 'left' : 'right'),
                      cursor: col.sortable ? 'pointer' : 'default',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span style={styles.sortArrow}>{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>
                    )}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const pcrClass = getPCRColor(row.PCR_OI);
              return (
                <tr
                  key={row.Symbol}
                  className={`${pcrClass} ${i % 2 === 0 ? 'row-even' : 'row-odd'}`}
                  onClick={() => onSelectStock(row.Symbol)}
                  style={{ cursor: 'pointer', borderTop: '1px solid #1e1e1e', transition: 'filter 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                >
                  {COLUMN_GROUPS.map((g, gi) =>
                    g.cols.map((col, ci) => {
                      const borderStyle = ci === 0 && gi > 1 ? styles.groupBorder : {};
                      if (col.key === '_rank') {
                        return <td key={col.key} style={styles.rankCell}>{i + 1}</td>;
                      }
                      if (col.key === 'Symbol') {
                        return <td key={col.key} style={styles.symbolCell}>{row.Symbol}</td>;
                      }
                      const val = row[col.key];
                      const formatted = col.format ? col.format(val) : val;
                      let cellColor = '#ccc';
                      if (col.isChange) {
                        cellColor = val > 0 ? '#34d399' : val < 0 ? '#f87171' : '#666';
                      }
                      return (
                        <td key={col.key} style={{ ...styles.cell, ...borderStyle, color: cellColor }}>
                          {col.isPCR ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <span style={{ fontWeight: 600 }}>{formatted}</span>
                              {sentimentBadge(row.PCR_OI)}
                            </span>
                          ) : formatted}
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={styles.hint}>
        Click any row to view trend charts &middot; Sorted by {sortKey.replace(/_/g, ' ')} {sortDir === 'desc' ? '(highest first)' : '(lowest first)'}
      </p>
    </div>
  );
}
