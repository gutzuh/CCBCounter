require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Configura Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Middleware de autenticação por token
function verifyToken(req, res, next) {
  const token = req.headers['x-upsert-token'];
  if (!token || token !== process.env.UPDATER_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Upsert de contabilizacao
app.post('/api/upsert', verifyToken, async (req, res) => {
  const { p_data, p_total } = req.body;
  try {
    const { error } = await supabase.rpc('upsert_contabilizacao_full', { p_data, p_total });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Upsert error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Recebe mudanças incrementais
app.post('/api/changes', verifyToken, async (req, res) => {
  const { changes } = req.body;
  // Exemplo: persistir em tabela change_log se implementada
  console.log('Changes:', changes);
  res.json({ success: true });
});

// Porta
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
