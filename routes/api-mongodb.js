/**
 * Rotas da API MongoDB para Tarefas
 *
 * Define os endpoints da API que interagem com o MongoDB Atlas,
 * utilizando o TarefaService.
 */

const express = require('express');
const router = express.Router();

// Importa o serviço com a lógica de negócios
const {
  listar,
  criar,
  remover,
  stats,
  atualizar,
  // Novos métodos da Prova 03
  buscarPorPrioridade,
  adicionarTag,
  buscarPorIntervaloData,
  marcarComoUrgente
} = require('../services/TarefaService');

/**
 * Middleware de Log
 */
const logRequests = (req, res, next) => {
  console.log(
    `[API Tarefas] Recebida requisição ${req.method} para ${req.originalUrl}`
  );
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
};

router.use(logRequests);

// ============================================================================
// 📝 ROTAS DE TAREFAS (PADRÃO)
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const tarefas = await listar();
    res.json(tarefas);
  } catch (error) {
    console.error('[Erro API Listar]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao listar tarefas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const novaTarefa = await criar(req.body);
    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('[Erro API Criar]', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao criar tarefa: ' + error.message });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const tarefaAtualizada = await atualizar(id, req.body);
    res.json({ success: true, data: tarefaAtualizada });
  } catch (error) {
    console.error('[Erro API Atualizar]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao atualizar tarefa: ' + error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await remover(id);
    res.status(204).json({ success: true });
  } catch (error) {
    console.error('[Erro API Remover]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao remover tarefa: ' + error.message });
  }
});

// ============================================================================
// 🧪 ROTAS DE TESTE DA PROVA 03
// ============================================================================

// Tarefa 1: Buscar por prioridade
// GET /api/mongodb/tarefas/filtro/prioridade/Alta
router.get('/filtro/prioridade/:nivel', async (req, res) => {
  try {
    const tarefas = await buscarPorPrioridade(req.params.nivel);
    res.json(tarefas);
  } catch (error) {
    console.error('[Erro API Prioridade]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tarefa 2: Adicionar Tag
// POST /api/mongodb/tarefas/:id/tags
router.post('/:id/tags', async (req, res) => {
  try {
    const tarefa = await adicionarTag(req.params.id, req.body.tag);
    res.json({ success: true, data: tarefa });
  } catch (error) {
    console.error('[Erro API Tag]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tarefa 3: Buscar por datas
// GET /api/mongodb/tarefas/filtro/data?inicio=2023-01-01&fim=2023-12-31
router.get('/filtro/data', async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) throw new Error('Datas de inicio e fim são obrigatórias');
    
    const tarefas = await buscarPorIntervaloData(inicio, fim);
    res.json(tarefas);
  } catch (error) {
    console.error('[Erro API Data]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tarefa 4: Marcar como Urgente
// PUT /api/mongodb/tarefas/:id/urgente
router.put('/:id/urgente', async (req, res) => {
  try {
    const tarefa = await marcarComoUrgente(req.params.id);
    res.json({ success: true, data: tarefa });
  } catch (error) {
    console.error('[Erro API Urgente]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 📊 ESTATÍSTICAS (Tarefa 5)
// ============================================================================

router.get('/stats', async (req, res) => {
  console.log('[API Tarefas] Buscando estatísticas atualizadas...');
  try {
    const estatisticas = await stats(); // Agora chama a agregação nova
    res.json({ success: true, data: estatisticas });
  } catch (error) {
    console.error('[Erro API Stats]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao buscar estatísticas' });
  }
});

module.exports = router;