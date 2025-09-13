import React, { useState } from 'react';

function MusicosPage({ selected, setSelected, organists, setOrganists }) {
  const [novoInstrumento, setNovoInstrumento] = useState('');
  // Lista padrão de instrumentos CCB na ordem correta (baseada no docx.js)
  const instrumentosPadraoCCB = [
    'Violinos', 'Violas', 'Violoncelos', 'Flautas', 'Acordeons',
    'Clarinetes', 'Clarones', 'Oboés', 'Saxofones', 'Fagotes',
    'Cornets', 'Saxhorns', 'Trompetes', 'Trompas', 'Trombonitos',
    'Trombones', 'Barítonos', 'Bombardinos', 'Bombardões', 'Tubas'
  ];

  // Organizar instrumentos por família
  const familias = {
    'Cordas': ['Violinos', 'Violas', 'Violoncelos'],
    'Madeiras': ['Flautas', 'Clarinetes', 'Clarones', 'Oboés', 'Saxofones', 'Fagotes'],
    'Acordeons': ['Acordeons'],
    'Metais': ['Cornets', 'Saxhorns', 'Trompetes', 'Trompas', 'Trombonitos', 'Trombones', 'Barítonos', 'Bombardinos', 'Bombardões', 'Tubas']
  };

  const increment = (instrument) => {
    setSelected(prev => ({
      ...prev,
      [instrument]: (prev[instrument] || 0) + 1
    }));
  };

  const decrement = (instrument) => {
    setSelected(prev => ({
      ...prev,
      [instrument]: Math.max((prev[instrument] || 0) - 1, 0)
    }));
  };

  const setCount = (instrument, value) => {
    const numValue = parseInt(value) || 0;
    setSelected(prev => ({
      ...prev,
      [instrument]: Math.max(numValue, 0)
    }));
  };

  const resetAll = () => {
    const resetInstruments = {};
    instrumentosPadraoCCB.forEach(instr => {
      resetInstruments[instr] = 0;
    });
    setSelected(resetInstruments);
    setOrganists(0);
  };

  const adicionarNovoInstrumento = () => {
    if (!novoInstrumento.trim()) return;
    
    const nomeInstrumento = novoInstrumento.trim();
    setSelected(prev => ({
      ...prev,
      [nomeInstrumento]: 0
    }));
    setNovoInstrumento('');
  };

  // Calcular totais
  const totalMusicos = Object.values(selected).reduce((sum, count) => sum + (count || 0), 0);
  const totalOrganistas = organists || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <span className="text-2xl">🎼</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Contagem de Músicos</h2>
              <p className="text-green-100 text-sm">Registre a quantidade de músicos por instrumento seguindo o padrão CCB</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Controles Gerais Melhorados */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🎼</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Total Músicos</h3>
                  <p className="text-3xl font-bold text-green-700">{totalMusicos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🎹</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-800">Organistas</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setOrganists(Math.max((organists || 0) - 1, 0))}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={organists || 0}
                      onChange={(e) => setOrganists(parseInt(e.target.value) || 0)}
                      className="w-16 text-center p-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <button
                      onClick={() => setOrganists((organists || 0) + 1)}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <span className="text-white text-xl">👥</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-800">Total Geral</h3>
                  <p className="text-3xl font-bold text-purple-700">{totalMusicos + totalOrganistas}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">Reset</h3>
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Zerar Tudo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instrumentos por Família */}
          <div className="space-y-8">
            {Object.entries(familias).map(([familia, instrumentos]) => {
              const familiaColors = {
                'Cordas': 'from-amber-500 to-orange-500',
                'Madeiras': 'from-green-500 to-emerald-500', 
                'Acordeons': 'from-purple-500 to-violet-500',
                'Metais': 'from-blue-500 to-indigo-500'
              };

              const familiaIcons = {
                'Cordas': '🎻',
                'Madeiras': '🎷',
                'Acordeons': '🪗',
                'Metais': '🎺'
              };

              return (
                <div key={familia} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  <div className={`bg-gradient-to-r ${familiaColors[familia]} p-4 text-white`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{familiaIcons[familia]}</span>
                      <h3 className="text-xl font-bold">{familia}</h3>
                      <span className="ml-auto bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        {instrumentos.filter(instr => (selected[instr] || 0) > 0).length} ativos
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {instrumentos.map(instrumento => {
                        const count = selected[instrumento] || 0;
                        return (
                          <div key={instrumento} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                            <h4 className="font-semibold text-gray-800 mb-3 text-center text-sm">
                              {instrumento}
                            </h4>
                            
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <button
                                onClick={() => decrement(instrumento)}
                                className="w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={count === 0}
                              >
                                <span className="text-lg font-bold">-</span>
                              </button>
                              
                              <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(instrumento, e.target.value)}
                                className="w-20 text-center p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
                                min="0"
                              />
                              
                              <button
                                onClick={() => increment(instrumento)}
                                className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                              >
                                <span className="text-lg font-bold">+</span>
                              </button>
                            </div>
                            
                            {count > 0 && (
                              <div className="text-center">
                                <span className="inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium border border-green-200">
                                  {count} {count === 1 ? 'músico' : 'músicos'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instrumentos Extras (não padrão CCB) */}
          {Object.keys(selected).some(instr => !instrumentosPadraoCCB.includes(instr)) && (
            <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-xl font-bold">Instrumentos Extras (Não Padrão CCB)</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selected)
                    .filter(([instr]) => !instrumentosPadraoCCB.includes(instr))
                    .map(([instrumento, count]) => (
                      <div key={instrumento} className="bg-white p-4 rounded-xl border-2 border-yellow-300 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 text-center">
                          {instrumento}
                        </h4>
                        
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <button
                            onClick={() => decrement(instrumento)}
                            className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                            disabled={count === 0}
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(instrumento, e.target.value)}
                            className="w-16 text-center p-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            min="0"
                          />
                          
                          <button
                            onClick={() => increment(instrumento)}
                            className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        
                        {count > 0 && (
                          <div className="text-center">
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              {count} {count === 1 ? 'músico' : 'músicos'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Adicionar Novo Instrumento */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <h3 className="text-xl font-bold">Adicionar Novo Instrumento</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={novoInstrumento}
                  onChange={(e) => setNovoInstrumento(e.target.value)}
                  placeholder="Nome do instrumento..."
                  className="flex-1 p-4 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && adicionarNovoInstrumento()}
                />
                <button
                  onClick={adicionarNovoInstrumento}
                  disabled={!novoInstrumento.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                >
                  Adicionar
                </button>
              </div>
              
              {novoInstrumento.trim() && (
                <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-xl p-3">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Este instrumento será marcado como "não padrão CCB"</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumo Final */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl mt-8 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 p-2 rounded-lg">
                <span className="text-white text-lg">📋</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800">Resumo da Contagem</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                <p className="text-3xl font-bold text-green-700">{totalMusicos}</p>
                <p className="text-sm text-green-600 font-medium">Total de Músicos</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-3xl font-bold text-blue-700">{totalOrganistas}</p>
                <p className="text-sm text-blue-600 font-medium">Total de Organistas</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                <p className="text-3xl font-bold text-purple-700">{totalMusicos + totalOrganistas}</p>
                <p className="text-sm text-purple-600 font-medium">Total Geral</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicosPage;