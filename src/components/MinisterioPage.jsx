import React, { useState } from 'react';

function MinisterioPage({ ministerio, setMinisterio }) {
  const [novoCargo, setNovoCargo] = useState('');

  // Cargos padrão CCB
  const cargosPadrao = [
    'Anciões',
    'Diáconos', 
    'Cooperadores',
    'Cooperadores de Jovens',
    'Encarregados de Orquestra',
  ];

  const adicionarCargo = () => {
    if (!novoCargo.trim()) return;
    
    const cargoFormatado = novoCargo.trim();
    setMinisterio(prev => ({
      ...prev,
      [cargoFormatado]: prev[cargoFormatado] || 0
    }));
    setNovoCargo('');
  };

  const removerCargo = (cargo) => {
    setMinisterio(prev => {
      const novo = { ...prev };
      delete novo[cargo];
      return novo;
    });
  };

  const adicionarCargoPadrao = (cargo) => {
    setMinisterio(prev => ({
      ...prev,
      [cargo]: prev[cargo] || 0
    }));
  };

  const totalPessoas = Object.values(ministerio).reduce((total, v) => total + (Number(v) || 0), 0);
  const totalCargos = Object.keys(ministerio).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <span className="text-2xl sm:text-3xl">⛪</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Ministério Presente</h1>
                <p className="text-purple-100 text-sm sm:text-lg">Gerencie os cargos e membros presentes</p>
              </div>
            </div>
            
            {/* Estatísticas do Header */}
            <div className="flex gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="text-center bg-white bg-opacity-10 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm flex-1 sm:flex-none">
                <div className="text-xl sm:text-2xl font-bold">{totalCargos}</div>
                <div className="text-xs sm:text-sm text-purple-100">Cargos Ativos</div>
              </div>
              <div className="text-center bg-white bg-opacity-10 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm flex-1 sm:flex-none">
                <div className="text-xl sm:text-2xl font-bold">{totalPessoas}</div>
                <div className="text-xs sm:text-sm text-purple-100">Total de Pessoas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cargos Padrão CCB */}
        <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 sm:p-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">⛪</span>
                <h3 className="text-lg sm:text-xl font-bold">Cargos Padrão CCB</h3>
              </div>
              <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm w-fit">
                {cargosPadrao.filter(cargo => ministerio[cargo]).length}/{cargosPadrao.length} adicionados
              </span>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {cargosPadrao.map(cargo => (
                <button
                  key={cargo}
                  onClick={() => adicionarCargoPadrao(cargo)}
                  disabled={ministerio[cargo]}
                  className={`p-3 sm:p-4 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 transition-all duration-200 font-medium ${
                    ministerio[cargo]
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 text-green-700 cursor-not-allowed shadow-sm'
                      : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:shadow-md active:scale-95'
                  }`}
                >
                  {ministerio[cargo] ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-center">Adicionado</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-purple-600">+</span>
                      <span className="text-center leading-tight">{cargo}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Adicionar Cargo Personalizado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 sm:p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">➕</span>
              <h3 className="text-lg sm:text-xl font-bold">Adicionar Cargo Personalizado</h3>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                placeholder="Digite o nome do cargo..."
                className="flex-1 p-3 sm:p-4 border-2 border-blue-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg"
                onKeyPress={(e) => e.key === 'Enter' && adicionarCargo()}
              />
              <button
                onClick={adicionarCargo}
                disabled={!novoCargo.trim()}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl active:scale-95"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Interface para editar contagens numéricas por cargo */}
        {Object.keys(ministerio).length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 sm:p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">👥</span>
                <h3 className="text-lg sm:text-xl font-bold">Editar Contagens do Ministério</h3>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {Object.keys(ministerio).map(cargo => (
                  <div key={cargo} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{cargo}</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMinisterio(prev => ({ ...prev, [cargo]: Math.max(0, (Number(prev[cargo]) || 0) - 1) }))}
                          className="px-2 py-1 bg-gray-200 rounded"
                          title="Diminuir"
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          value={Number(ministerio[cargo] || 0)}
                          onChange={(e) => setMinisterio(prev => ({ ...prev, [cargo]: Number(e.target.value) || 0 }))}
                          className="w-24 p-2 border rounded text-center"
                        />
                        <button
                          onClick={() => setMinisterio(prev => ({ ...prev, [cargo]: (Number(prev[cargo]) || 0) + 1 }))}
                          className="px-2 py-1 bg-gray-200 rounded"
                          title="Aumentar"
                        >+</button>
                      </div>
                    </div>
                    <div className="w-28 text-right text-sm text-gray-600">{Number(ministerio[cargo] || 0)} pessoas</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de Cargos com Membros */}
        {Object.keys(ministerio).length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(ministerio).map(([cargo, nomes]) => {
              const isPadrao = cargosPadrao.includes(cargo);
              return (
                <div key={cargo} className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <div className={`p-3 sm:p-4 text-white ${isPadrao 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xl sm:text-2xl flex-shrink-0">{isPadrao ? '⛪' : '👤'}</span>
                          <h4 className="text-lg sm:text-xl font-bold truncate">{cargo}</h4>
                          <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0">
                            {Number(nomes || 0)} {Number(nomes || 0) === 1 ? 'pessoa' : 'pessoas'}
                          </span>
                        </div>
                      
                      <button
                        onClick={() => removerCargo(cargo)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors self-end sm:self-center"
                        title="Remover cargo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-500 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                      {Number(nomes || 0)} {Number(nomes || 0) === 1 ? 'pessoa' : 'pessoas'} neste cargo
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumo Final */}
        {Object.keys(ministerio).length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-6 sm:mt-8 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
                <span className="text-white text-lg">📋</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">Resumo do Ministério</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-purple-700">{totalCargos}</p>
                <p className="text-xs sm:text-sm text-purple-600 font-medium">Cargos Ativos</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-indigo-200 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-indigo-700">{totalPessoas}</p>
                <p className="text-xs sm:text-sm text-indigo-600 font-medium">Total de Pessoas</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                  {cargosPadrao.filter(cargo => ministerio[cargo]).length}
                </p>
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Cargos Padrão CCB</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há cargos */}
        {Object.keys(ministerio).length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gray-100 max-w-md mx-auto">
              <span className="text-4xl sm:text-6xl mb-4 block">⛪</span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">Nenhum cargo adicionado</h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Comece adicionando os cargos padrão CCB ou criando cargos personalizados
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MinisterioPage;