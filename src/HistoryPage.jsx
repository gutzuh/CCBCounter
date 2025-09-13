import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage({ generateAtaHTML }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('contabilizacao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('contabilizacao')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro');
    }
  };

  const viewRecord = (record) => {
    // Preparar dados para visualização
    const allData = {
      cidade: record.cidade || '',
      estado: record.estado || '',
      local: record.local || '',
      presidencia: record.presidencia || '',
      palavra: record.palavra || '',
      encarregado: record.encarregado || '',
      regencia: record.regencia || '',
      hinos: record.hinos || '',
      hinosNumeros: record.hinosNumeros || '',
      selected: record.instruments ? JSON.parse(record.instruments) : {},
      organists: record.organists || 0,
      ministerio: record.ministerio ? JSON.parse(record.ministerio) : {},
      data: record.data
    };

    navigate('/preview', {
      state: {
        allData,
        recordId: record.id
      }
    });
  };

  const downloadDocx = (recordId) => {
    window.open(`/api/docx?id=${recordId}`, '_blank');
  };

  const formatInstruments = (instrumentsJson) => {
    try {
      const instruments = JSON.parse(instrumentsJson || '{}');
      const activeInstruments = Object.entries(instruments)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => `${name}: ${count}`)
        .slice(0, 5); // Mostrar apenas os primeiros 5

      if (activeInstruments.length === 0) return 'Nenhum instrumento';
      const display = activeInstruments.join(', ');
      const totalEntries = Object.entries(instruments).filter(([_, count]) => count > 0).length;
      return totalEntries > 5 ? display + '...' : display;
    } catch {
      return 'Dados inválidos';
    }
  };

  const getTotalMusicos = (instrumentsJson) => {
    try {
      const instruments = JSON.parse(instrumentsJson || '{}');
      return Object.values(instruments).reduce((sum, count) => sum + (count || 0), 0);
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 Histórico de Ensaios</h2>
        <p className="text-gray-600">
          Registros salvos de contabilizações anteriores. Total: {records.length} registros
        </p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Nenhum registro encontrado</p>
          <p className="text-gray-400 text-sm mt-2">
            Os registros aparecerão aqui conforme você salvar dados na aplicação
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {record.cidade || 'Cidade não informada'} - {record.local || 'Local não informado'}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {record.estado || 'UF'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Data: {new Date(record.data || record.created_at).toLocaleDateString('pt-BR')}
                    {record.presidencia && ` | Presidência: ${record.presidencia}`}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => viewRecord(record)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => downloadDocx(record.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    📄 DOCX
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-700 mb-1">Contagem</p>
                  <p className="text-gray-600">
                    🎼 {getTotalMusicos(record.instruments)} músicos
                    <br />
                    🎹 {record.organists || 0} organistas
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-700 mb-1">Instrumentos Principais</p>
                  <p className="text-gray-600 text-xs">
                    {formatInstruments(record.instruments)}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-700 mb-1">Detalhes</p>
                  <p className="text-gray-600 text-xs">
                    {record.encarregado && `Encarregado: ${record.encarregado.substring(0, 20)}...`}
                    <br />
                    {record.hinos && `${record.hinos} hinos ensaiados`}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Criado em: {new Date(record.created_at).toLocaleString('pt-BR')}
                  {record.updated_at && record.updated_at !== record.created_at && (
                    <span> | Atualizado: {new Date(record.updated_at).toLocaleString('pt-BR')}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
