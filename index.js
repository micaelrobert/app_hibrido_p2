require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const { logRequests } = require('./routes/api-mongodb'); // Importando o middleware

const app = express();
const port = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Middlewares Essenciais
app.use(cors()); // Habilita CORS para todas as origens
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear dados de formulário

// --- NOVO: Servir arquivos estáticos da pasta 'public' ---
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware de Log de Requisições (Exemplo) ---
// Usando o middleware importado de api-mongodb.js para rotas específicas
app.use('/api/mongodb/tarefas', logRequests);

// --- Rotas da Aplicação ---

// Rotas de Páginas EJS
const pageRoutes = require('./routes/pages');
app.use('/', pageRoutes);

// Rotas da API principal (que delega para api-mongodb.js)
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// --- NOVO: Rotas da API de Projetos ---
const apiProjetosRouter = require('./routes/api-projetos');
app.use('/api/projetos', apiProjetosRouter);


// --- Tratamento de Erro 404 ---
app.use((req, res) => {
  res.status(404).render('404', { 
    titulo: '404 - Não Encontrado',
    mensagem: 'A página que você procura não existe.' 
  });
});

// --- Iniciando o Servidor ---
app.listen(port, () => {
  console.log(`[Servidor] Aplicação rodando em http://localhost:${port}`);
});