const express = require('express');
const router = express.Router();
const TarefaService = require('../services/TarefaService');
const ProjetoService = require('../services/ProjetoService'); // Importa o novo serviço

// Rota principal (Home)
router.get('/', (req, res) => {
  res.render('index', { titulo: 'Página Inicial' });
});

// Rota /tarefas (agora carrega os dados do serviço)
router.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await TarefaService.listar();
    res.render('tarefas', { titulo: 'Lista de Tarefas', tarefas: tarefas || [] });
  } catch (error) {
    res.status(500).render('404', { titulo: 'Erro', mensagem: error.message });
  }
});

// --- NOVA ROTA /projetos (conforme PDF) ---
router.get('/projetos', async (req, res) => {
  try {
    const projetos = await ProjetoService.listar();
    res.render('projetos', { titulo: 'Projetos', projetos: projetos || [] });
  } catch (error) {
    res.status(500).render('404', { titulo: 'Erro', mensagem: error.message });
  }
});

// Rota /sobre
router.get('/sobre', (req, res) => {
  res.render('sobre', { titulo: 'Sobre' });
});

// Rota /contato
router.get('/contato', (req, res) => {
  res.render('contato', { titulo: 'Contato' });
});

// Rota /dashboard
router.get('/dashboard', (req, res) => {
  res.render('dashboard', { titulo: 'Dashboard' });
});

// Rota /categorias
router.get('/categorias', (req, res) => {
  res.render('categorias', { titulo: 'Categorias' });
});

module.exports = router;