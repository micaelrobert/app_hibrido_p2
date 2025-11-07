/**
 * Rotas da API MongoDB para Tarefas
 *
 * Define os endpoints da API que interagem com o MongoDB Atlas,
 * utilizando o TarefaService.
 */

const express = require('express');
const router = express.Router();

// Importa o serviço que contém a lógica de negócios
// Adicionamos 'atualizar'
const {
  listar,
  criar,
  remover,
  stats,
  atualizar,
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

// Aplica o middleware de log para todas as rotas neste arquivo
router.use(logRequests);

// ============================================================================
// 📝 ROTAS DE TAREFAS (MongoDB)
// ============================================================================

/**
 * Rota: GET /api/mongodb/tarefas
 * Descrição: Lista todas as tarefas do MongoDB.
 */
router.get('/', async (req, res) => {
  try {
    const tarefas = await listar();
    res.json(tarefas);
  } catch (error) {
    console.error('[Erro API Listar]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao listar tarefas' });
  }
});

/**
 * Rota: POST /api/mongodb/tarefas
 * Descrição: Cria uma nova tarefa no MongoDB.
 */
router.post('/', async (req, res) => {
  try {
    const novaTarefa = await criar(req.body);
    res.status(201).json(novaTarefa); // 201 Created
  } catch (error) {
    console.error('[Erro API Criar]', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao criar tarefa: ' + error.message });
    }
  }
});

/**
 * Rota: PUT /api/mongodb/tarefas/:id
 * Descrição: Atualiza uma tarefa (concluído ou prioridade).
 */
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


/**
 * Rota: DELETE /api/mongodb/tarefas/:id
 * Descrição: Remove uma tarefa do MongoDB pelo ID.
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await remover(id);
    res.status(204).json({ success: true }); // 204 No Content
  } catch (error) {
    console.error('[Erro API Remover]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao remover tarefa: ' + error.message });
  }
});

// ============================================================================
// 📊 ROTA DE ESTATÍSTICAS (Dashboard)
// ============================================================================

/**
 * Rota: GET /api/mongodb/tarefas/stats
 * Descrição: Retorna estatísticas das tarefas para o Dashboard.
 * NOTA: Esta rota é mantida caso algo ainda a utilize,
 * mas o ideal é usar a rota unificada /api/dashboard-stats
 */
router.get('/stats', async (req, res) => {
  console.log('[API Tarefas] Recebida requisição GET para /stats');
  try {
    const estatisticas = await stats();
    res.json({ success: true, data: estatisticas });
  } catch (error) {
    console.error('[Erro API Stats]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao buscar estatísticas' });
  }
});

module.exports = router;