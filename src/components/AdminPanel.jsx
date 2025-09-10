import React, { useState } from 'react';

export default function AdminPanel({ onApply, onClose }) {
  const [password, setPassword] = useState('');
  const [secretMode, setSecretMode] = useState(false);

  // simple reveal: if user types 'ccbadmin' into password field and clicks reveal, show panel
  const tryReveal = () => {
    if (password === 'ccbadmin') setSecretMode(true);
  };

  // visibility controlled by parent; if onClose not provided and not revealed, still render

  return (
    <div style={{ position: 'fixed', right: 12, top: 12, background: '#111827', color: '#000000ff', padding: 12, borderRadius: 8, zIndex: 60, maxWidth: 320 }} className="admin-panel">
      {!secretMode ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>Painel Admin (oculto)</div>
            {onClose && <button onClick={onClose} style={{ background: '#111827', color: '#000000ff', border: 'none' }}>✕</button>}
          </div>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="senha" style={{ padding: 6, color: '#000000ff' }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={tryReveal} style={{ background: '#2563eb', color: '#000000ff', padding: '6px 8px', borderRadius: 6 }}>Revelar</button>
            {onClose && <button onClick={onClose} style={{ marginLeft: 8, background: '#ef4444', color: '#000000ff', padding: '6px 8px', borderRadius: 6 }}>Fechar</button>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Admin</div>
            {onClose && <button onClick={onClose} style={{ background: '#111827', color: '#000000ff', border: 'none' }}>✕</button>}
          </div>
          <div style={{ marginBottom: 8 }}>
            <button onClick={() => onApply({ type: 'reset' })} style={{ marginRight: 8, color: '#000000ff' }}>Resetar Tudo</button>
          </div>
          <div><button onClick={() => onApply({ type: 'force-send' })} style={{ color: '#000000ff' }}>Enviar Prioritário</button></div>
        </div>
      )}
    </div>
  );
}
