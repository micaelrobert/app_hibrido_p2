const express = require('express');
const router = express.Router();
const ProjetoService = require('../services/ProjetoService');

// Rota [GET] /api/projetos - Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const projetos = await ProjetoService.listar();
    res.json(projetos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota [POST] /api/projetos - Criar um novo projeto
router.post('/', async (req, res) => {
  try {
    const projeto = await ProjetoService.criar(req.body);
    res.status(201).json(projeto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota [GET] /api/projetos/:id - Buscar um projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const projeto = await ProjetoService.buscarPorId(req.params.id);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    res.json(projeto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota [PUT] /api/projetos/:id - Atualizar um projeto
router.put('/:id', async (req, res) => {
  try {
    const projeto = await ProjetoService.atualizar(req.params.id, req.body);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    res.json(projeto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota [DELETE] /api/projetos/:id - Remover um projeto
router.delete('/:id', async (req, res) => {
  try {
    const projeto = await ProjetoService.remover(req.params.id);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    res.status(204).end(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;