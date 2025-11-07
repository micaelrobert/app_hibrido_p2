/**
 * AULA 5 - Rotas da API MongoDB
 *
 * Este arquivo define os endpoints da API que interagem
 * com o MongoDB Atlas, utilizando o TarefaService.
 */

const express = require('express');
const router = express.Router();

// Importa o serviço que contém a lógica de negócios
// Adicionamos a função 'stats' que busca as estatísticas
const { listar, criar, remover, stats } = require('../services/TarefaService');

/**
 * Middleware de Log
 * (exemplo de middleware específico para estas rotas)
 */
const logRequests = (req, res, next) => {
  console.log(`[API Tarefas] Recebida requisição ${req.method} para ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next(); // Passa para o próximo handler
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
    // Verifica se é um erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao criar tarefa' });
    }
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
    res.status(204).end(); // 204 No Content
  } catch (error) {
    console.error('[Erro API Remover]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao remover tarefa' });
  }
});

// ============================================================================
// 📊 ROTA DE ESTATÍSTICAS (Dashboard)
// ============================================================================

/**
 * Rota: GET /api/mongodb/tarefas/stats
 * Descrição: Retorna estatísticas das tarefas para o Dashboard.
 */
router.get('/stats', async (req, res) => {
  console.log('[API Tarefas] Recebida requisição GET para /stats');
  try {
    const estatisticas = await stats();
    // Retornamos no formato { success: true, data: ... }
    // para ser compatível com o que o dashboard.ejs espera
    res.json({ success: true, data: estatisticas });
  } catch (error) {
    console.error('[Erro API Stats]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao buscar estatísticas' });
  }
});


module.exports = router;