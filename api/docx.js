import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { createClient } from '@supabase/supabase-js';

// Lazy supabase client: only initialize inside the handler when env vars exist
let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

function safeParseInstruments(field) {
  if (!field) return {};
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return {};
  }
}

function safeParseMinisterio(field) {
  if (!field) return {};
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return {};
  }
}

function sumInstrumentCounts(instruments) {
  return Object.values(instruments).reduce((s, v) => s + Number(v || 0), 0);
}

export async function buildDocxBufferFromRow(row) {
  const instruments = safeParseInstruments(row.instruments);
  const ministerio = safeParseMinisterio(row.ministerio);
  
  // Calcular totais automaticamente
  const totalMusicos = sumInstrumentCounts(instruments);
  const totalOrganistas = row.organists || 0;

  // Bordas para tabelas
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1 },
    bottom: { style: BorderStyle.SINGLE, size: 1 },
    left: { style: BorderStyle.SINGLE, size: 1 },
    right: { style: BorderStyle.SINGLE, size: 1 },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
    insideVertical: { style: BorderStyle.SINGLE, size: 1 }
  };

  const doc = new Document({
    creator: "CCBCounter",
    title: "Ata de Ensaio CCB",
    sections: []
  });

  // Cabeçalho CCB
  const header1 = new Paragraph({
    children: [new TextRun({ text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', bold: true, size: 24 })],
    alignment: AlignmentType.LEFT,
    spacing: { after: 60 }
  });

  const header2 = new Paragraph({
    children: [new TextRun({ text: 'SIGEM / Administração Musical', size: 20 })],
    alignment: AlignmentType.LEFT,
    spacing: { after: 120 }
  });

  const cidade = row.cidade || 'CIDADE';
  const estado = row.estado || 'UF';
  const local = row.local || 'LOCAL DO ENSAIO';

  const title = new Paragraph({
    children: [new TextRun({ text: `ENSAIO REGIONAL - ${cidade.toUpperCase()} - ${local.toUpperCase()}`, bold: true, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 }
  });

  const date = new Paragraph({
    children: [new TextRun({ text: `Realizado em: ${row.data ? new Date(row.data).toLocaleDateString('pt-BR') : ''} - ${cidade}/${estado}`, size: 20 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 }
  });

  // Tabela de informações do ensaio
  const ensaioTable = new Table({
    borders: tableBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Presidência:', bold: true })] })], width: { size: 25, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(row.presidencia || '')], width: { size: 75, type: WidthType.PERCENTAGE } })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Palavra:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(row.palavra || '')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Encarregado Atendente:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(row.encarregado || '')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Regência:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(row.regencia || '')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Qtd. de Hinos Ensaiados:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(row.hinos || '')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(row.hinosNumeros || '')] })
        ]
      })
    ]
  });

  // Título da seção de músicos
  const musicosTitle = new Paragraph({
    children: [new TextRun({ text: 'MÚSICOS PRESENTES', bold: true, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 }
  });

  // Tabela de instrumentos - seguindo padrão CCB completo
  const instrumentRows = [];
  
  // Lista padrão de instrumentos CCB na ordem correta
  const instrumentosPadraoCCB = [
    'Violinos', 'Violas', 'Violoncelos', 'Flautas', 'Acordeons',
    'Clarinetes', 'Clarones', 'Oboés', 'Saxofones', 'Fagotes',
    'Cornets', 'Saxhorns', 'Trompetes', 'Trompas', 'Trombonitos',
    'Trombones', 'Barítonos', 'Bombardinos', 'Bombardões', 'Tubas'
  ];

  // Primeiro, adicionar instrumentos na ordem padrão CCB
  instrumentosPadraoCCB.forEach(nome => {
    const count = instruments[nome] || 0;
    instrumentRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(nome)], width: { size: 70, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph(String(count))], width: { size: 30, type: WidthType.PERCENTAGE } })
      ]
    }));
  });

  // Depois, adicionar instrumentos extras que não estão na lista padrão
  Object.entries(instruments || {}).forEach(([name, count]) => {
    if (!instrumentosPadraoCCB.includes(name)) {
      instrumentRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(name)], width: { size: 70, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(String(count))], width: { size: 30, type: WidthType.PERCENTAGE } })
        ]
      }));
    }
  });

  // Linhas de totais
  instrumentRows.push(
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total de Músicos', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(totalMusicos), bold: true })] })] })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total de Organistas', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(totalOrganistas), bold: true })] })] })
      ]
    })
  );

  const instrumentsTable = new Table({
    borders: tableBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: instrumentRows
  });

  // Título da seção de ministério
  const ministerioTitle = new Paragraph({
    children: [new TextRun({ text: 'MINISTÉRIO PRESENTE', bold: true, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 }
  });

  // Tabela de ministério - com nomes dos irmãos
  const ministerioRows = [];
  const ministerioEntries = Object.entries(ministerio || {});
  
  if (ministerioEntries.length === 0) {
    ministerioRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('—')], width: { size: 30, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph('0')], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph('—')], width: { size: 55, type: WidthType.PERCENTAGE } })
      ]
    }));
  } else {
    ministerioEntries.forEach(([cargo, nomes]) => {
      if (Array.isArray(nomes) && nomes.length > 0) {
        ministerioRows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cargo, bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph(String(nomes.length))], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph(nomes.join(', '))], width: { size: 55, type: WidthType.PERCENTAGE } })
          ]
        }));
      } else {
        // Fallback para quando for apenas um número (compatibilidade)
        ministerioRows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cargo, bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph(String(nomes))], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph('—')], width: { size: 55, type: WidthType.PERCENTAGE } })
          ]
        }));
      }
    });
  }

  const ministerioTable = new Table({
    borders: tableBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: ministerioRows
  });


  doc.addSection({
    children: [
      header1, header2, title, date, ensaioTable,
      musicosTitle, instrumentsTable,
      ministerioTitle, ministerioTable
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).send('id required');
  const client = getSupabase();
  if (!client) return res.status(500).json({ error: 'Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)' });

  const { data: row, error } = await client.from('contabilizacao').select('*').eq('id', Number(id)).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!row) return res.status(404).json({ error: 'Registro não encontrado' });

  const buffer = await buildDocxBufferFromRow(row);
  res.setHeader('Content-Disposition', `attachment; filename=ata_${id}.docx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.send(buffer);
}
