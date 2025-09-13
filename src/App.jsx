import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import PreviewPage from './PreviewPage';
import HistoryPage from './HistoryPage';
import AdminPanel from './components/AdminPanel';
// usamos PNGs em public/icons em vez de componentes SVG
const IMG = (name) => `/icons/${name}`;

// shallow/deep helpers for our simple state shape
function isSameState(a, b) {
  if (!a || !b) return false;
  if (a.musicians !== b.musicians) return false;
  if (a.organists !== b.organists) return false;
  const ia = a.instruments || {};
  const ib = b.instruments || {};
  const ka = Object.keys(ia).sort();
  const kb = Object.keys(ib).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return false;
    if (ia[ka[i]] !== ib[kb[i]]) return false;
  }
  return true;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deriveCountsFromSelected(selected) {
  const instruments = selected || {};
  let musiciansCount = 0;
  let organCount = 0;
  Object.entries(instruments).forEach(([name, count]) => {
    const n = Number(count || 0);
    // try to detect by declared INSTRUMENTS family first
    let isOrgan = false;
    try {
      const found = (typeof INSTRUMENTS !== 'undefined') ? INSTRUMENTS.find(i => i.name === name) : null;
      if (found && found.family) {
        if (String(found.family).toLowerCase().includes('órg') || String(found.family).toLowerCase().includes('org')) {
          isOrgan = true;
        }
      }
    } catch (e) {
      // ignore
    }
    // fallback: name-based detection
    if (!isOrgan) {
      const lower = name.toLowerCase();
      if (lower.includes('órgão') || lower.includes('orgao') || lower.includes('órgãos') || lower.includes('orgãos')) {
        isOrgan = true;
      }
    }
    if (isOrgan) {
      organCount += n;
    } else {
      musiciansCount += n;
    }
  });
  return { musiciansCount, organCount };
}

// better icons mapping: map certain instruments to emoji or small symbols for clarity
const ICON_MAP = {
  'Violino': IMG('violino.png'),
  'Viola': IMG('violino.png'),
  'Violoncelo': IMG('tchello.png'),
  'Órgão eletrônico': IMG('organ.png'), // reuse trompa as keyboard fallback if not provided
  'Flauta': IMG('flauta.png'),
  'Clarinete': IMG('flauta.png'),
  'Oboé': IMG('flauta.png'),
  'Corne Inglês': IMG('flauta.png'),
  'Fagote': IMG('flauta.png'),
  'Clarone': IMG('sax.png'),
  'Sax Soprano (Sib)': IMG('sax.png'),
  'Sax Alto (Mib)': IMG('sax.png'),
  'Sax Tenor (Sib)': IMG('sax.png'),
  'Sax Barítono (Mib)': IMG('sax.png'),
  'Trompete': IMG('trompete.png'),
  'Cornet': IMG('trompete.png'),
  'Flugelhorn': IMG('trompete.png'),
  'Trompa': IMG('trompa.png'),
  'Trombone': IMG('trombone.png'),
  'Bombardino': IMG('tuba.png'),
  'Tuba': IMG('tuba.png'),
  'Trombonito': IMG('trombone.png'),
};

const INSTRUMENTS = [
  // Cordas
  { name: 'Violino', family: 'Cordas', icon: ICON_MAP['Violino'] },
  { name: 'Viola', family: 'Cordas', icon: ICON_MAP['Viola'] },
  { name: 'Violoncelo', family: 'Cordas', icon: ICON_MAP['Violoncelo'] },

  // Órgão
  { name: 'Órgão eletrônico', family: 'Órgão', icon: ICON_MAP['Órgão eletrônico'] },

  // Madeiras
  { name: 'Flauta', family: 'Madeiras', icon: ICON_MAP['Flauta'] },
  { name: 'Clarinete', family: 'Madeiras', icon: ICON_MAP['Clarinete'] },
  { name: 'Oboé', family: 'Madeiras', icon: ICON_MAP['Oboé'] },
  { name: 'Corne Inglês', family: 'Madeiras', icon: ICON_MAP['Corne Inglês'] },
  { name: 'Fagote', family: 'Madeiras', icon: ICON_MAP['Fagote'] },
  { name: 'Clarone', family: 'Madeiras', icon: ICON_MAP['Clarone'] },

  // Saxofones (subgrupo de Madeiras)
  { name: 'Sax Soprano (Sib)', family: 'Saxofones', icon: ICON_MAP['Sax Soprano (Sib)'] },
  { name: 'Sax Alto (Mib)', family: 'Saxofones', icon: ICON_MAP['Sax Alto (Mib)'] },
  { name: 'Sax Tenor (Sib)', family: 'Saxofones', icon: ICON_MAP['Sax Tenor (Sib)'] },
  { name: 'Sax Barítono (Mib)', family: 'Saxofones', icon: ICON_MAP['Sax Barítono (Mib)'] },

  // Metais
  { name: 'Trompete', family: 'Metais', icon: ICON_MAP['Trompete'] },
  { name: 'Cornet', family: 'Metais', icon: ICON_MAP['Cornet'] },
  { name: 'Flugelhorn', family: 'Metais', icon: ICON_MAP['Flugelhorn'] },
  // { name: 'Melofone', family: 'Metais', icon: '�' },
  { name: 'Trompa', family: 'Metais', icon: ICON_MAP['Trompa'] },
  { name: 'Trombone', family: 'Metais', icon: ICON_MAP['Trombone'] },
  { name: 'Bombardino', family: 'Metais', icon: ICON_MAP['Bombardino'] },
  { name: 'Tuba', family: 'Metais', icon: ICON_MAP['Tuba'] },
  { name: 'Trombonito', family: 'Metais', icon: ICON_MAP['Trombonito'] },

];

