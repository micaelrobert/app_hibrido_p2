const express = require('express');
const router = express.Router();
const TarefaService = require('../services/TarefaService');

// Middleware de log simples
const logRequests = (req, res, next) => {
  console.log(`[API-MongoDB] Recebida requisição ${req.method} em ${req.originalUrl}`);
  next();
};

// Aplicar middleware de log para todas as rotas de tarefas
router.use('/tarefas', logRequests);

// --- Rotas CRUD para Tarefas ---

// [GET] /api/mongodb/tarefas - Listar todas as tarefas
router.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await TarefaService.listar();
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [POST] /api/mongodb/tarefas - Criar uma nova tarefa
router.post('/tarefas', async (req, res) => {
  try {
    const tarefa = await TarefaService.criar(req.body);
    res.status(201).json(tarefa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// [GET] /api/mongodb/tarefas/:id - Buscar uma tarefa por ID
router.get('/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await TarefaService.buscarPorId(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    res.json(tarefa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [PUT] /api/mongodb/tarefas/:id - Atualizar uma tarefa
router.put('/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await TarefaService.atualizar(req.params.id, req.body);
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    res.json(tarefa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// [DELETE] /api/mongodb/tarefas/:id - Remover uma tarefa
router.delete('/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await TarefaService.remover(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Exporta o router E o middleware de log, caso o index.js queira usá-lo
module.exports = router;
module.exports.logRequests = logRequests;