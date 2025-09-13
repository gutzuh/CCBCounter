import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';

(async function main() {
  // Dados de exemplo baseados na imagem
  const ensaioData = {
    presidencia: 'BETUEL DOS SANTOS',
    palavra: 'AOS ROMANOS CAPITULO 11 VERSICULO 33',
    encarregado: 'SERGIO ANTONIO QUEIROZ',
    regencia: 'JESSÉ MAXIMO',
    hinos: '19 Hinos',
    hinosNumeros: '232, 76, 252, 246, 217, 191, 304, 357, 247, 322, 49, 61, 210, 395, 2, 160, 411, 283, 184',
    cidade: 'Bastos',
    estado: 'SP',
    local: 'Igreja Central'
  };

  const instruments = {
    'Violinos': 26, 'Violas': 6, 'Violoncelos': 3, 'Flautas': 5, 'Acordeons': 0,
    'Clarinetes': 8, 'Clarones': 1, 'Oboés': 0, 'Saxofones': 36, 'Fagotes': 0,
    'Cornets': 0, 'Saxhorns': 0, 'Trompetes': 16, 'Trompas': 1, 'Trombonitos': 0,
    'Trombones': 3, 'Barítonos': 0, 'Bombardinos': 11, 'Bombardões': 0, 'Tubas': 7
  };

  // Agora com nomes dos irmãos, não só quantidades
  const ministerio = {
    'Encarregados Regionais': ['João Silva', 'Pedro Santos', 'André Oliveira', 'Paulo Costa', 'Lucas Ferreira'],
    'Encarregados Locais': ['José Carlos', 'Antônio Lima', 'Carlos Roberto', 'Fernando Alves', 'Ricardo Moura', 'David Gomes', 'Marcos Pereira', 'Bruno Souza', 'Rafael Martins', 'Gabriel Torres', 'Daniel Rocha', 'Felipe Barros', 'Tiago Mendes', 'Leonardo Castro', 'Eduardo Ramos', 'Rodrigo Dias', 'Mateus Franco'],
    'Examinadoras': ['Maria Santos', 'Ana Paula', 'Cristina Oliveira'],
    'Anciães': ['Roberto Machado', 'Francisco Almeida', 'Joaquim Barbosa'],
    'Diáconos': ['Marcelo Vieira', 'Alexandre Cunha'],
    'Coop. Oficiais': ['Thiago Lopes', 'Vinicius Cardoso'],
    'Coop. de Jovens': ['Matheus Silva', 'Lucas Andrade', 'Pedro Henrique', 'João Victor']
  };

  // Calcular totais automaticamente
  const totalInstruments = Object.values(instruments).reduce((sum, count) => sum + count, 0);
  const totalMusicos = totalInstruments; // Total de instrumentos = total de músicos
  const totalOrganistas = 46; // Este será vindo do banco de dados no código real

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

  const title = new Paragraph({
    children: [new TextRun({ text: `ENSAIO REGIONAL - ${ensaioData.cidade.toUpperCase()} - ${ensaioData.local.toUpperCase()}`, bold: true, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 }
  });

  const date = new Paragraph({
    children: [new TextRun({ text: `Realizado em: ${new Date().toLocaleDateString('pt-BR')} - ${ensaioData.cidade}/${ensaioData.estado}`, size: 20 })],
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
          new TableCell({ children: [new Paragraph(ensaioData.presidencia)], width: { size: 75, type: WidthType.PERCENTAGE } })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Palavra:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(ensaioData.palavra)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Encarregado Atendente:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(ensaioData.encarregado)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Regência:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(ensaioData.regencia)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Qtd. de Hinos Ensaiados:', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(ensaioData.hinos)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '', bold: true })] })] }),
          new TableCell({ children: [new Paragraph(ensaioData.hinosNumeros)] })
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

  // Tabela de instrumentos
  const instrumentRows = [];
  Object.entries(instruments).forEach(([name, count]) => {
    instrumentRows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(name)], width: { size: 70, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph(String(count))], width: { size: 30, type: WidthType.PERCENTAGE } })
      ]
    }));
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

  // Tabela de ministério - agora com nomes dos irmãos
  const ministerioRows = [];
  Object.entries(ministerio).forEach(([cargo, nomes]) => {
    if (Array.isArray(nomes) && nomes.length > 0) {
      // Primeira linha com o cargo e a quantidade
      ministerioRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cargo, bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(String(nomes.length))], width: { size: 15, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph(nomes.join(', '))], width: { size: 55, type: WidthType.PERCENTAGE } })
        ]
      }));
    }
  });

  const ministerioTable = new Table({
    borders: tableBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: ministerioRows
  });

  // Rodapé

  doc.addSection({
    children: [
      header1, title, date, ensaioTable,
      musicosTitle, instrumentsTable,
      ministerioTitle, ministerioTable,
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('test-ata-ccb.docx', buffer);
  console.log('Arquivo gerado: test-ata-ccb.docx (formato CCB completo)');
})();
