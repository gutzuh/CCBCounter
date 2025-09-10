import React from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

export default function PreviewPage({ ataHtml: propAta }) {
  const { state } = useLocation();
  const ataHtml = state?.ataHtml || propAta || '<p>Sem conteúdo</p>';
  const recordId = state?.recordId || null;

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(ataHtml);
      alert('HTML copiado para a área de transferência.');
    } catch (e) {
      alert('Falha ao copiar.');
    }
  };

  const handlePrint = () => {
    const w = window.open();
    w.document.write(ataHtml);
    w.document.close();
    w.focus();
    w.print();
    // after printing, notify server so it can mark printed and broadcast reset
    const socket = window.__CCB_SOCKET || io('http://localhost:3001');
    const payload = {};
    if (state?.recordId) payload.id = state.recordId;
    socket.emit('printed', payload);
    // close the print window after a short delay
    setTimeout(() => { try { w.close(); } catch (e) {} }, 1200);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pré-visualização da Ata</h1>
        <div>
          <button style={{ marginRight: 8 }} onClick={handlePrint}>Imprimir</button>
          <button onClick={copyHtml}>Copiar HTML</button>
        </div>
      </div>
      <div className="print-area" style={{ border: '1px solid #ccc', padding: 20, background: '#fff', color: '#000' }} dangerouslySetInnerHTML={{ __html: ataHtml }} />
    </div>
  );
}