function App() {
  const [musicians, setMusicians] = useState(0);
  const [organists, setOrganists] = useState(0);
  const [selected, setSelected] = useState({});
  
  // Novos campos para formato CCB
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [local, setLocal] = useState('');
  const [presidencia, setPresidencia] = useState('');
  const [palavra, setPalavra] = useState('');
  const [encarregado, setEncarregado] = useState('');
  const [regencia, setRegencia] = useState('');
  const [hinos, setHinos] = useState('');
  const [hinosNumeros, setHinosNumeros] = useState('');
  const [ministerio, setMinisterio] = useState({});
  
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [currentFamily, setCurrentFamily] = useState('Cordas');
  // navigation not needed

  const socketRef = useRef(null);
  const mountedRef = useRef(false);
  const debounceRef = useRef(null);
  const heartbeatRef = useRef(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const lastSentPayloadRef = useRef(null);
  const [adminVisible, setAdminVisible] = useState(false);

  useEffect(() => {
      mountedRef.current = true;

      let subscription = null;

      // fetch last saved state from Supabase
      (async () => {
        try {
          const { data: last, error } = await supabase
            .from('contabilizacao')
            .select('*')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) {
            console.warn('Erro ao buscar último registro', error);
          }
          if (last) {
            setMusicians(last.musicians || 0);
            setOrganists(last.organists || 0);
            try { setSelected(typeof last.instruments === 'string' ? JSON.parse(last.instruments) : (last.instruments || {})); } catch (e) { setSelected(last.instruments || {}); }
          }
        } catch (e) {
          console.warn('Falha fetching last', e);
        }
      })();

      // subscribe to realtime changes on table contabilizacao
      try {
        subscription = supabase
          .channel('public:contabilizacao')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contabilizacao' }, payload => {
            const rec = payload.new || payload.record || payload;
            if (!rec) return;
            // if printed flag set, clear UI
            if (rec.printed) {
              setMusicians(0);
              setOrganists(0);
              setSelected({});
              setLastSentAt(null);
              setSaved(false);
              return;
            }
            const incoming = { musicians: rec.musicians || 0, organists: rec.organists || 0, instruments: typeof rec.instruments === 'string' ? JSON.parse(rec.instruments) : (rec.instruments || {}) };
            const current = { musicians, organists, instruments: selected };
            if (isSameState(incoming, current)) return;
            setMusicians(incoming.musicians);
            setOrganists(incoming.organists);
            setSelected(incoming.instruments);
          })
          .subscribe();
      } catch (e) {
        console.warn('Falha ao subscrever realtime', e);
      }

      // admin hotkey
      const onKey = (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
          setAdminVisible(v => !v);
        }
      };
      window.addEventListener('keydown', onKey);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        try {
          if (subscription) supabase.removeChannel(subscription);
        } catch (err) {}
        window.removeEventListener('keydown', onKey);
      };
  }, []);

  const handleInstrumentClick = (name) => {
    setSelected((prev) => ({
      ...prev,
      [name]: prev[name] ? prev[name] + 1 : 1,
    }));
    setSaved(false);
  };

  const handleInstrumentRemove = (name) => {
    setSelected((prev) => {
      const updated = { ...prev };
      if (updated[name] > 1) updated[name]--;
      else delete updated[name];
      return updated;
    });
    setSaved(false);
  };

  // keep musicians/organists state derived from selected instruments
  useEffect(() => {
    const derived = deriveCountsFromSelected(selected);
    // only set if different to avoid extra renders
    if (musicians !== derived.musiciansCount) setMusicians(derived.musiciansCount);
    if (organists !== derived.organCount) setOrganists(derived.organCount);
  }, [selected]);

  const generateAta = () => {
    let ata = `Ata de Músicos - CCB\n\n`;
    ata += `Músicos presentes: ${musicians}\n`;
    ata += `Organistas presentes: ${organists}\n\n`;
    ata += `Instrumentos contabilizados:\n`;
    Object.entries(selected).forEach(([name, count]) => {
      ata += `- ${name}: ${count}\n`;
    });
    ata += `\nData: ${new Date().toLocaleDateString()}\n`;
    ata += `\n________________________________________\nAssinatura do responsável\n`;
    return ata;
  };

  const printAta = () => {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`<pre style='font-size:1.2em'>${generateAta()}</pre>`);
    win.document.close();
    win.print();
  };

  const sendContabilizacao = (opts = {}) => {
    setError('');
    try {
      // derive musicians from instruments and organists from organ-family instruments
      const derived = deriveCountsFromSelected(selected);
      const payload = { 
        musicians: derived.musiciansCount, 
        organists: derived.organCount, 
        instruments: selected,
        cidade,
        estado,
        local,
        presidencia,
        palavra,
        encarregado,
        regencia,
        hinos,
        hinosNumeros,
        ministerio
      };
      // avoid emitting identical payload repeatedly
      if (lastSentPayloadRef.current && isSameState(payload, lastSentPayloadRef.current)) {
        return; // no-op
      }
      // insert into Supabase
      (async () => {
        // fetch last snapshot to compute diffs (helps audit)
        const { data: last } = await supabase.from('contabilizacao').select('*').order('id', { ascending: false }).limit(1).maybeSingle();

        // compute field-level diffs
        const changes = [];
        const lastInstruments = (last && last.instruments) ? (typeof last.instruments === 'string' ? JSON.parse(last.instruments) : last.instruments) : {};
        if (!last || (last.musicians || 0) !== payload.musicians) {
          changes.push({ field: 'musicians', old_value: last ? last.musicians || 0 : 0, new_value: payload.musicians });
        }
        if (!last || (last.organists || 0) !== payload.organists) {
          changes.push({ field: 'organists', old_value: last ? last.organists || 0 : 0, new_value: payload.organists });
        }
        // instruments per-item diffs
        const allKeys = Array.from(new Set([...Object.keys(lastInstruments || {}), ...Object.keys(payload.instruments || {})]));
        allKeys.forEach((k) => {
          const oldv = Number(lastInstruments[k] || 0);
          const newv = Number(payload.instruments[k] || 0);
          if (oldv !== newv) {
            changes.push({ field: `instrument.${k}`, old_value: oldv, new_value: newv });
          }
        });

        const { data, error } = await supabase.from('contabilizacao').insert([{ 
          data: new Date().toISOString(), 
          musicians: payload.musicians, 
          organists: payload.organists, 
          instruments: JSON.stringify(payload.instruments),
          cidade: payload.cidade,
          estado: payload.estado,
          local: payload.local,
          presidencia: payload.presidencia,
          palavra: payload.palavra,
          encarregado: payload.encarregado,
          regencia: payload.regencia,
          hinos: payload.hinos,
          hinosNumeros: payload.hinosNumeros,
          ministerio: JSON.stringify(payload.ministerio),
          printed: 0 
        }]);
        if (error) {
          if (!opts.silent) setError('Falha ao enviar dados: ' + error.message);
          return;
        }

        const inserted = Array.isArray(data) ? data[0] : data;
        // write change log rows referencing the new snapshot id
        if (changes.length > 0) {
          const changeRows = changes.map(ch => ({
            contabilizacao_id: inserted && inserted.id ? inserted.id : null,
            data: new Date().toISOString(),
            field: ch.field,
            old_value: String(ch.old_value),
            new_value: String(ch.new_value)
          }));
          try {
            await supabase.from('contabilizacao_changes').insert(changeRows);
          } catch (e) {
            console.warn('Falha ao registrar mudanças de auditoria', e);
          }
        }

        lastSentPayloadRef.current = deepClone(payload);
        setSaved(true);
        setLastSentAt(new Date().toISOString());
      })();
    } catch (e) {
      if (!opts.silent) setError('Falha ao enviar dados em tempo real.');
    }
  };

  // Auto-send when user changes inputs (debounced) + periodic heartbeat
  useEffect(() => {
    // don't auto-send on first mount
    if (!mountedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      sendContabilizacao();
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [musicians, organists, selected, cidade, estado, local, presidencia, palavra, encarregado, regencia, hinos, hinosNumeros, ministerio]);

  // heartbeat to re-broadcast current state periodically (keeps others in sync)
  useEffect(() => {
    heartbeatRef.current = setInterval(() => {
      sendContabilizacao({ silent: true });
    }, 12000);
    return () => clearInterval(heartbeatRef.current);
  }, [musicians, organists, selected, cidade, estado, local, presidencia, palavra, encarregado, regencia, hinos, hinosNumeros, ministerio]);

  const onAdminApply = (cmd) => {
    if (cmd.type === 'force-send') {
      const derived = deriveCountsFromSelected(selected);
      const payload = { musicians: derived.musiciansCount, organists: derived.organCount, instruments: selected, admin: true };
      (async () => {
        // fetch last snapshot
        const { data: last } = await supabase.from('contabilizacao').select('*').order('id', { ascending: false }).limit(1).maybeSingle();
        const lastInstruments = (last && last.instruments) ? (typeof last.instruments === 'string' ? JSON.parse(last.instruments) : last.instruments) : {};
        const changes = [];
        if (!last || (last.musicians || 0) !== payload.musicians) changes.push({ field: 'musicians', old_value: last ? last.musicians || 0 : 0, new_value: payload.musicians });
        if (!last || (last.organists || 0) !== payload.organists) changes.push({ field: 'organists', old_value: last ? last.organists || 0 : 0, new_value: payload.organists });
        const allKeys = Array.from(new Set([...Object.keys(lastInstruments || {}), ...Object.keys(payload.instruments || {})]));
        allKeys.forEach((k) => {
          const oldv = Number(lastInstruments[k] || 0);
          const newv = Number(payload.instruments[k] || 0);
          if (oldv !== newv) changes.push({ field: `instrument.${k}`, old_value: oldv, new_value: newv });
        });

        const { data, error } = await supabase.from('contabilizacao').insert([{ data: new Date().toISOString(), musicians: payload.musicians, organists: payload.organists, instruments: JSON.stringify(payload.instruments), printed: 0, admin: true }]);
        if (error) {
          console.warn('Erro admin force-send', error);
        } else {
          const inserted = Array.isArray(data) ? data[0] : data;
          if (changes.length > 0) {
            const changeRows = changes.map(ch => ({ contabilizacao_id: inserted && inserted.id ? inserted.id : null, data: new Date().toISOString(), field: ch.field, old_value: String(ch.old_value), new_value: String(ch.new_value) }));
            try { await supabase.from('contabilizacao_changes').insert(changeRows); } catch (e) { console.warn('Falha ao registrar mudanças de auditoria (admin)', e); }
          }
          lastSentPayloadRef.current = deepClone(payload);
          setLastSentAt(new Date().toISOString());
        }
      })();
    }
    if (cmd.type === 'reset') {
      // mark last record printed
      (async () => {
        const { data: last } = await supabase.from('contabilizacao').select('*').order('id', { ascending: false }).limit(1).maybeSingle();
        if (!last) return;
        await supabase.from('contabilizacao').update({ printed: 1 }).eq('id', last.id);
      })();
    }
  };

  const buildAtaHtml = () => {
    const dateStr = new Date().toLocaleDateString();
    const rows = Object.entries(selected).map(([name, count]) => `<tr><td>${name}</td><td style="text-align:right">${count}</td></tr>`).join('');
    const derived = deriveCountsFromSelected(selected);
    const musiciansForAta = derived.musiciansCount;
    const organistsForAta = derived.organCount;
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#000; padding:40px;">
        <h2 style="text-align:center;">Igreja Evangélica Congregacional - CCB</h2>
        <h3 style="text-align:center; margin-top:0">Ata de Músicos</h3>
        <p><strong>Data:</strong> ${dateStr}</p>
      <p><strong>Músicos presentes:</strong> ${musiciansForAta}</p>
      <p><strong>Organistas presentes:</strong> ${organistsForAta}</p>
        <table style="width:100%; border-collapse: collapse; margin-top:20px;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom:1px solid #333; padding-bottom:8px">Instrumento</th>
              <th style="text-align:right; border-bottom:1px solid #333; padding-bottom:8px">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin-top:40px">__________________________________________</p>
        <p>Assinatura do responsável</p>
      </div>
    `;
  };

  const ataHtml = buildAtaHtml();
  function buildAtaHtmlFromRecord(record) {
    const dateStr = new Date(record.data).toLocaleDateString();
    const instruments = record.instruments ? record.instruments : record.instruments;
    const parsed = typeof instruments === 'string' ? JSON.parse(instruments) : instruments;
    const rows = Object.entries(parsed).map(([name, count]) => `<tr><td>${name}</td><td style="text-align:right">${count}</td></tr>`).join('');
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#000; padding:40px;">
        <h2 style="text-align:center;">Igreja Evangélica Congregacional - CCB</h2>
        <h3 style="text-align:center; margin-top:0">Ata de Músicos</h3>
        <p><strong>Data:</strong> ${dateStr}</p>
        <p><strong>Músicos presentes:</strong> ${record.musicians}</p>
        <p><strong>Organistas presentes:</strong> ${record.organists}</p>
        <table style="width:100%; border-collapse: collapse; margin-top:20px;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom:1px solid #333; padding-bottom:8px">Instrumento</th>
              <th style="text-align:right; border-bottom:1px solid #333; padding-bottom:8px">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin-top:40px">__________________________________________</p>
        <p>Assinatura do responsável</p>
      </div>
    `;
  }

  // remoteNotice removed — remote updates are applied instantly

  return (
    <Routes>
      <Route path="/" element={(
        <div className="min-h-screen bg-gray-100 p-4">
          {/* mobile admin toggle: visible only on small screens */}
          <div className="md:hidden fixed bottom-4 right-4 z-50">
            <button onClick={() => setAdminVisible(v => !v)} className="bg-indigo-600 text-white p-3 rounded-full shadow-lg" aria-label="Abrir admin">⚙️</button>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
            <header className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Contabilização de Músicos - CCB</h1>
              <nav className="space-x-4">
                <Link to="/" className="text-indigo-600 font-medium">Início</Link>
                <Link to="/history" className="text-gray-600">Histórico</Link>
                <Link to="/preview" state={{ ataHtml }} className="text-gray-600">Pré-visualizar</Link>
              </nav>
            </header>

            {adminVisible && (
              <div className="my-4">
                <AdminPanel onApply={onAdminApply} onClose={() => setAdminVisible(false)} />
              </div>
            )}

            {/* remote updates are applied instantly; no notice UI */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <div className="flex gap-4 mb-4">
                  <label className="flex-1">
                    <div className="text-sm text-gray-500">Músicos presentes</div>
                    <input className="mt-1 w-full border rounded px-3 py-2" type="number" min={0} value={musicians} onChange={e => setMusicians(Number(e.target.value))} />
                  </label>
                  <label className="w-40">
                    <div className="text-sm text-gray-500">Organistas</div>
                    <input className="mt-1 w-full border rounded px-3 py-2" type="number" min={0} value={organists} onChange={e => setOrganists(Number(e.target.value))} />
                  </label>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(INSTRUMENTS.map(i => i.family))).map(f => (
                      <button key={f} onClick={() => setCurrentFamily(f)} className={`px-3 py-1 rounded ${currentFamily === f ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {INSTRUMENTS.filter(i => i.family === currentFamily).map(inst => (
                    <div key={inst.name} className="bg-gray-50 border rounded p-3 flex flex-col items-center">
                      <div className="text-3xl">
                        {inst.icon ? (
                          typeof inst.icon === 'string' ? (
                            <img src={inst.icon} alt={inst.name} width={36} height={36} className="object-contain" />
                          ) : (
                            // previously supported components; fallback to null
                            null
                          )
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-700 text-center">{inst.name}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="w-9 h-9 bg-red-100 text-red-700 rounded" onClick={() => handleInstrumentRemove(inst.name)}>−</button>
                        <div className="w-8 text-center font-bold">{selected[inst.name] || 0}</div>
                        <button className="w-9 h-9 bg-green-100 text-green-700 rounded" onClick={() => handleInstrumentClick(inst.name)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="bg-gray-50 border rounded p-4">
                <h3 className="text-sm font-semibold mb-2">Resumo</h3>
                <div className="text-sm text-gray-600 mb-2">Músicos: <span className="font-medium">{musicians}</span></div>
                <div className="text-sm text-gray-600 mb-4">Organistas: <span className="font-medium">{organists}</span></div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {Object.entries(selected).length === 0 && <div className="text-xs text-gray-500">Nenhum instrumento selecionado</div>}
                  {Object.entries(selected).map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <div>{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500">Atualizações são enviadas automaticamente (debounce 700ms).</div>
                  {lastSentAt && <div className="text-xs text-green-600 mt-2">Última atualização enviada: {new Date(lastSentAt).toLocaleTimeString()}</div>}
                </div>
                {saved && <div className="mt-3 text-sm text-green-600">Estado enviado para outros usuários em tempo real.</div>}
                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
              </aside>
            </div>
          </div>
        </div>
      )} />
      <Route path="/preview" element={<PreviewPage ataHtml={ataHtml} />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}

export default App;
