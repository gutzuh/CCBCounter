import { useState } from 'react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [date, setDate] = useState('');
  const [total, setTotal] = useState(0);
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInstrumentChange = (instrument, value) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const getTotalMusicos = () => {
    return Object.values(instruments).reduce((sum, count) => sum + count, 0) + organists;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || total < 0) {
      setMessage('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    setMessage('Enviando...');

    try {
      const { error } = await supabase.rpc('upsert_contabilizacao_full', {
        p_data: date,
        p_total: total
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          CCB Contabilização
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário Principal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Dados Gerais</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Pessoas
                </label>
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organistas
                </label>
                <input
                  type="number"
                  value={organists}
                  onChange={(e) => setOrganists(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Instrumentos</h2>
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
                      className="w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => handleInstrumentChange(instrument, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleInstrumentChange(instrument, count + 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>Total de Músicos: <span className="font-semibold text-blue-600">{getTotalMusicos()}</span></p>
                <p>Organistas: <span className="font-semibold">{organists}</span></p>
                <p>Instrumentistas: <span className="font-semibold">{getTotalMusicos() - organists}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}