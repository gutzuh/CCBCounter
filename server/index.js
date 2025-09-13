import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';
import { Buffer } from 'buffer';
import { buildDocxBufferFromRow } from '../api/docx.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// Configurar origens permitidas via variável ALLOWED_ORIGINS (comma-separated)
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://ccb-counter.vercel.app'];
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(',').map(s => s.trim()) : defaultOrigins;

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const db = new sqlite3.Database('./ccb.db');

db.run(`CREATE TABLE IF NOT EXISTS contabilizacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT,
  musicians INTEGER,
  organists INTEGER,
  instruments TEXT,
  printed INTEGER DEFAULT 0
)`);

// Garantir que a instalação antiga (sem coluna `printed`) seja migrada
db.serialize(() => {
  db.all("PRAGMA table_info(contabilizacao);", (err, rows) => {
    if (err) {
      console.error('Erro ao verificar esquema da tabela contabilizacao', err);
      return;
    }
    const cols = (rows || []).map(r => r.name);
    if (!cols.includes('printed')) {
      console.log('Coluna `printed` ausente. Adicionando coluna...');
      db.run('ALTER TABLE contabilizacao ADD COLUMN printed INTEGER DEFAULT 0', (err2) => {
        if (err2) console.error('Erro ao adicionar coluna printed', err2);
        else console.log('Coluna `printed` adicionada com sucesso.');
      });
    }
  });
});

let lastState = null;

io.on('connection', (socket) => {
  console.log('Cliente socket conectado:', socket.id);

  // Sempre buscar o último registro persistido no DB e enviar ao cliente
  db.get('SELECT * FROM contabilizacao ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Erro ao buscar último registro no DB', err);
      return;
    }
    if (row) {
      const parsed = { ...row, instruments: row.instruments ? JSON.parse(row.instruments) : {}, id: row.id };
      // atualizar cache em memória
      lastState = parsed;
      socket.emit('contabilizacao', parsed);
    } else if (lastState) {
      // fallback para cache em memória se DB vazio
      socket.emit('contabilizacao', lastState);
    }
  });

  socket.on('contabilizacao', (payload) => {
    const timestamp = new Date().toISOString();
    const instrumentsJson = JSON.stringify(payload.instruments || {});
    // persist into DB
    db.run('INSERT INTO contabilizacao (data, musicians, organists, instruments) VALUES (?, ?, ?, ?)', [timestamp, payload.musicians || 0, payload.organists || 0, instrumentsJson], function (err) {
      if (err) {
        console.error('DB insert error', err);
        return;
      }
      const newRecord = { id: this.lastID, data: timestamp, musicians: payload.musicians || 0, organists: payload.organists || 0, instruments: JSON.parse(instrumentsJson), printed: 0 };
      lastState = newRecord;
      // if admin flag set, broadcast admin event first so clients prioritize
      if (payload && payload.admin) {
        const adminRecord = { ...newRecord, admin: true };
        io.emit('contabilizacao_admin', adminRecord);
      }
      io.emit('contabilizacao', newRecord);
    });
  });

  socket.on('printed', (payload) => {
    // payload may include id; otherwise use lastState
    const id = payload?.id || (lastState && lastState.id);
    if (!id) return;
    db.run('UPDATE contabilizacao SET printed = 1 WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('DB update printed error', err);
        return;
      }
      io.emit('reset');
      // atualizar cache para refletir que foi impresso
      if (lastState && lastState.id === id) {
        lastState.printed = 1;
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente socket desconectado:', socket.id);
  });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// Return the last known contabilizacao (in-memory). Useful for new clients or HTTP checks.
app.get('/last', (req, res) => {
  if (!lastState) return res.json(null);
  res.json(lastState);
});

app.get('/api/contabilizacoes', (req, res) => {
  db.all('SELECT * FROM contabilizacao ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map(r => ({ ...r, instruments: r.instruments ? JSON.parse(r.instruments) : {} }));
    res.json(parsed);
  });
});

app.get('/api/contabilizacao/:id/docx', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'id required' });

  db.get('SELECT * FROM contabilizacao WHERE id = ?', [id], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Registro não encontrado' });

    try {
      const buffer = await buildDocxBufferFromRow({ ...row, instruments: row.instruments });
      res.setHeader('Content-Disposition', `attachment; filename=ata_${id}.docx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(buffer);
    } catch (e) {
      console.error('Erro ao gerar docx', e);
      res.status(500).json({ error: 'Erro ao gerar DOCX' });
    }
  });
});

httpServer.listen(process.env.PORT || 3001, () => {
  console.log(`Servidor realtime (socket + DB) rodando na porta ${process.env.PORT || 3001}`);
});
