import { useState } from 'react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [date, setDate] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        // Reset form after success
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          CCB Contabilização
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              required
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
    </div>
  );
}