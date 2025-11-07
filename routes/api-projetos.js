/**
 * Rotas da API MongoDB para Projetos
 *
 * Define os endpoints da API que interagem com o MongoDB Atlas,
 * utilizando o ProjetoService.
 */

const express = require('express');
const router = express.Router();

// Importa o serviço que contém a lógica de negócios
const {
  listar,
  criar,
  remover,
  atualizar,
} = require('../services/ProjetoService'); 

/**
 * Middleware de Log
 */
const logRequests = (req, res, next) => {
  console.log(
    `[API Projetos] Recebida requisição ${req.method} para ${req.originalUrl}`
  );
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
};

// Aplica o middleware de log para todas as rotas neste arquivo
router.use(logRequests);

// ============================================================================
// 📁 ROTAS DE PROJETOS (MongoDB)
// ============================================================================

/**
 * Rota: GET /api/projetos
 * Descrição: Lista todos os projetos do MongoDB.
 */
router.get('/', async (req, res) => {
  try {
    const projetos = await listar();
    res.json(projetos);
  } catch (error) {
    console.error('[Erro API Listar Projetos]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao listar projetos' });
  }
});

/**
 * Rota: POST /api/projetos
 * Descrição: Cria um novo projeto no MongoDB.
 */
router.post('/', async (req, res) => {
  try {
    const novoProjeto = await criar(req.body);
    res.status(201).json(novoProjeto); // 201 Created
  } catch (error) {
    console.error('[Erro API Criar Projeto]', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao criar projeto: ' + error.message });
    }
  }
});

/**
 * Rota: PUT /api/projetos/:id
 * Descrição: Atualiza um projeto (concluído ou prioridade).
 */
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const projetoAtualizado = await atualizar(id, req.body);
    res.json({ success: true, data: projetoAtualizado });
  } catch (error) {
    console.error('[Erro API Atualizar Projeto]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao atualizar projeto: ' + error.message });
  }
});

/**
 * Rota: DELETE /api/projetos/:id
 * Descrição: Remove um projeto do MongoDB pelo ID.
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await remover(id);
    res.status(204).json({ success: true }); // 204 No Content
  } catch (error) {
    console.error('[Erro API Remover Projeto]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao remover projeto: ' + error.message });
  }
});

module.exports = router;