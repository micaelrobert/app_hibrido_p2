/**
 * AULA 1 - ROTAS DE API
 * 
 * Este arquivo contém todas as rotas relacionadas à API REST
 * da nossa aplicação. Aqui você pode adicionar novos endpoints.
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// 💾 ARMAZENAMENTO EM MEMÓRIA (simulando banco de dados)
// ============================================================================

// Categorias/Projetos
let categorias = [
    { 
        id: 1, 
        nome: 'Desenvolvimento', 
        cor: '#60a5fa',
        icone: '💻',
        descricao: 'Tarefas relacionadas a desenvolvimento de software',
        dataCriacao: new Date('2024-01-01').toISOString()
    },
    { 
        id: 2, 
        nome: 'Estudos', 
        cor: '#a78bfa',
        icone: '📚',
        descricao: 'Tarefas de estudo e aprendizado',
        dataCriacao: new Date('2024-01-01').toISOString()
    },
    { 
        id: 3, 
        nome: 'Pessoal', 
        cor: '#ec4899',
        icone: '🏠',
        descricao: 'Tarefas pessoais e do dia a dia',
        dataCriacao: new Date('2024-01-01').toISOString()
    },
    { 
        id: 4, 
        nome: 'Trabalho', 
        cor: '#f59e0b',
        icone: '💼',
        descricao: 'Tarefas profissionais e de trabalho',
        dataCriacao: new Date('2024-01-01').toISOString()
    }
];

let proximoCategoriaId = 5;

// Tarefas
let tarefas = [
    { 
        id: 1, 
        titulo: 'Configurar ambiente', 
        descricao: 'Configurar Node.js e instalar dependências',
        concluida: true, 
        prioridade: 'alta',
        categoriaId: 1,
        tags: ['setup', 'nodejs'],
        dataCriacao: new Date('2024-01-01').toISOString(),
        dataAtualizacao: new Date('2024-01-01').toISOString()
    },
    { 
        id: 2, 
        titulo: 'Criar rotas', 
        descricao: 'Implementar sistema de rotas do Express',
        concluida: true, 
        prioridade: 'alta',
        categoriaId: 1,
        tags: ['express', 'backend'],
        dataCriacao: new Date('2024-01-02').toISOString(),
        dataAtualizacao: new Date('2024-01-02').toISOString()
    },
    { 
        id: 3, 
        titulo: 'Implementar funcionalidades', 
        descricao: 'Adicionar funcionalidades principais do app',
        concluida: false, 
        prioridade: 'media',
        categoriaId: 1,
        tags: ['features'],
        dataCriacao: new Date('2024-01-03').toISOString(),
        dataAtualizacao: new Date('2024-01-03').toISOString()
    },
    { 
        id: 4, 
        titulo: 'Estudar React', 
        descricao: 'Aprender hooks e context API',
        concluida: false, 
        prioridade: 'media',
        categoriaId: 2,
        tags: ['react', 'frontend'],
        dataCriacao: new Date('2024-01-04').toISOString(),
        dataAtualizacao: new Date('2024-01-04').toISOString()
    },
    { 
        id: 5, 
        titulo: 'Fazer compras', 
        descricao: 'Comprar itens do supermercado',
        concluida: false, 
        prioridade: 'baixa',
        categoriaId: 3,
        tags: ['casa'],
        dataCriacao: new Date('2024-01-05').toISOString(),
        dataAtualizacao: new Date('2024-01-05').toISOString()
    }
];

let proximoId = 6;

/**
 * STATUS DA API
 * =============
 * Rota: GET /api/status
 * Descrição: Retorna informações sobre o status da API
 */
router.get('/status', (req, res) => {
    console.log('📊 Verificando status da API...');
    
    const status = {
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
        port: process.env.PORT || 3000
    };
    
    res.json(status);
});

/**
 * STATUS DO BANCO DE DADOS
 * ========================
 * Rota: GET /api/database
 * Descrição: Retorna informações sobre o banco de dados
 */
