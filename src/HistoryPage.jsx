import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function HistoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const socket = window.__CCB_SOCKET || io('http://localhost:3001');
    // fetch last known state from server to seed history
    fetch('http://localhost:3001/last')
      .then(r => r.json())
      .then(last => {
        if (last) setRows(prev => [{ id: 'last', ...last }, ...prev]);
      })
      .catch(() => {});
    const handler = (payload) => {
      setRows(prev => [{ id: Math.random().toString(36).slice(2,9), ...payload }, ...prev].slice(0, 100));
    };
    socket.on('contabilizacao', handler);
    // expose socket if not already
    if (!window.__CCB_SOCKET) window.__CCB_SOCKET = socket;
    return () => socket.off('contabilizacao', handler);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: 20 }}>
      <h2>Histórico (em tempo real)</h2>
      <p style={{ color: '#555' }}>Lista local das contabilizações recebidas nesta sessão (não persistida).</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.length === 0 && <div style={{ color: '#777' }}>Nenhuma contabilização recebida ainda.</div>}
        {rows.map(r => (
          <div key={r.id} style={{ padding: 12, border: '1px solid #eee', background: '#fafafa', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>{new Date(r.data).toLocaleString()}</div>
              <div style={{ color: '#333' }}>Músicos: {r.musicians} — Organistas: {r.organists}</div>
            </div>
            <div style={{ fontSize: 13 }}>
              {r.instruments && Object.keys(r.instruments).length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {Object.entries(r.instruments).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
                </ul>
              ) : <div style={{ color: '#666' }}>Nenhum instrumento</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
