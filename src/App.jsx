import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [date, setDate] = useState('');
  const [organists, setOrganists] = useState(0);
  const [instruments, setInstruments] = useState({
    Violinos: 0,
    Violas: 0,
    Violoncelos: 0,
    Flautas: 0,
    Clarinetes: 0,
    Saxofones: 0,
    Trompetes: 0,
    Trombones: 0,
    Tubas: 0
  });
  const [cargos, setCargos] = useState({
    Anciões: 0,
    Diáconos: 0,
    Cooperadores: 0,
    'Encarregados Regionais': 0,
    'Encarregados Locais': 0,
    Examinadores: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cálculos automáticos
  const getTotalMusicos = () => {
    return Object.values(instruments).reduce((sum, count) => sum + count, 0);
  };

  const getTotalCargos = () => {
    return Object.values(cargos).reduce((sum, count) => sum + count, 0);
  };

  const getTotalGeral = () => {
    return getTotalMusicos() + organists + getTotalCargos();
  };

  const handleInstrumentChange = (instrument, value) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleCargoChange = (cargo, value) => {
    setCargos(prev => ({
      ...prev,
      [cargo]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setMessage('Preencha a data');
      return;
    }

    setLoading(true);
    setMessage('Enviando...');

    try {
      // Usar insert direto na tabela ao invés de RPC
      const { data, error } = await supabase
        .from('contabilizacao')
        .upsert({
          data: date,
          total: getTotalGeral(),
          organists: organists,
          instruments: JSON.stringify(instruments),
          cargos: JSON.stringify(cargos)
        }, {
          onConflict: 'data'
        });

      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('✅ Dados salvos com sucesso!');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (err) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-gray-800">
          CCB Contabilização
        </h1>
        
        {/* Resumo Totais - Sempre visível */}
        <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold">{getTotalMusicos()}</div>
              <div className="text-xs sm:text-sm opacity-90">Instrumentistas</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold">{organists}</div>
              <div className="text-xs sm:text-sm opacity-90">Organistas</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold">{getTotalCargos()}</div>
              <div className="text-xs sm:text-sm opacity-90">Cargos</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-3xl font-bold text-yellow-300">{getTotalGeral()}</div>
              <div className="text-sm opacity-90">Total Geral</div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Formulário Principal */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Dados Gerais</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organistas
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrganists(Math.max(0, organists - 1))}
                    className="w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={organists}
                    onChange={(e) => setOrganists(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => setOrganists(organists + 1)}
                    className="w-8 h-8 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors text-sm sm:text-base ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Enviando...' : 'Salvar Dados'}
              </button>
            </form>
            
            {message && (
              <div className={`mt-4 p-3 rounded-md text-center text-sm ${
                message.includes('Erro') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : message.includes('✅')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Contagem de Instrumentos */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Instrumentos</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(instruments).map(([instrument, count]) => (
                <div key={instrument} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex-1">
                    {instrument}
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleInstrumentChange(instrument, count - 1)}
                      className="w-7 h-7 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => handleInstrumentChange(instrument, e.target.value)}
                      className="w-12 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleInstrumentChange(instrument, count + 1)}
                      className="w-7 h-7 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contagem de Cargos */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Cargos</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(cargos).map(([cargo, count]) => (
                <div key={cargo} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex-1">
                    {cargo}
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCargoChange(cargo, count - 1)}
                      className="w-7 h-7 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => handleCargoChange(cargo, e.target.value)}
                      className="w-12 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleCargoChange(cargo, count + 1)}
                      className="w-7 h-7 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}