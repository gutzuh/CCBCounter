// AtaGenerator.js - Função padronizada para geração de ata baseada no formato CCB

/**
 * Gera HTML da ata seguindo exatamente o padrão do docx.js
 * @param {Object} data - Dados para geração da ata
 * @returns {string} HTML formatado da ata
 */
export function generateAtaHTML(data) {
  const {
    cidade = 'CIDADE',
    estado = 'UF', 
    local = 'LOCAL DO ENSAIO',
    presidencia = '',
    palavra = '',
    encarregado = '',
    regencia = '',
    hinos = '',
    hinosNumeros = '',
    selected = {},
    organists = 0,
    ministerio = {},
    data: dataEnsaio
  } = data;

  // Calcular totais seguindo a mesma lógica do docx.js
  const totalMusicos = sumInstrumentCounts(selected);
  const totalOrganistas = organists || 0;

  // Data formatada
  const dateStr = dataEnsaio ? new Date(dataEnsaio).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

  // Construir tabela de instrumentos seguindo ordem padrão CCB (igual ao docx.js)
  const instrumentsHTML = buildInstrumentsTable(selected, totalMusicos, totalOrganistas);

  // Construir tabela de ministério
  const ministerioHTML = buildMinisterioTable(ministerio);

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color:#000; padding:40px; max-width: 21cm; margin: 0 auto;">
      <!-- Cabeçalho CCB -->
      <h1 style="text-align:left; font-size:18px; font-weight:bold; margin-bottom:5px; line-height: 1.2;">
        CONGREGAÇÃO CRISTÃ NO BRASIL
      </h1>
      <p style="text-align:left; font-size:14px; margin-bottom:30px; line-height: 1.2;">
        SIGEM / Administração Musical
      </p>
      
      <!-- Título do Ensaio -->
      <h2 style="text-align:center; font-size:16px; font-weight:bold; margin-bottom:10px; line-height: 1.2;">
        ENSAIO REGIONAL - ${cidade.toUpperCase()} - ${local.toUpperCase()}
      </h2>
      <p style="text-align:center; font-size:14px; margin-bottom:30px; line-height: 1.2;">
        Realizado em: ${dateStr} - ${cidade}/${estado}
      </p>

      <!-- Tabela de Informações do Ensaio -->
      <table style="width:100%; border-collapse: collapse; margin-bottom:30px; border:1px solid #333;">
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; width:25%; background-color:#f8f9fa;">Presidência:</td>
          <td style="padding:8px; border:1px solid #333;">${presidencia}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; background-color:#f8f9fa;">Palavra:</td>
          <td style="padding:8px; border:1px solid #333;">${palavra}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; background-color:#f8f9fa;">Encarregado Atendente:</td>
          <td style="padding:8px; border:1px solid #333;">${encarregado}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; background-color:#f8f9fa;">Regência:</td>
          <td style="padding:8px; border:1px solid #333;">${regencia}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; background-color:#f8f9fa;">Qtd. de Hinos Ensaiados:</td>
          <td style="padding:8px; border:1px solid #333;">${hinos}</td>
        </tr>
        <tr>
          <td style="padding:8px; border:1px solid #333; background-color:#f8f9fa;"></td>
          <td style="padding:8px; border:1px solid #333;">${hinosNumeros}</td>
        </tr>
      </table>

      <!-- Seção de Músicos -->
      <h3 style="text-align:center; font-size:16px; font-weight:bold; margin-bottom:20px; margin-top:40px;">
        MÚSICOS PRESENTES
      </h3>
      
      ${instrumentsHTML}

      <!-- Seção de Ministério -->
      ${ministerioHTML ? `
        <h3 style="text-align:center; font-size:16px; font-weight:bold; margin-bottom:20px; margin-top:40px;">
          MINISTÉRIO PRESENTE
        </h3>
        ${ministerioHTML}
      ` : ''}
    </div>
  `;
}

/**
 * Soma contagens de instrumentos (igual ao docx.js)
 */
function sumInstrumentCounts(instruments) {
  return Object.values(instruments || {}).reduce((s, v) => s + Number(v || 0), 0);
}

/**
 * Constrói tabela de instrumentos seguindo ordem padrão CCB
 */
function buildInstrumentsTable(selected, totalMusicos, totalOrganistas) {
  // Lista padrão de instrumentos CCB na ordem correta (igual ao docx.js)
  const instrumentosPadraoCCB = [
    'Violinos', 'Violas', 'Violoncelos', 'Flautas', 'Acordeons',
    'Clarinetes', 'Clarones', 'Oboés', 'Saxofones', 'Fagotes',
    'Cornets', 'Saxhorns', 'Trompetes', 'Trompas', 'Trombonitos',
    'Trombones', 'Barítonos', 'Bombardinos', 'Bombardões', 'Tubas'
  ];

  let rows = '';

  // Primeiro, instrumentos na ordem padrão CCB
  instrumentosPadraoCCB.forEach(nome => {
    const count = selected[nome] || 0;
    rows += `
      <tr>
        <td style="padding:8px; border:1px solid #333;">${nome}</td>
        <td style="text-align:center; padding:8px; border:1px solid #333;">${count}</td>
      </tr>
    `;
  });

  // Depois, instrumentos extras que não estão na lista padrão
  Object.entries(selected || {}).forEach(([name, count]) => {
    if (!instrumentosPadraoCCB.includes(name)) {
      rows += `
        <tr>
          <td style="padding:8px; border:1px solid #333; background-color:#fff3cd;">${name} *</td>
          <td style="text-align:center; padding:8px; border:1px solid #333; background-color:#fff3cd;">${count}</td>
        </tr>
      `;
    }
  });

  // Linhas de totais
  rows += `
    <tr style="background-color:#e9ecef;">
      <td style="font-weight:bold; padding:8px; border:1px solid #333;">Total de Músicos</td>
      <td style="text-align:center; font-weight:bold; padding:8px; border:1px solid #333;">${totalMusicos}</td>
    </tr>
    <tr style="background-color:#e9ecef;">
      <td style="font-weight:bold; padding:8px; border:1px solid #333;">Total de Organistas</td>
      <td style="text-align:center; font-weight:bold; padding:8px; border:1px solid #333;">${totalOrganistas}</td>
    </tr>
  `;

  return `
    <table style="width:100%; border-collapse: collapse; margin-bottom:30px; border:1px solid #333;">
      <thead>
        <tr style="background-color:#f8f9fa;">
          <th style="text-align:left; border:1px solid #333; padding:8px; font-weight:bold;">Instrumento</th>
          <th style="text-align:center; border:1px solid #333; padding:8px; font-weight:bold;">Quantidade</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Constrói tabela de ministério com nomes dos irmãos
 */
function buildMinisterioTable(ministerio) {
  const ministerioEntries = Object.entries(ministerio || {});
  
  if (ministerioEntries.length === 0) {
    return '';
  }

  let rows = '';
  
  ministerioEntries.forEach(([cargo, nomes]) => {
    if (Array.isArray(nomes) && nomes.length > 0) {
      rows += `
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; width:30%; background-color:#f8f9fa;">${cargo}</td>
          <td style="text-align:center; padding:8px; border:1px solid #333; width:15%;">${nomes.length}</td>
          <td style="padding:8px; border:1px solid #333; width:55%;">${nomes.join(', ')}</td>
        </tr>
      `;
    } else if (typeof nomes === 'number' && nomes > 0) {
      // Fallback para formato antigo (apenas números)
      rows += `
        <tr>
          <td style="font-weight:bold; padding:8px; border:1px solid #333; width:30%; background-color:#f8f9fa;">${cargo}</td>
          <td style="text-align:center; padding:8px; border:1px solid #333; width:15%;">${nomes}</td>
          <td style="padding:8px; border:1px solid #333; width:55%;">—</td>
        </tr>
      `;
    }
  });

  if (!rows) {
    return '';
  }

  return `
    <table style="width:100%; border-collapse: collapse; margin-bottom:30px; border:1px solid #333;">
      <thead>
        <tr style="background-color:#f8f9fa;">
          <th style="text-align:left; border:1px solid #333; padding:8px; font-weight:bold; width:30%;">Cargo</th>
          <th style="text-align:center; border:1px solid #333; padding:8px; font-weight:bold; width:15%;">Qtd</th>
          <th style="text-align:left; border:1px solid #333; padding:8px; font-weight:bold; width:55%;">Nomes</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Gera dados resumidos para estatísticas
 */
export function generateAtaStats(data) {
  const totalMusicos = sumInstrumentCounts(data.selected);
  const totalOrganistas = data.organists || 0;
  const totalMinisterio = Object.values(data.ministerio || {}).reduce((acc, nomes) => {
    return acc + (Array.isArray(nomes) ? nomes.length : (typeof nomes === 'number' ? nomes : 0));
  }, 0);

  return {
    totalMusicos,
    totalOrganistas,
    totalMinisterio,
    totalGeral: totalMusicos + totalOrganistas + totalMinisterio,
    instrumentosAtivos: Object.entries(data.selected || {}).filter(([_, count]) => count > 0).length,
    cargosMinisterio: Object.keys(data.ministerio || {}).length
  };
}

/**
 * Valida se os dados estão completos para geração da ata
 */
export function validateAtaData(data) {
  const errors = [];
  const warnings = [];

  // Validações obrigatórias
  if (!data.cidade || data.cidade.trim() === '') {
    errors.push('Cidade é obrigatória');
  }
  
  if (!data.estado || data.estado.trim() === '') {
    errors.push('Estado é obrigatório');
  }

  if (!data.local || data.local.trim() === '') {
    errors.push('Local do ensaio é obrigatório');
  }

  // Validações recomendadas
  if (!data.presidencia || data.presidencia.trim() === '') {
    warnings.push('Presidência não informada');
  }

  if (!data.encarregado || data.encarregado.trim() === '') {
    warnings.push('Encarregado não informado');
  }

  const totalMusicos = sumInstrumentCounts(data.selected);
  if (totalMusicos === 0) {
    warnings.push('Nenhum músico contabilizado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}