import React from 'react';

const TERMS = [
  {
    term: 'CE (Call Option)',
    desc: 'A contract giving the buyer the right to BUY a stock at a fixed price (strike price) before expiry. Traders buy calls when they expect the price to go UP.',
  },
  {
    term: 'PE (Put Option)',
    desc: 'A contract giving the buyer the right to SELL a stock at a fixed price before expiry. Traders buy puts when they expect the price to go DOWN.',
  },
  {
    term: 'Open Interest (OI)',
    desc: 'Total number of outstanding (unsettled) option contracts. High OI = lots of trader interest/money at that level. Rising OI = new money entering, falling OI = positions closing.',
  },
  {
    term: 'OI Change',
    desc: 'How much open interest changed from the previous day. Big positive change = aggressive new positioning. Big negative change = profit booking or stop losses hit.',
  },
  {
    term: 'Volume',
    desc: 'Number of contracts traded in a single day. High volume = active trading. Volume can spike on news, earnings, or events.',
  },
  {
    term: 'Turnover',
    desc: 'Total monetary value of contracts traded (Volume x Price x Lot Size). Shows the actual rupee amount flowing through.',
  },
  {
    term: 'PCR (Put-Call Ratio)',
    desc: 'PE divided by CE. THE key sentiment indicator.',
    sub: [
      { label: 'PCR < 0.7', text: 'Strong bullish sentiment (way more calls)', color: '#34d399' },
      { label: 'PCR 0.7-1.0', text: 'Moderate bullish', color: '#6ee7b7' },
      { label: 'PCR = 1.0', text: 'Neutral', color: '#facc15' },
      { label: 'PCR 1.0-1.3', text: 'Moderate bearish', color: '#fb923c' },
      { label: 'PCR > 1.3', text: 'Strong bearish sentiment (way more puts)', color: '#f87171' },
      { label: 'PCR > 1.5', text: 'CONTRARIAN VIEW: Too many bears = reversal likely (can be bullish)', color: '#c084fc' },
    ],
  },
  {
    term: 'Contracts',
    desc: 'Number of distinct strike price + expiry combinations being traded. More contracts = wider range of bets.',
  },
  {
    term: 'Strike Price',
    desc: 'The fixed price at which the option buyer can buy (CE) or sell (PE) the stock.',
  },
  {
    term: 'Expiry Date',
    desc: 'The date when the option contract expires. Indian stock options expire on the last Thursday of the month.',
  },
];

export default function Glossary({ onClose }) {
  return (
    <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>F&O Glossary</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>&times;</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {TERMS.map(item => (
          <div key={item.term} style={{ background: '#111', borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#22d3ee' }}>{item.term}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{item.desc}</p>
            {item.sub && (
              <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
                {item.sub.map(s => (
                  <li key={s.label} style={{ fontSize: 13, padding: '2px 0' }}>
                    <span style={{ fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ color: '#777' }}> — {s.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
