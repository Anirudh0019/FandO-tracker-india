import React from 'react';

export default function Header({ showGlossary, onToggleGlossary, selectedStock, onBack, dates, activeDate, onDateChange }) {
  const reversedDates = [...dates].reverse();

  return (
    <header style={{ background: '#161616', borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedStock && (
            <button
              onClick={onBack}
              style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '6px 12px', color: '#aaa', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{ fontSize: 16 }}>&larr;</span> All Stocks
            </button>
          )}
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#0e7490', color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>NSE</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#e0e0e0' }}>F&O Dashboard</span>
          </h1>
          {selectedStock && (
            <span style={{ fontSize: 20, fontWeight: 700, color: '#22d3ee', marginLeft: 4 }}>{selectedStock}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Date</span>
            <select
              value={activeDate || ''}
              onChange={e => onDateChange(e.target.value || null)}
              style={{ background: '#222', border: '1px solid #333', color: '#ddd', borderRadius: 8, padding: '7px 10px', fontSize: 14, outline: 'none' }}
            >
              {reversedDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onToggleGlossary}
            style={{
              background: showGlossary ? '#0891b2' : '#222',
              border: showGlossary ? 'none' : '1px solid #333',
              color: showGlossary ? '#fff' : '#bbb',
              borderRadius: 8, padding: '7px 14px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>{showGlossary ? '\u2715' : '\u{1F4D6}'}</span>
            {showGlossary ? 'Hide Glossary' : 'Glossary'}
          </button>
        </div>
      </div>
    </header>
  );
}
