// Importação dos módulos principais
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const morgan = require('morgan');
require('dotenv').config();

// Importa funções de conexão com banco de dados
const { connectToDatabase, getConnectionStatus } = require('./config/database');

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

// Configuração da engine de views EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * ROTAS PRINCIPAIS
 * =================
 * Aqui ficam as rotas principais do app. Você pode ajustar conforme
 * sua estrutura (ex: importar de /routes).
 */

// Página inicial
app.get('/', (req, res) => {
  res.render('index', { title: 'Página Inicial - ExploraSaquá' });
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

// Categorias
app.get('/categorias', (req, res) => {
  res.render('categoria', { title: 'Categorias' });
});

// Rota para verificar status da conexão com MongoDB
app.get('/status-db', (req, res) => {
  const status = getConnectionStatus();
  res.json(status);
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
