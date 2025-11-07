// Importação dos módulos principais
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Importa funções de conexão com banco de dados
const { connectToDatabase, getConnectionStatus } = require('./config/database');

// --- CORREÇÃO: Importar TODOS os roteadores ---
const mainRouter = require('./routes/pages');
const apiRouter = require('./routes/api'); // Rota de API principal (para tarefas)
const apiProjetosRouter = require('./routes/api-projetos'); // Rota da API de Projetos

// Inicializa a aplicação Express
const app = express();

// Define a porta (de variável de ambiente ou padrão)
const PORT = process.env.PORT || 3000;

// Middleware para logs de requisições HTTP
app.use(morgan('dev'));

// Middleware para interpretar dados de formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para permitir PUT e DELETE em formulários HTML
app.use(methodOverride('_method'));

// Define a pasta "public" para arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// ==============================
// Configuração do EJS + Layouts
// ==============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);             // habilita o uso de layouts
app.set('layout', 'layout');         // define 'views/layout.ejs' como layout padrão

/**
 * ROTAS
 * ======
 * As rotas de API devem vir ANTES das rotas de páginas e ANTES do 404.
 */

// Rota para verificar status da conexão com MongoDB
app.get('/status-db', (req, res) => {
  const status = getConnectionStatus();
  res.json(status);
});

// --- CORREÇÃO: Registrar Roteadores da API ---
app.use('/api', apiRouter);
app.use('/api/projetos', apiProjetosRouter);


// --- Registrar Roteador Principal (Páginas) ---
// (Deve vir depois das APIs)
app.use('/', mainRouter);

// Middleware para tratar rotas inexistentes (404)
// (Deve ser o ÚLTIMO de todos)
app.use((req, res) => {
  res.status(404).render('404', { titulo: 'Página não encontrada' });
});

/**
 * INICIALIZAÇÃO DO SERVIDOR
 * =========================
 * Tenta conectar ao banco e, em seguida, iniciar o servidor.
 */
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
};

// Inicia o servidor
startServer();