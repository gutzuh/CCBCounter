import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PreviewPage({ allData, generateAtaHTML, currentRecord }) {
  const { state } = useLocation();
  
  // Usar dados do state se disponível, senão usar props
  const dataToUse = state?.allData || allData;
  const ataHtml = generateAtaHTML ? generateAtaHTML(dataToUse) : '<p>Sem conteúdo</p>';
  const recordId = state?.recordId || currentRecord?.id || null;

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
    // close the print window after a short delay
    setTimeout(() => { try { w.close(); } catch (e) {} }, 1200);
  };

  const handleDownloadDocx = () => {
    if (!recordId) {
      alert('Nenhum registro encontrado para download. Salve os dados primeiro.');
      return;
    }
    // Fazer download do documento CCB em formato DOCX
    window.open(`/api/docx?id=${recordId}`, '_blank');
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pré-visualização da Ata</h1>
        <div>
          <button style={{ marginRight: 8 }} onClick={handlePrint}>Imprimir</button>
          <button style={{ marginRight: 8 }} onClick={copyHtml}>Copiar HTML</button>
          {recordId && (
            <button 
              style={{ 
                marginRight: 8, 
                backgroundColor: '#059669', 
                color: 'white', 
                border: 'none', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }} 
              onClick={handleDownloadDocx}
            >
              📄 Download CCB (DOCX)
            </button>
          )}
        </div>
      </div>
      <div className="print-area" style={{ border: '1px solid #ccc', padding: 20, background: '#fff', color: '#000' }} dangerouslySetInnerHTML={{ __html: ataHtml }} />
    </div>
  );
}