router.get('/database', async (req, res) => {
    console.log('🗄️ Verificando status do banco de dados...');
    
    try {
        const { getConnectionStatus, testConnection } = require('../config/database');
        const connectionStatus = getConnectionStatus();
        const isConnected = await testConnection();
        
        const databaseStatus = {
            connection: connectionStatus,
            isConnected: isConnected,
            timestamp: new Date().toISOString()
        };
        
        res.json(databaseStatus);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao verificar banco de dados',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * TESTE POST
 * ==========
 * Rota: POST /api/test
 * Descrição: Testa requisições POST
 */
router.post('/test', (req, res) => {
    console.log('🧪 Teste POST recebido...');
    console.log('Dados recebidos:', req.body);
    
    res.json({
        message: 'Teste POST executado com sucesso!',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// 📁 ROTAS DE CATEGORIAS/PROJETOS
// ============================================================================

/**
 * LISTAR CATEGORIAS
 * =================
 * Rota: GET /api/categorias
 * Descrição: Retorna lista de todas as categorias
 */
router.get('/categorias', (req, res) => {
    console.log('📁 Listando categorias...');
    
    // Adicionar contagem de tarefas para cada categoria
    const categoriasComContagem = categorias.map(cat => ({
        ...cat,
        totalTarefas: tarefas.filter(t => t.categoriaId === cat.id).length,
        tarefasConcluidas: tarefas.filter(t => t.categoriaId === cat.id && t.concluida).length,
        tarefasPendentes: tarefas.filter(t => t.categoriaId === cat.id && !t.concluida).length
    }));
    
    res.json({
        success: true,
        data: categoriasComContagem,
        total: categorias.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * OBTER CATEGORIA POR ID
 * ======================
 * Rota: GET /api/categorias/:id
 * Descrição: Retorna uma categoria específica
 */
router.get('/categorias/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const categoria = categorias.find(c => c.id === id);
    
    if (!categoria) {
        return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada',
            timestamp: new Date().toISOString()
        });
    }
    
    // Adicionar tarefas da categoria
    const tarefasCategoria = tarefas.filter(t => t.categoriaId === id);
    
    res.json({
        success: true,
        data: {
            ...categoria,
            tarefas: tarefasCategoria,
            totalTarefas: tarefasCategoria.length,
            tarefasConcluidas: tarefasCategoria.filter(t => t.concluida).length
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * CRIAR CATEGORIA
 * ===============
 * Rota: POST /api/categorias
 * Descrição: Cria uma nova categoria
 */
router.post('/categorias', (req, res) => {
    console.log('➕ Criando nova categoria...');
    console.log('Dados recebidos:', req.body);
    
    const { nome, cor, icone, descricao } = req.body;
    
    // Validação
    if (!nome || nome.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Nome é obrigatório',
            timestamp: new Date().toISOString()
        });
    }
    
    // Verificar se já existe categoria com mesmo nome
    if (categorias.some(c => c.nome.toLowerCase() === nome.trim().toLowerCase())) {
        return res.status(400).json({
            success: false,
            error: 'Já existe uma categoria com este nome',
            timestamp: new Date().toISOString()
        });
    }
    
    // Criar nova categoria
    const novaCategoria = {
        id: proximoCategoriaId++,
        nome: nome.trim(),
        cor: cor || '#60a5fa',
        icone: icone || '📁',
        descricao: descricao ? descricao.trim() : '',
        dataCriacao: new Date().toISOString()
    };
    
    categorias.push(novaCategoria);
    
    console.log(`✅ Categoria criada: ID ${novaCategoria.id}`);
    
    res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso!',
        data: novaCategoria,
        timestamp: new Date().toISOString()
    });
});

/**
 * ATUALIZAR CATEGORIA
 * ===================
 * Rota: PUT /api/categorias/:id
 * Descrição: Atualiza uma categoria existente
 */
router.put('/categorias/:id', (req, res) => {
    console.log(`🔄 Atualizando categoria ${req.params.id}...`);
    
    const id = parseInt(req.params.id);
    const { nome, cor, icone, descricao } = req.body;
    
    const indice = categorias.findIndex(c => c.id === id);
    
    if (indice === -1) {
        return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada',
            timestamp: new Date().toISOString()
        });
    }
    
    // Atualizar campos
    if (nome !== undefined && nome.trim() !== '') {
        categorias[indice].nome = nome.trim();
    }
    if (cor !== undefined) categorias[indice].cor = cor;
    if (icone !== undefined) categorias[indice].icone = icone;
    if (descricao !== undefined) categorias[indice].descricao = descricao.trim();
    
    console.log(`✅ Categoria ${id} atualizada`);
    
    res.json({
        success: true,
        message: 'Categoria atualizada com sucesso!',
        data: categorias[indice],
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETAR CATEGORIA
 * =================
 * Rota: DELETE /api/categorias/:id
 * Descrição: Deleta uma categoria
 */
router.delete('/categorias/:id', (req, res) => {
    console.log(`🗑️ Deletando categoria ${req.params.id}...`);
    
    const id = parseInt(req.params.id);
    const indice = categorias.findIndex(c => c.id === id);
    
    if (indice === -1) {
        return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada',
            timestamp: new Date().toISOString()
        });
    }
    
    // Verificar se há tarefas associadas
    const tarefasAssociadas = tarefas.filter(t => t.categoriaId === id);
    
    if (tarefasAssociadas.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Não é possível deletar. Existem ${tarefasAssociadas.length} tarefa(s) associada(s) a esta categoria.`,
            tarefasAssociadas: tarefasAssociadas.length,
            timestamp: new Date().toISOString()
        });
    }
    
    const categoriaRemovida = categorias.splice(indice, 1)[0];
    
    console.log(`✅ Categoria ${id} deletada`);
    
    res.json({
        success: true,
        message: 'Categoria deletada com sucesso!',
        data: categoriaRemovida,
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// 📝 ROTAS DE TAREFAS
// ============================================================================

/**
 * OBTER ESTATÍSTICAS DE TAREFAS
 * ==============================
 * Rota: GET /api/tarefas/stats
 * Descrição: Retorna estatísticas das tarefas
 * IMPORTANTE: Esta rota deve vir ANTES de GET /api/tarefas/:id
 */
router.get('/tarefas/stats', (req, res) => {
    console.log('📊 Obtendo estatísticas de tarefas...');
    
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const percentualConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    
    // Estatísticas por prioridade
    const porPrioridade = {
        alta: tarefas.filter(t => t.prioridade === 'alta').length,
        media: tarefas.filter(t => t.prioridade === 'media').length,
        baixa: tarefas.filter(t => t.prioridade === 'baixa').length
    };
    
    // Últimas 5 tarefas
    const ultimasTarefas = [...tarefas]
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 5);
    
    res.json({
        success: true,
        data: {
            total,
            concluidas,
            pendentes,
            percentualConclusao,
            porPrioridade,
            ultimasTarefas
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * LISTAR TAREFAS COM FILTROS E BUSCA
 * ===================================
 * Rota: GET /api/tarefas
 * Descrição: Retorna lista de tarefas com suporte a filtros
 * 
 * Query Parameters:
 * - categoriaId: Filtrar por categoria (número)
 * - prioridade: Filtrar por prioridade (alta|media|baixa)
 * - concluida: Filtrar por status (true|false)
 * - busca: Buscar no título e descrição (texto)
 * - tags: Filtrar por tags (string separada por vírgula)
 * - ordenar: Campo para ordenar (dataCriacao|titulo|prioridade)
 * - ordem: Ordem (asc|desc)
 */
router.get('/tarefas', (req, res) => {
    console.log('📋 Listando tarefas com filtros...');
    console.log('Query params:', req.query);
    
    let tarefasFiltradas = [...tarefas];
    
    // Filtro por categoria
    if (req.query.categoriaId) {
        const categoriaId = parseInt(req.query.categoriaId);
        tarefasFiltradas = tarefasFiltradas.filter(t => t.categoriaId === categoriaId);
        console.log(`🔍 Filtrando por categoria: ${categoriaId}`);
    }
    
    // Filtro por prioridade
    if (req.query.prioridade) {
        const prioridade = req.query.prioridade.toLowerCase();
        tarefasFiltradas = tarefasFiltradas.filter(t => t.prioridade === prioridade);
        console.log(`🔍 Filtrando por prioridade: ${prioridade}`);
    }
    
    // Filtro por status (concluída ou não)
    if (req.query.concluida !== undefined) {
        const concluida = req.query.concluida === 'true';
        tarefasFiltradas = tarefasFiltradas.filter(t => t.concluida === concluida);
        console.log(`🔍 Filtrando por status concluída: ${concluida}`);
    }
    
    // Busca por texto no título e descrição
    if (req.query.busca) {
        const busca = req.query.busca.toLowerCase();
        tarefasFiltradas = tarefasFiltradas.filter(t => 
            t.titulo.toLowerCase().includes(busca) || 
            (t.descricao && t.descricao.toLowerCase().includes(busca))
        );
        console.log(`🔍 Buscando por: "${busca}"`);
    }
    
    // Filtro por tags
    if (req.query.tags) {
        const tagsQuery = req.query.tags.toLowerCase().split(',').map(t => t.trim());
        tarefasFiltradas = tarefasFiltradas.filter(t => 
            t.tags && t.tags.some(tag => tagsQuery.includes(tag.toLowerCase()))
        );
        console.log(`🔍 Filtrando por tags: ${tagsQuery.join(', ')}`);
    }
    
    // Ordenação
    const ordenarPor = req.query.ordenar || 'dataCriacao';
    const ordem = req.query.ordem === 'asc' ? 1 : -1;
    
    tarefasFiltradas.sort((a, b) => {
        if (ordenarPor === 'titulo') {
            return ordem * a.titulo.localeCompare(b.titulo);
        } else if (ordenarPor === 'prioridade') {
            const prioridades = { alta: 3, media: 2, baixa: 1 };
            return ordem * (prioridades[b.prioridade] - prioridades[a.prioridade]);
        } else {
            return ordem * (new Date(b.dataCriacao) - new Date(a.dataCriacao));
        }
    });
    
    // Adicionar informações da categoria a cada tarefa
    const tarefasComCategoria = tarefasFiltradas.map(tarefa => {
        const categoria = categorias.find(c => c.id === tarefa.categoriaId);
        return {
            ...tarefa,
            categoria: categoria || null
        };
    });
    
    console.log(`✅ Retornando ${tarefasFiltradas.length} tarefa(s)`);
    
    res.json({
        success: true,
        data: tarefasComCategoria,
        filtros: {
            categoriaId: req.query.categoriaId || null,
            prioridade: req.query.prioridade || null,
            concluida: req.query.concluida || null,
            busca: req.query.busca || null,
            tags: req.query.tags || null
        },
        total: tarefasFiltradas.length,
        totalGeral: tarefas.length,
        concluidas: tarefasFiltradas.filter(t => t.concluida).length,
        pendentes: tarefasFiltradas.filter(t => !t.concluida).length,
        timestamp: new Date().toISOString()
    });
});

/**
 * CRIAR TAREFA
 * ============
 * Rota: POST /api/tarefas
 * Descrição: Cria uma nova tarefa
 */
router.post('/tarefas', (req, res) => {
    console.log('➕ Criando nova tarefa...');
    console.log('Dados recebidos:', req.body);
    
    const { titulo, descricao, prioridade, categoriaId, tags } = req.body;
    
    // Validação de campos obrigatórios
    if (!titulo || titulo.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Título é obrigatório',
            timestamp: new Date().toISOString()
        });
    }
    
    // Validação de prioridade
    const prioridadesValidas = ['alta', 'media', 'baixa'];
    const prioridadeFinal = prioridadesValidas.includes(prioridade) ? prioridade : 'media';
    
    // Validação de categoria (se fornecida)
    let categoriaIdFinal = categoriaId ? parseInt(categoriaId) : null;
    if (categoriaIdFinal) {
        const categoriaExiste = categorias.find(c => c.id === categoriaIdFinal);
        if (!categoriaExiste) {
            return res.status(400).json({
                success: false,
                error: 'Categoria não encontrada',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Processar tags
    let tagsFinais = [];
    if (tags) {
        if (Array.isArray(tags)) {
            tagsFinais = tags.map(t => t.trim()).filter(t => t !== '');
        } else if (typeof tags === 'string') {
            tagsFinais = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        }
    }
    
    // Criar nova tarefa
    const novaTarefa = {
        id: proximoId++,
        titulo: titulo.trim(),
        descricao: descricao ? descricao.trim() : '',
        concluida: false,
        prioridade: prioridadeFinal,
        categoriaId: categoriaIdFinal,
        tags: tagsFinais,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };
    
    // Adicionar ao array
    tarefas.push(novaTarefa);
    
    console.log(`✅ Tarefa criada: ID ${novaTarefa.id}`);
    
    // Adicionar informações da categoria
    const categoria = categoriaIdFinal ? categorias.find(c => c.id === categoriaIdFinal) : null;
    
    res.status(201).json({
        success: true,
        message: 'Tarefa criada com sucesso!',
        data: {
            ...novaTarefa,
            categoria: categoria
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * ATUALIZAR TAREFA
 * ================
 * Rota: PUT /api/tarefas/:id
 * Descrição: Atualiza uma tarefa existente
 */
router.put('/tarefas/:id', (req, res) => {
    console.log(`🔄 Atualizando tarefa ${req.params.id}...`);
    console.log('Dados recebidos:', req.body);
    
    const id = parseInt(req.params.id);
    const { titulo, descricao, concluida, prioridade, categoriaId, tags } = req.body;
    
    // Encontrar a tarefa
    const indice = tarefas.findIndex(t => t.id === id);
    
    if (indice === -1) {
        return res.status(404).json({
            success: false,
            error: 'Tarefa não encontrada',
            timestamp: new Date().toISOString()
        });
    }
    
    // Atualizar campos se fornecidos
    if (titulo !== undefined && titulo.trim() !== '') {
        tarefas[indice].titulo = titulo.trim();
    }
    
    if (descricao !== undefined) {
        tarefas[indice].descricao = descricao.trim();
    }
    
    if (concluida !== undefined) {
        tarefas[indice].concluida = Boolean(concluida);
    }
    
    if (prioridade !== undefined) {
        const prioridadesValidas = ['alta', 'media', 'baixa'];
        if (prioridadesValidas.includes(prioridade)) {
            tarefas[indice].prioridade = prioridade;
        }
    }
    
    // Atualizar categoria
    if (categoriaId !== undefined) {
        if (categoriaId === null) {
            tarefas[indice].categoriaId = null;
        } else {
            const categoriaIdInt = parseInt(categoriaId);
            const categoriaExiste = categorias.find(c => c.id === categoriaIdInt);
            if (categoriaExiste) {
                tarefas[indice].categoriaId = categoriaIdInt;
            }
        }
    }
    
    // Atualizar tags
    if (tags !== undefined) {
        let tagsFinais = [];
        if (Array.isArray(tags)) {
            tagsFinais = tags.map(t => t.trim()).filter(t => t !== '');
        } else if (typeof tags === 'string') {
            tagsFinais = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        }
        tarefas[indice].tags = tagsFinais;
    }
    
    tarefas[indice].dataAtualizacao = new Date().toISOString();
    
    console.log(`✅ Tarefa ${id} atualizada com sucesso`);
    
    // Adicionar informações da categoria
    const categoria = tarefas[indice].categoriaId ? categorias.find(c => c.id === tarefas[indice].categoriaId) : null;
    
    res.json({
        success: true,
        message: `Tarefa atualizada com sucesso!`,
        data: {
            ...tarefas[indice],
            categoria: categoria
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * DELETAR TAREFA
 * ==============
 * Rota: DELETE /api/tarefas/:id
 * Descrição: Deleta uma tarefa
 */
router.delete('/tarefas/:id', (req, res) => {
    console.log(`🗑️ Deletando tarefa ${req.params.id}...`);
    
    const id = parseInt(req.params.id);
    
    // Encontrar a tarefa
    const indice = tarefas.findIndex(t => t.id === id);
    
    if (indice === -1) {
        return res.status(404).json({
            success: false,
            error: 'Tarefa não encontrada',
            timestamp: new Date().toISOString()
        });
    }
    
    // Remover a tarefa
    const tarefaRemovida = tarefas.splice(indice, 1)[0];
    
    console.log(`✅ Tarefa ${id} deletada com sucesso`);
    
    res.json({
        success: true,
        message: 'Tarefa deletada com sucesso!',
        data: tarefaRemovida,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;