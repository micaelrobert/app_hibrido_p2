/**
  ROTAS DE PÁGINAS
 * 
 * Este arquivo contém todas as rotas relacionadas às páginas HTML
 * da nossa aplicação. Aqui você pode adicionar novas páginas facilmente.
 */

const express = require('express');
const router = express.Router();

/**
 * PÁGINA INICIAL
 * =============
 * Rota: GET /
 * Descrição: Página principal do aplicativo
 */
router.get('/', (req, res) => {
    console.log('🏠 Acessando página inicial...');
    
    // Dados para a página
    const pageData = {
        title: 'Aplicativo Híbrido - Aula 1',
        description: 'Bem-vindo ao nosso aplicativo híbrido de gerenciamento de tarefas!',
        currentTime: new Date().toLocaleString('pt-BR'),
        version: '1.0.0'
    };
    
    // Renderiza a página inicial
    res.render('index', pageData);
});

/**
 * PÁGINA SOBRE
 * ============
 * Rota: GET /sobre
 * Descrição: Página com informações sobre o projeto
 */
router.get('/sobre', (req, res) => {
    console.log('ℹ️ Acessando página sobre...');
    
    const pageData = {
        title: 'Sobre o Projeto',
        description: 'Informações sobre o aplicativo híbrido',
        features: [
            'Interface moderna e responsiva',
            'Funciona sem banco de dados',
            'API REST completa',
            'Sistema de rotas organizado'
        ],
        technologies: [
            'Node.js',
            'Express.js',
            'MongoDB (opcional)',
            'HTML5/CSS3/JavaScript'
        ]
    };
    
    res.render('sobre', pageData);
});

/**
 * PÁGINA DE CONTATO
 * =================
 * Rota: GET /contato
 * Descrição: Página de contato
 */
router.get('/contato', (req, res) => {
    console.log('📞 Acessando página de contato...');
    
    const pageData = {
        title: 'Contato',
        description: 'Entre em contato conosco',
        contactInfo: {
            email: 'professor@exemplo.com',
            telefone: '(21) 99999-9999',
            endereco: 'Universidade de Vassouras'
        }
    };
    
    res.render('contato', pageData);
});

/**
 * PÁGINA DE TAREFAS
 * =================
 * Rota: GET /tarefas
 * Descrição: Página para gerenciar tarefas
 */
router.get('/tarefas', (req, res) => {
    console.log('📋 Acessando página de tarefas...');
    
    const pageData = {
        title: 'Gerenciador de Tarefas',
        description: 'Gerencie suas tarefas de forma eficiente'
    };
    
    res.render('tarefas', pageData);
});

/**
 * PÁGINA DE DASHBOARD
 * ===================
 * Rota: GET /dashboard
 * Descrição: Dashboard com estatísticas e resumo
 */
router.get('/dashboard', (req, res) => {
    console.log('📊 Acessando dashboard...');
    
    const pageData = {
        title: 'Dashboard',
        description: 'Visão geral do seu progresso'
    };
    
    res.render('dashboard', pageData);
});

/**
 * PÁGINA DE CATEGORIAS
 * ====================
 * Rota: GET /categorias
 * Descrição: Gerenciamento de categorias/projetos
 */
router.get('/categorias', (req, res) => {
    console.log('📁 Acessando página de categorias...');
    
    const pageData = {
        title: 'Categorias e Projetos',
        description: 'Gerencie suas categorias e organize suas tarefas por projetos'
    };
    
    res.render('categorias', pageData);
});

/**
 * PÁGINA DE PROJETOS (VISUALIZAÇÃO KANBAN)
 * =========================================
 * Rota: GET /projetos
 * Descrição: Visualização em kanban organizada por projetos
 */
router.get('/projetos', (req, res) => {
    console.log('📊 Acessando visualização de projetos...');
    
    const pageData = {
        title: 'Projetos - Visualização Kanban',
        description: 'Organize suas tarefas por projetos com visualização estilo kanban'
    };
    
    res.render('projetos', pageData);
});

/**
 * PÁGINA 404
 * ==========
 * Rota: GET *
 * Descrição: Página para rotas não encontradas
 */
router.get('*', (req, res) => {
    console.log(`❌ Página não encontrada: ${req.originalUrl}`);
    
    const pageData = {
        title: 'Página não encontrada',
        description: 'A página que você procura não existe',
        requestedUrl: req.originalUrl
    };
    
    res.status(404).render('404', pageData);
});

module.exports = router;
