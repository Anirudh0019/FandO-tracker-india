import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { formatNum, formatCr, formatDateShort, getSentimentFull } from '../utils';

const CE_COLOR = '#34d399';
const PE_COLOR = '#f87171';
const PCR_OI_COLOR = '#facc15';
const PCR_VOL_COLOR = '#c084fc';

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ background: '#161616', borderRadius: 12, border: '1px solid #2a2a2a', padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e0e0e0' }}>{title}</h3>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: '#ccc', fontWeight: 600, margin: '0 0 6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '3px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#888' }}>{p.name}:</span>
          <span style={{ color: '#e0e0e0', fontWeight: 600 }}>
            {valueFormatter ? valueFormatter(p.value) : (typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, borderColor }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${borderColor || '#2a2a2a'}`, padding: 16, background: '#161616' }}>
      <p style={{ margin: 0, fontSize: 11, color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
      <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 700, color: '#e8e8e8', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>{sub}</p>}
    </div>
  );
}

export default function StockDetail({ symbol, history, latestData }) {
  if (!history.length) {
    return <p style={{ color: '#888', fontSize: 16 }}>No historical data for {symbol}</p>;
  }

  const chartData = history.map(r => ({
    date: formatDateShort(r.Date),
    CE_OI: r.CE_OI,
    PE_OI: r.PE_OI,
    CE_Volume: r.CE_Volume,
    PE_Volume: r.PE_Volume,
    CE_Turnover: r.CE_Turnover / 1e7,
    PE_Turnover: r.PE_Turnover / 1e7,
    PCR_OI: r.PCR_OI,
    PCR_Volume: r.PCR_Volume,
  }));

  const validPCR = history.filter(r => r.PCR_OI != null);
  const avgPCR = validPCR.length ? validPCR.reduce((sum, r) => sum + r.PCR_OI, 0) / validPCR.length : null;
  const sentiment = getSentimentFull(avgPCR);

  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const latest = latestData || history[history.length - 1];

  function changePct(curr, prevVal) {
    if (!prevVal || !curr || prevVal === 0) return null;
    return ((curr - prevVal) / Math.abs(prevVal) * 100).toFixed(1);
  }

  const oiChangePct = changePct(latest?.CE_OI, prev?.CE_OI);
  const volChangePct = changePct(latest?.CE_Volume, prev?.CE_Volume);

  const axisStyle = { fill: '#666', fontSize: 12 };
  const gridColor = '#1e1e1e';

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="CE Volume" value={formatNum(latest?.CE_Volume)} borderColor="#34d39940"
          sub={volChangePct ? `${volChangePct > 0 ? '+' : ''}${volChangePct}% vs prev` : undefined} />
        <StatCard label="PE Volume" value={formatNum(latest?.PE_Volume)} borderColor="#f8717140" />
        <StatCard label="CE OI" value={formatNum(latest?.CE_OI)} borderColor="#34d39940"
          sub={oiChangePct ? `${oiChangePct > 0 ? '+' : ''}${oiChangePct}% vs prev` : undefined} />
        <StatCard label="PE OI" value={formatNum(latest?.PE_OI)} borderColor="#f8717140" />
        <StatCard label="CE Turnover" value={formatCr(latest?.CE_Turnover)} />
        <StatCard label="PE Turnover" value={formatCr(latest?.PE_Turnover)} />
        <div style={{ borderRadius: 12, border: '1px solid #2a2a2a', padding: 16, background: '#161616' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Sentiment</p>
          <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: sentiment.color.replace('text-', '') === sentiment.color ? sentiment.color : '#e0e0e0' }}>
            <span style={{ color: avgPCR > 1.3 ? '#f87171' : avgPCR > 1 ? '#fb923c' : avgPCR > 0.7 ? '#facc15' : '#34d399' }}>
              {sentiment.label}
            </span>
          </p>
          {sentiment.sublabel && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#c084fc' }}>{sentiment.sublabel}</p>}
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>PCR {avgPCR?.toFixed(2)} avg / {latest?.PCR_OI?.toFixed(2)} latest</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 16 }}>
        <ChartCard title="Open Interest Trend" subtitle="CE vs PE outstanding contracts">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: '#2a2a2a' }} />
              <YAxis tick={axisStyle} tickFormatter={formatNum} axisLine={{ stroke: '#2a2a2a' }} />
              <Tooltip content={<CustomTooltip valueFormatter={formatNum} />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              <Line type="monotone" dataKey="CE_OI" stroke={CE_COLOR} name="CE OI" dot={false} strokeWidth={2.5} />
              <Line type="monotone" dataKey="PE_OI" stroke={PE_COLOR} name="PE OI" dot={false} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume Trend" subtitle="Daily contracts traded">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: '#2a2a2a' }} />
              <YAxis tick={axisStyle} tickFormatter={formatNum} axisLine={{ stroke: '#2a2a2a' }} />
              <Tooltip content={<CustomTooltip valueFormatter={formatNum} />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              <Line type="monotone" dataKey="CE_Volume" stroke={CE_COLOR} name="CE Volume" dot={false} strokeWidth={2.5} />
              <Line type="monotone" dataKey="PE_Volume" stroke={PE_COLOR} name="PE Volume" dot={false} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="PCR Trend" subtitle="Put-Call Ratio over time (1.0 = neutral)">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: '#2a2a2a' }} />
              <YAxis domain={['auto', 'auto']} tick={axisStyle} axisLine={{ stroke: '#2a2a2a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              <ReferenceLine y={1} stroke="#444" strokeDasharray="6 4" strokeWidth={1.5} />
              <ReferenceLine y={0.7} stroke="#34d39940" strokeDasharray="3 3" />
              <ReferenceLine y={1.3} stroke="#f8717140" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="PCR_OI" stroke={PCR_OI_COLOR} name="PCR (OI)" dot={{ r: 2.5, fill: PCR_OI_COLOR }} strokeWidth={2.5} />
              <Line type="monotone" dataKey="PCR_Volume" stroke={PCR_VOL_COLOR} name="PCR (Vol)" dot={{ r: 2, fill: PCR_VOL_COLOR }} strokeWidth={2} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 11, color: '#555' }}>
            <span>--- <span style={{ color: '#34d39980' }}>Bullish (&lt;0.7)</span></span>
            <span>--- <span style={{ color: '#666' }}>Neutral (1.0)</span></span>
            <span>--- <span style={{ color: '#f8717180' }}>Bearish (&gt;1.3)</span></span>
          </div>
        </ChartCard>

        <ChartCard title="Turnover Comparison" subtitle="CE vs PE daily turnover in Crores">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: '#2a2a2a' }} />
              <YAxis tick={axisStyle} tickFormatter={v => `${v.toFixed(0)}`} axisLine={{ stroke: '#2a2a2a' }} />
              <Tooltip content={<CustomTooltip valueFormatter={v => `\u20B9${v.toFixed(1)} Cr`} />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              <Bar dataKey="CE_Turnover" fill={CE_COLOR} name="CE (Cr)" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="PE_Turnover" fill={PE_COLOR} name="PE (Cr)" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
