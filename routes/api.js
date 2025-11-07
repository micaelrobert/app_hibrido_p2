/**
 * Roteador Principal da API
 *
 * Este arquivo é o ponto de entrada para todas as rotas /api.
 * Ele delega o tráfego para roteadores mais específicos.
 */

const express = require('express');
const router = express.Router();

// Importa os roteadores e serviços
const mongodbApiRoutes = require('./api-mongodb');
const TarefaService = require('../services/TarefaService');
const ProjetoService = require('../services/ProjetoService');

/**
 * Delegação da Rota de Tarefas (MongoDB)
 * ======================================
 * Rota: /api/mongodb/tarefas
 * Descrição: Delega tudo de /api/mongodb/tarefas para o api-mongodb.js
 */
router.use('/mongodb/tarefas', mongodbApiRoutes);


/**
 * Rota: GET /api/dashboard-stats
 * Descrição: Busca estatísticas de Tarefas e Projetos
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Busca os dois dados em paralelo
    const [tarefasStats, projetosStats] = await Promise.all([
      TarefaService.stats(),
      ProjetoService.stats()
    ]);

    res.json({
      success: true,
      data: {
        tarefas: tarefasStats,
        projetos: projetosStats
      }
    });

  } catch (error) {
    console.error('[Erro API Dashboard Stats]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao buscar dados do dashboard: ' + error.message });
  }
});


module.exports = router;