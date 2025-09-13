import React from 'react';

function CCBDataPage({ 
  cidade, setCidade,
  estado, setEstado,
  local, setLocal,
  presidencia, setPresidencia,
  palavra, setPalavra,
  encarregado, setEncarregado,
  regencia, setRegencia,
  hinos, setHinos,
  hinosNumeros, setHinosNumeros
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Dados do Ensaio Regional CCB</h2>
              <p className="text-blue-100 text-sm">Configure as informações básicas do ensaio</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Seção Localização */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <span className="text-white text-lg">📍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Localização do Ensaio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ex: SP"
                  maxLength="2"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Local do Ensaio *
                </label>
                <input
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ex: Salão de Reuniões"
                />
              </div>
            </div>
          </div>

          {/* Seção Administração */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <span className="text-white text-lg">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Administração do Ensaio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Presidência
                </label>
                <input
                  type="text"
                  value={presidencia}
                  onChange={(e) => setPresidencia(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Nome do irmão que presidiu"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Palavra
                </label>
                <input
                  type="text"
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Irmão que fez a palavra"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Encarregado Atendente
                </label>
                <input
                  type="text"
                  value={encarregado}
                  onChange={(e) => setEncarregado(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Nome do encarregado"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Regência
                </label>
                <input
                  type="text"
                  value={regencia}
                  onChange={(e) => setRegencia(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Nome do irmão regente"
                />
              </div>
            </div>
          </div>

          {/* Seção Hinos */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <span className="text-white text-lg">🎵</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Hinos Ensaiados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Quantidade de Hinos
                </label>
                <input
                  type="number"
                  value={hinos}
                  onChange={(e) => setHinos(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ex: 5"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Números dos Hinos
                </label>
                <input
                  type="text"
                  value={hinosNumeros}
                  onChange={(e) => setHinosNumeros(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ex: 123, 456, 789"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-lg">💡</span>
                <p className="text-sm text-green-700">
                  <strong>Dica:</strong> Separe os números dos hinos por vírgula (ex: 123, 456, 789). 
                  Esta informação será incluída na ata oficial do ensaio.
                </p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                <span className="text-white text-lg">📋</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800">Resumo dos Dados</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">📍 Local:</span>
                <span className="text-gray-700">
                  {cidade || 'Cidade'} - {local || 'Local'} ({estado || 'UF'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-700">👥 Administração:</span>
                <span className="text-gray-700">
                  {presidencia || 'Presidência'} | {encarregado || 'Encarregado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700">🎵 Hinos:</span>
                <span className="text-gray-700">
                  {hinos || '0'} hinos ({hinosNumeros || 'não especificados'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CCBDataPage;