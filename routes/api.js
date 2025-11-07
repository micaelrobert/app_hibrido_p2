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
const mongodbApiProjetos = require('./api-projetos'); // Assumindo que você tem isso
const TarefaService = require('../services/TarefaService');
const ProjetoService = require('../services/ProjetoService');

/**
 * Delegação das Rotas (MongoDB)
 */
router.use('/mongodb/tarefas', mongodbApiRoutes);
router.use('/mongodb/projetos', mongodbApiProjetos); // Assumindo que você tem isso


/**
 * (ALTERADO) Endpoint unificado para o Dashboard
 * ======================================
 * Rota: GET /api/dashboard-stats
 * Descrição: Busca estatísticas de Tarefas e Projetos
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    // --- ALTERAÇÃO: Adiciona a nova estatística ---
    const [tarefasStats, projetosStats, tarefasPorProjeto] = await Promise.all([
      TarefaService.stats(),
      ProjetoService.stats(),
      TarefaService.statsPorProjeto() // <-- ADICIONADO AQUI
    ]);

    res.json({
      success: true,
      data: {
        tarefas: tarefasStats,
        projetos: projetosStats,
        tarefasPorProjeto: tarefasPorProjeto // <-- ADICIONADO AQUI
      }
    });
    // -------------------------------------------

  } catch (error) {
    console.error('[Erro API Dashboard Stats]', error.message);
    res.status(500).json({ success: false, error: 'Falha ao buscar dados do dashboard: ' + error.message });
  }
});


module.exports = router;