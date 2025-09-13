import { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import PreviewPage from './PreviewPage';
import HistoryPage from './HistoryPage';
import AdminPanel from './components/AdminPanel';
import CCBDataPage from './components/CCBDataPage';
import MusicosPage from './components/MusicosPage';
import MinisterioPage from './components/MinisterioPage';
import { generateAtaHTML, generateAtaStats, validateAtaData } from './utils/AtaGenerator';

function App() {
  const location = useLocation();
  
  // Estados centralizados
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Estados dos dados CCB
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [local, setLocal] = useState('');
  const [presidencia, setPresidencia] = useState('');
  const [palavra, setPalavra] = useState('');
  const [encarregado, setEncarregado] = useState('');
  const [regencia, setRegencia] = useState('');
  const [hinos, setHinos] = useState('');
  const [hinosNumeros, setHinosNumeros] = useState('');

  // Estados de contagem
  const [selected, setSelected] = useState({});
  const [organists, setOrganists] = useState(0);
  const [ministerio, setMinisterio] = useState({});

  // Inicializar instrumentos padrão CCB
  useEffect(() => {
    const instrumentosPadraoCCB = [
      'Violinos', 'Violas', 'Violoncelos', 'Flautas', 'Acordeons',
      'Clarinetes', 'Clarones', 'Oboés', 'Saxofones', 'Fagotes',
      'Cornets', 'Saxhorns', 'Trompetes', 'Trompas', 'Trombonitos',
      'Trombones', 'Barítonos', 'Bombardinos', 'Bombardões', 'Tubas'
    ];

    const initialInstruments = {};
    instrumentosPadraoCCB.forEach(instr => {
      initialInstruments[instr] = 0;
    });
    setSelected(initialInstruments);
  }, []);

  // Polling: buscar último registro do Supabase periodicamente
  useEffect(() => {
    let mounted = true;

    const fetchLast = async () => {
      try {
        const { data, error } = await supabase
          .from('contabilizacao')
          .select('*')
          .order('id', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Erro ao buscar último registro:', error);
          return;
        }

        const row = (data && data[0]) || null;
        if (!mounted) return;

        if (row) {
          // normalizar instruments/ministerio se necessário
          const instruments = row.instruments && typeof row.instruments === 'string'
            ? JSON.parse(row.instruments)
            : row.instruments || {};
          const ministerioVal = row.ministerio && typeof row.ministerio === 'string'
            ? JSON.parse(row.ministerio)
            : row.ministerio || {};

          setCurrentRecord({ ...row, instruments });
          setSelected(instruments);
          setOrganists(row.organists || 0);
          setMinisterio(ministerioVal);

          // atualizar campos extras se existirem
          if (row.cidade) setCidade(row.cidade);
          if (row.estado) setEstado(row.estado);
          if (row.local) setLocal(row.local);
          if (row.presidencia) setPresidencia(row.presidencia);
          if (row.palavra) setPalavra(row.palavra);
          if (row.encarregado) setEncarregado(row.encarregado);
          if (row.regencia) setRegencia(row.regencia);
          if (row.hinos) setHinos(row.hinos);
          if (row.hinosNumeros) setHinosNumeros(row.hinosNumeros);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // fetch imediado e intervalo
    fetchLast();
    const id = setInterval(fetchLast, 700);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Auto-save com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      sendContabilizacao();
    }, 700);

    return () => clearTimeout(timer);
  }, [
    cidade, estado, local, presidencia, palavra, encarregado, regencia, 
    hinos, hinosNumeros, selected, organists, ministerio
  ]);

  // Heartbeat para sincronização
  useEffect(() => {
    const interval = setInterval(() => {
      sendContabilizacao();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Função para enviar dados ao Supabase e via Socket
  const sendContabilizacao = async () => {
    setIsLoading(true);
    try {
      const socketData = {
        data: new Date().toISOString().split('T')[0],
        instruments: selected,
        organists: organists || 0,
        ministerio: ministerio,
        cidade,
        estado,
        local,
        presidencia,
        palavra,
        encarregado,
        regencia,
        hinos,
        hinosNumeros
      };

      // Para Supabase, usar apenas campos que existem na tabela
      const supabaseData = {
        data: new Date().toISOString().split('T')[0],
        instruments: selected,
        organists: organists || 0,
        musicians: Object.values(selected).reduce((sum, count) => sum + (count || 0), 0)
      };

      if (currentRecord) {
        const { data: updated, error } = await supabase
          .from('contabilizacao')
          .update(supabaseData)
          .eq('id', currentRecord.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
        } else if (updated?.[0]) {
          setCurrentRecord(updated[0]);
          setLastSaved(new Date());
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('contabilizacao')
          .insert([supabaseData])
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
        } else if (inserted?.[0]) {
          setCurrentRecord(inserted[0]);
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para resetar todos os dados
  const resetAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setCidade('');
      setEstado('');
      setLocal('');
      setPresidencia('');
      setPalavra('');
      setEncarregado('');
      setRegencia('');
      setHinos('');
      setHinosNumeros('');
      setSelected({});
      setOrganists(0);
      setMinisterio({});
      setCurrentRecord(null);
      setLastSaved(null);
    }
  };

  // Dados consolidados para as páginas
  const allData = {
    cidade, estado, local, presidencia, palavra, encarregado, regencia,
    hinos, hinosNumeros, selected, organists, ministerio,
    data: new Date().toISOString().split('T')[0]
  };

  // Estatísticas e validação
  const stats = generateAtaStats(allData);
  const validation = validateAtaData(allData);

  // Título da página baseado na rota
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dados-ccb': return '📋 Dados do Ensaio';
      case '/musicos': return '🎼 Contagem de Músicos';
      case '/ministerio': return '⛪ Ministério';
      case '/preview': return '👁️ Visualizar Ata';
      case '/history': return '📚 Histórico';
      case '/admin': return '⚙️ Administração';
      default: return '🏠 CCB Counter';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
      {/* Header Moderno */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl w-full">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <span className="text-2xl">⛪</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  CCB Counter
                </h1>
                <p className="text-blue-200 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {getPageTitle()}
                  {currentRecord && lastSaved && (
                    <span className="ml-4 bg-blue-700 px-2 py-1 rounded-full text-xs">
                      💾 {lastSaved?.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Estatísticas rápidas melhoradas */}
            <div className="hidden lg:flex gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white border-opacity-20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎼</span>
                  <div>
                    <p className="text-xs text-blue-200">Músicos</p>
                    <p className="text-xl font-bold">{stats.totalMusicos}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white border-opacity-20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎹</span>
                  <div>
                    <p className="text-xs text-blue-200">Organistas</p>
                    <p className="text-xl font-bold">{stats.totalOrganistas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white border-opacity-20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⛪</span>
                  <div>
                    <p className="text-xs text-blue-200">Ministério</p>
                    <p className="text-xl font-bold">{stats.totalMinisterio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Moderna */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-100 sticky top-0 z-40 backdrop-blur-md w-full">
        <div className="max-w-full mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <NavLink to="/">🏠 Início</NavLink>
            <NavLink to="/dados-ccb">📋 Dados CCB</NavLink>
            <NavLink to="/musicos">🎼 Músicos</NavLink>
            <NavLink to="/ministerio">⛪ Ministério</NavLink>
            <NavLink to="/preview">👁️ Prévia</NavLink>
            <NavLink to="/history">📚 Histórico</NavLink>
            <NavLink to="/admin">⚙️ Admin</NavLink>
          </div>
        </div>
      </nav>

      {/* Status Bar Melhorado */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 shadow-sm w-full">
          <div className="max-w-full mx-auto">
            {validation.errors.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm">❌</span>
                  </div>
                  <p className="text-red-700 font-semibold">Erros encontrados:</p>
                </div>
                <ul className="text-red-600 text-sm space-y-1 ml-8">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">⚠️</span>
                  </div>
                  <p className="text-yellow-700 font-semibold">Avisos:</p>
                </div>
                <ul className="text-yellow-600 text-sm space-y-1 ml-8">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full max-w-full px-4 py-8 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage stats={stats} validation={validation} onReset={resetAllData} />} />
          
          <Route path="/dados-ccb" element={
            <CCBDataPage
              cidade={cidade} setCidade={setCidade}
              estado={estado} setEstado={setEstado}
              local={local} setLocal={setLocal}
              presidencia={presidencia} setPresidencia={setPresidencia}
              palavra={palavra} setPalavra={setPalavra}
              encarregado={encarregado} setEncarregado={setEncarregado}
              regencia={regencia} setRegencia={setRegencia}
              hinos={hinos} setHinos={setHinos}
              hinosNumeros={hinosNumeros} setHinosNumeros={setHinosNumeros}
            />
          } />
          
          <Route path="/musicos" element={
            <MusicosPage
              selected={selected} setSelected={setSelected}
              organists={organists} setOrganists={setOrganists}
            />
          } />
          
          <Route path="/ministerio" element={
            <MinisterioPage
              ministerio={ministerio} setMinisterio={setMinisterio}
            />
          } />
          
          <Route path="/preview" element={
            <PreviewPage
              allData={allData}
              generateAtaHTML={generateAtaHTML}
              currentRecord={currentRecord}
            />
          } />
          
          <Route path="/history" element={
            <HistoryPage generateAtaHTML={generateAtaHTML} />
          } />
          
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>

      {/* Loading Indicator Melhorado */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white shadow-2xl rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs">💾</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Salvando dados...</p>
                <p className="text-xs text-gray-500">Sincronizando com o servidor</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para links de navegação melhorado
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`relative px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap group ${
        isActive
          ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 border-b-3 border-blue-500'
          : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
      }`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      )}
      {!isActive && (
        <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
      )}
    </Link>
  );
}

// Página inicial com dashboard moderno
function HomePage({ stats, validation, onReset }) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl -z-10"></div>
        <div className="py-12 px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full shadow-2xl">
              <span className="text-4xl">⛪</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-purple-700 to-blue-800 bg-clip-text text-transparent mb-4">
            Sistema de Contabilização CCB
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Gerencie os dados do ensaio regional de forma organizada e padronizada, 
            seguindo exatamente o formato oficial da Congregação Cristã no Brasil
          </p>
        </div>
      </div>

      {/* Cards de estatísticas melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Músicos"
          value={stats.totalMusicos}
          icon="🎼"
          color="blue"
          subtitle="Instrumentistas presentes"
        />
        <StatCard
          title="Total de Organistas"
          value={stats.totalOrganistas}
          icon="🎹"
          color="purple"
          subtitle="Organistas no ensaio"
        />
        <StatCard
          title="Ministério Presente"
          value={stats.totalMinisterio}
          icon="⛪"
          color="green"
          subtitle="Cargos representados"
        />
        <StatCard
          title="Total Geral"
          value={stats.totalGeral}
          icon="👥"
          color="indigo"
          subtitle="Participantes totais"
        />
      </div>

      {/* Status da validação melhorado */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
            <span className="text-white text-xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Status da Ata</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">Completude dos dados</p>
            <div className="flex items-center justify-center gap-2">
              {validation.isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                  <span className="font-semibold">Dados completos</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">❌</span>
                  </div>
                  <span className="font-semibold">Dados incompletos</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">Instrumentos ativos</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-blue-600">{stats.instrumentosAtivos}</span>
              <span className="text-gray-500">de 20</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">Cargos cadastrados</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-purple-600">{stats.cargosMinisterio || 0}</span>
              <span className="text-gray-500">cargos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas melhoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Dados do Ensaio"
          description="Configure cidade, local, presidência e informações básicas do ensaio regional"
          icon="📋"
          to="/dados-ccb"
          color="blue"
        />
        <QuickActionCard
          title="Contagem de Músicos"
          description="Registre a quantidade de músicos por instrumento seguindo padrão CCB"
          icon="🎼"
          to="/musicos"
          color="green"
        />
        <QuickActionCard
          title="Ministério"
          description="Adicione cargos e nomes dos irmãos presentes no ensaio"
          icon="⛪"
          to="/ministerio"
          color="purple"
        />
      </div>

      {/* Botão de reset melhorado */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <span className="flex items-center gap-3">
            <span className="text-xl group-hover:animate-bounce">🗑️</span>
            <span className="font-semibold">Limpar Todos os Dados</span>
          </span>
        </button>
      </div>
    </div>
  );
}

// Componente para cards de estatísticas melhorado
function StatCard({ title, value, icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700'
  };

  const iconColors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${iconColors[color]} opacity-80`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${color === 'blue' ? 'from-blue-400 to-blue-600' : 
                                                 color === 'purple' ? 'from-purple-400 to-purple-600' :
                                                 color === 'green' ? 'from-green-400 to-green-600' :
                                                 'from-indigo-400 to-indigo-600'} rounded-full`}></div>
    </div>
  );
}

// Componente para cards de ação rápida melhorado
function QuickActionCard({ title, description, icon, to, color }) {
  const colorClasses = {
    blue: 'hover:from-blue-50 hover:to-blue-100 border-blue-200 hover:border-blue-300 hover:shadow-blue-200/50',
    green: 'hover:from-green-50 hover:to-green-100 border-green-200 hover:border-green-300 hover:shadow-green-200/50',
    purple: 'hover:from-purple-50 hover:to-purple-100 border-purple-200 hover:border-purple-300 hover:shadow-purple-200/50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  };

  return (
    <Link
      to={to}
      className={`group block p-6 bg-white rounded-2xl border-2 transition-all duration-300 hover:bg-gradient-to-br ${colorClasses[color]} hover:shadow-xl transform hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-4xl ${iconColors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">{title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700">{description}</p>
          <div className="mt-3 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700">
            <span>Acessar</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default App;