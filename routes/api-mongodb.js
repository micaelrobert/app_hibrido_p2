/**
 * AULA 2 - ROTAS DE API COM MONGODB
 * 
 * Este arquivo contém todas as rotas relacionadas à API REST
 * da nossa aplicação usando MongoDB Atlas.
 */

const express = require('express');
const router = express.Router();
const TarefaService = require('../services/TarefaService');

// Middleware para parsing JSON
router.use(express.json());

// ============================================================================
// 📊 ROTAS DE STATUS E INFORMAÇÕES
// ============================================================================

// GET /api/status - Status da API
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'MongoDB Atlas',
    endpoints: {
      tarefas: '/api/tarefas',
      estatisticas: '/api/tarefas/stats',
      categoria: '/api/tarefas/categoria/:categoria',
      buscar: '/api/tarefas/buscar/:texto'
    }
  });
});

// GET /api/info - Informações detalhadas
router.get('/info', (req, res) => {
  res.json({
    nome: 'API de Tarefas',
    versao: '2.0.0',
    descricao: 'API REST para gerenciamento de tarefas com MongoDB',
    tecnologias: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
    funcionalidades: [
      'CRUD completo de tarefas',
      'Busca por categoria',
      'Busca por texto',
      'Estatísticas',
      'Marcar como concluída',
      'Sistema de tags',
      'Prioridades'
    ],
    endpoints: {
      tarefas: {
        'GET /api/tarefas': 'Listar todas as tarefas',
        'POST /api/tarefas': 'Criar nova tarefa',
        'GET /api/tarefas/:id': 'Buscar tarefa por ID',
        'PUT /api/tarefas/:id': 'Atualizar tarefa',
        'DELETE /api/tarefas/:id': 'Deletar tarefa',
        'PATCH /api/tarefas/:id/concluir': 'Marcar como concluída'
      },
      estatisticas: {
        'GET /api/tarefas/stats': 'Obter estatísticas',
        'GET /api/tarefas/categoria/:categoria': 'Buscar por categoria',
        'GET /api/tarefas/buscar/:texto': 'Buscar por texto'
      }
    }
  });
});

// ============================================================================
// 📋 ROTAS DE TAREFAS - CRUD COMPLETO
// ============================================================================

// GET /api/tarefas - Listar todas as tarefas
router.get('/tarefas', async (req, res) => {
  try {
    const { categoria, concluida, usuario, prioridade } = req.query;
    
    // Construir filtros
    const filtros = {};
    if (categoria) filtros.categoria = categoria;
    if (concluida !== undefined) filtros.concluida = concluida === 'true';
    if (usuario) filtros.usuario = usuario;
    if (prioridade) filtros.prioridade = prioridade;
    
    const resultado = await TarefaService.buscarTodasTarefas(filtros);
    
    if (resultado.success) {
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count,
        filtros: filtros,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/tarefas - Criar nova tarefa
router.post('/tarefas', async (req, res) => {
  try {
    const { titulo, descricao, prioridade, categoria, tags, usuario } = req.body;
    
    // Validação básica
    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Título é obrigatório'
      });
    }
    
    const dadosTarefa = {
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : '',
      prioridade: prioridade || 'media',
      categoria: categoria || 'geral',
      tags: tags || [],
      usuario: usuario || 'usuario_padrao'
    };
    
    const resultado = await TarefaService.criarTarefa(dadosTarefa);
    
    if (resultado.success) {
      res.status(201).json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/tarefas/:id - Buscar tarefa por ID
router.get('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await TarefaService.buscarTarefaPorId(id);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/tarefas/:id - Atualizar tarefa
router.put('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    const resultado = await TarefaService.atualizarTarefa(id, dadosAtualizacao);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/tarefas/:id - Deletar tarefa
router.delete('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await TarefaService.deletarTarefa(id);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/tarefas/:id/concluir - Marcar como concluída
router.patch('/tarefas/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await TarefaService.marcarConcluida(id);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// ============================================================================
// 📊 ROTAS DE ESTATÍSTICAS E BUSCA
// ============================================================================

// GET /api/tarefas/stats - Obter estatísticas
router.get('/tarefas/stats', async (req, res) => {
  try {
    const { usuario } = req.query;
    
    const resultado = await TarefaService.obterEstatisticas(usuario);
    
    if (resultado.success) {
      res.json({
        success: true,
        data: resultado.data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/tarefas/categoria/:categoria - Buscar por categoria
router.get('/tarefas/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const resultado = await TarefaService.buscarPorCategoria(categoria);
    
    if (resultado.success) {
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count,
        categoria: categoria,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/tarefas/buscar/:texto - Buscar por texto
router.get('/tarefas/buscar/:texto', async (req, res) => {
  try {
    const { texto } = req.params;
    
    const resultado = await TarefaService.buscarPorTexto(texto);
    
    if (resultado.success) {
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count,
        termo: texto,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// ============================================================================
// 🎯 ROTAS DE EXEMPLO E DEMONSTRAÇÃO
// ============================================================================

// GET /api/exemplos - Exemplos de uso da API
router.get('/exemplos', (req, res) => {
  res.json({
    titulo: 'Exemplos de Uso da API de Tarefas',
    exemplos: {
      criarTarefa: {
        metodo: 'POST',
        url: '/api/tarefas',
        body: {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição da tarefa',
          prioridade: 'media',
          categoria: 'desenvolvimento',
          tags: ['tag1', 'tag2'],
          usuario: 'usuario_padrao'
        }
      },
      listarTarefas: {
        metodo: 'GET',
        url: '/api/tarefas',
        query: {
          categoria: 'desenvolvimento',
          concluida: 'false',
          prioridade: 'alta'
        }
      },
      buscarTarefa: {
        metodo: 'GET',
        url: '/api/tarefas/:id',
        exemplo: '/api/tarefas/507f1f77bcf86cd799439011'
      },
      atualizarTarefa: {
        metodo: 'PUT',
        url: '/api/tarefas/:id',
        body: {
          titulo: 'Título Atualizado',
          prioridade: 'alta',
          concluida: true
        }
      },
      marcarConcluida: {
        metodo: 'PATCH',
        url: '/api/tarefas/:id/concluir'
      },
      deletarTarefa: {
        metodo: 'DELETE',
        url: '/api/tarefas/:id'
      },
      estatisticas: {
        metodo: 'GET',
        url: '/api/tarefas/stats',
        query: {
          usuario: 'usuario_padrao'
        }
      },
      buscarPorCategoria: {
        metodo: 'GET',
        url: '/api/tarefas/categoria/desenvolvimento'
      },
      buscarPorTexto: {
        metodo: 'GET',
        url: '/api/tarefas/buscar/MongoDB'
      }
    }
  });
});

// ============================================================================
// 🚨 MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================

// Middleware para capturar erros não tratados
router.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({
    success: false,
    error: error.message,
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
