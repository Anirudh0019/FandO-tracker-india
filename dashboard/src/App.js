import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import MainTable from './components/MainTable';
import StockDetail from './components/StockDetail';
import Glossary from './components/Glossary';
import Header from './components/Header';
import MarketSummary from './components/MarketSummary';

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/combined_summary.csv')
      .then(res => res.text())
      .then(text => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const parsed = result.data.map(row => ({
          ...row,
          CE_Volume: Number(row.CE_Volume) || 0,
          PE_Volume: Number(row.PE_Volume) || 0,
          CE_OI: Number(row.CE_OI) || 0,
          PE_OI: Number(row.PE_OI) || 0,
          CE_OI_Change: Number(row.CE_OI_Change) || 0,
          PE_OI_Change: Number(row.PE_OI_Change) || 0,
          CE_Turnover: Number(row.CE_Turnover) || 0,
          PE_Turnover: Number(row.PE_Turnover) || 0,
          CE_Contracts: Number(row.CE_Contracts) || 0,
          PE_Contracts: Number(row.PE_Contracts) || 0,
          PCR_OI: row.PCR_OI ? Number(row.PCR_OI) : null,
          PCR_Volume: row.PCR_Volume ? Number(row.PCR_Volume) : null,
        }));
        setRawData(parsed);
        setLoading(false);
      });
  }, []);

  const dates = useMemo(() => {
    const d = [...new Set(rawData.map(r => r.Date))].sort();
    return d;
  }, [rawData]);

  const latestDate = dates[dates.length - 1];
  const activeDate = selectedDate || latestDate;

  const latestData = useMemo(() => {
    return rawData.filter(r => r.Date === activeDate);
  }, [rawData, activeDate]);

  const stockHistory = useMemo(() => {
    if (!selectedStock) return [];
    return rawData
      .filter(r => r.Symbol === selectedStock)
      .sort((a, b) => a.Date.localeCompare(b.Date));
  }, [rawData, selectedStock]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#888', fontSize: 16 }}>Loading F&O data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111' }}>
      <Header
        showGlossary={showGlossary}
        onToggleGlossary={() => setShowGlossary(!showGlossary)}
        selectedStock={selectedStock}
        onBack={() => setSelectedStock(null)}
        dates={dates}
        activeDate={activeDate}
        onDateChange={setSelectedDate}
      />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px' }}>
        {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}

        {!selectedStock && (
          <MarketSummary data={latestData} onSelectStock={setSelectedStock} />
        )}

        {selectedStock ? (
          <StockDetail
            symbol={selectedStock}
            history={stockHistory}
            latestData={latestData.find(r => r.Symbol === selectedStock)}
          />
        ) : (
          <MainTable
            data={latestData}
            onSelectStock={setSelectedStock}
            activeDate={activeDate}
          />
        )}
      </main>
    </div>
  );
}
