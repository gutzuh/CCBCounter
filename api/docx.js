import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // service role key for server operations
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).send('id required');
  const { data: row, error } = await supabase.from('contabilizacao').select('*').eq('id', Number(id)).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!row) return res.status(404).json({ error: 'Registro não encontrado' });
  const instruments = typeof row.instruments === 'string' ? JSON.parse(row.instruments) : row.instruments || {};

  const doc = new Document();
  doc.addSection({
    children: [
      new Paragraph({ children: [new TextRun({ text: 'Igreja Evangélica Congregacional - CCB', bold: true, size: 24 })], alignment: 'center' }),
      new Paragraph({ text: 'Ata de Músicos', spacing: { before: 200, after: 200 }, alignment: 'center' }),
      new Paragraph(`Data: ${new Date(row.data).toLocaleDateString()}`),
      new Paragraph(`Músicos presentes: ${row.musicians}`),
      new Paragraph(`Organistas presentes: ${row.organists}`),
      new Paragraph({ text: '', spacing: { before: 200 } }),
      new Table({ rows: Object.entries(instruments).map(([name, count]) => new TableRow({ children: [new TableCell({ children: [new Paragraph(name)] }), new TableCell({ children: [new Paragraph(String(count))] })] })) }),
      new Paragraph({ text: '', spacing: { before: 400 } }),
      new Paragraph('__________________________________________'),
      new Paragraph('Assinatura do responsável'),
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Disposition', `attachment; filename=ata_${id}.docx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.send(Buffer.from(buffer));
}
