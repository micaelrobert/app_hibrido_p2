# 🗄️ Guia Completo: Criar Coleções e Sistema de Tarefas no MongoDB

## 📋 Índice
1. [Criando Modelos Mongoose](#criando-modelos-mongoose)
2. [Implementando Sistema de Tarefas](#implementando-sistema-de-tarefas)
3. [Atualizando Rotas da API](#atualizando-rotas-da-api)
4. [Testando o Sistema](#testando-o-sistema)
5. [Operações Avançadas](#operações-avançadas)

---

## 🏗️ 1. Criando Modelos Mongoose

### Passo 1.1: Criar Diretório de Modelos

Primeiro, vamos criar a estrutura de pastas:

```bash
mkdir models
```

### Passo 1.2: Criar Modelo de Tarefa

Crie o arquivo `models/Tarefa.js`:

```javascript
const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  concluida: {
    type: Boolean,
    default: false
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta'],
    default: 'media'
  },
  categoria: {
    type: String,
    trim: true,
    default: 'geral'
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  dataConclusao: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  usuario: {
    type: String,
    trim: true,
    default: 'usuario_padrao'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  versionKey: false // Remove o campo __v
});

// Índices para melhor performance
tarefaSchema.index({ titulo: 'text', descricao: 'text' }); // Índice de texto
tarefaSchema.index({ concluida: 1, dataCriacao: -1 }); // Índice composto
tarefaSchema.index({ usuario: 1, categoria: 1 }); // Índice composto

// Middleware para atualizar dataConclusao
tarefaSchema.pre('save', function(next) {
  if (this.concluida && !this.dataConclusao) {
    this.dataConclusao = new Date();
  } else if (!this.concluida && this.dataConclusao) {
    this.dataConclusao = null;
  }
  next();
});

// Método para marcar como concluída
tarefaSchema.methods.marcarConcluida = function() {
  this.concluida = true;
  this.dataConclusao = new Date();
  return this.save();
};

// Método estático para buscar por categoria
tarefaSchema.statics.buscarPorCategoria = function(categoria) {
  return this.find({ categoria: new RegExp(categoria, 'i') });
};

// Método estático para estatísticas
tarefaSchema.statics.obterEstatisticas = function(usuario = null) {
  const filtro = usuario ? { usuario } : {};
  
  return this.aggregate([
    { $match: filtro },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        concluidas: { $sum: { $cond: ['$concluida', 1, 0] } },
        pendentes: { $sum: { $cond: ['$concluida', 0, 1] } }
      }
    },
    {
      $project: {
        total: 1,
        concluidas: 1,
        pendentes: 1,
        percentualConcluidas: {
          $multiply: [
            { $divide: ['$concluidas', '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Tarefa', tarefaSchema);
```

### Passo 1.3: Criar Modelo de Usuário (Opcional)

Crie o arquivo `models/Usuario.js`:

```javascript
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ nome: 'text' });

module.exports = mongoose.model('Usuario', usuarioSchema);
```

---

## 🚀 2. Implementando Sistema de Tarefas

### Passo 2.1: Criar Serviço de Tarefas

Crie o arquivo `services/TarefaService.js`:

```javascript
const Tarefa = require('../models/Tarefa');

class TarefaService {
  // Criar nova tarefa
  static async criarTarefa(dadosTarefa) {
    try {
      const tarefa = new Tarefa(dadosTarefa);
      const tarefaSalva = await tarefa.save();
      return {
        success: true,
        data: tarefaSalva,
        message: 'Tarefa criada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao criar tarefa'
      };
    }
  }

  // Buscar todas as tarefas
  static async buscarTodasTarefas(filtros = {}) {
    try {
      const tarefas = await Tarefa.find(filtros).sort({ dataCriacao: -1 });
      return {
        success: true,
        data: tarefas,
        count: tarefas.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar tarefas'
      };
    }
  }

  // Buscar tarefa por ID
  static async buscarTarefaPorId(id) {
    try {
      const tarefa = await Tarefa.findById(id);
      if (!tarefa) {
        return {
          success: false,
          message: 'Tarefa não encontrada'
        };
      }
      return {
        success: true,
        data: tarefa
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar tarefa'
      };
    }
  }

  // Atualizar tarefa
  static async atualizarTarefa(id, dadosAtualizacao) {
    try {
      const tarefa = await Tarefa.findByIdAndUpdate(
        id, 
        dadosAtualizacao, 
        { new: true, runValidators: true }
      );
      
      if (!tarefa) {
        return {
          success: false,
          message: 'Tarefa não encontrada'
        };
      }
      
      return {
        success: true,
        data: tarefa,
        message: 'Tarefa atualizada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao atualizar tarefa'
      };
    }
  }

  // Deletar tarefa
  static async deletarTarefa(id) {
    try {
      const tarefa = await Tarefa.findByIdAndDelete(id);
      if (!tarefa) {
        return {
          success: false,
          message: 'Tarefa não encontrada'
        };
      }
      return {
        success: true,
        data: tarefa,
        message: 'Tarefa deletada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao deletar tarefa'
      };
    }
  }

  // Marcar tarefa como concluída
  static async marcarConcluida(id) {
    try {
      const tarefa = await Tarefa.findById(id);
      if (!tarefa) {
        return {
          success: false,
          message: 'Tarefa não encontrada'
        };
      }
      
      await tarefa.marcarConcluida();
      
      return {
        success: true,
        data: tarefa,
        message: 'Tarefa marcada como concluída!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao marcar tarefa como concluída'
      };
    }
  }

  // Buscar tarefas por categoria
  static async buscarPorCategoria(categoria) {
    try {
      const tarefas = await Tarefa.buscarPorCategoria(categoria);
      return {
        success: true,
        data: tarefas,
        count: tarefas.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar tarefas por categoria'
      };
    }
  }

  // Obter estatísticas
  static async obterEstatisticas(usuario = null) {
    try {
      const stats = await Tarefa.obterEstatisticas(usuario);
      return {
        success: true,
        data: stats[0] || { total: 0, concluidas: 0, pendentes: 0, percentualConcluidas: 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao obter estatísticas'
      };
    }
  }

  // Buscar tarefas por texto
  static async buscarPorTexto(texto) {
    try {
      const tarefas = await Tarefa.find({
        $text: { $search: texto }
      }, {
        score: { $meta: 'textScore' }
      }).sort({
        score: { $meta: 'textScore' }
      });
      
      return {
        success: true,
        data: tarefas,
        count: tarefas.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro na busca por texto'
      };
    }
  }
}

module.exports = TarefaService;
```

---

## 🛣️ 3. Atualizando Rotas da API

### Passo 3.1: Atualizar routes/api.js

Vamos atualizar o arquivo `routes/api.js` para usar MongoDB:

```javascript
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
    version: '1.0.0',
    database: 'MongoDB Atlas'
  });
});

// GET /api/info - Informações detalhadas
router.get('/info', (req, res) => {
  res.json({
    nome: 'API de Tarefas',
    versao: '1.0.0',
    descricao: 'API REST para gerenciamento de tarefas',
    tecnologias: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
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
    const { categoria, concluida, usuario } = req.query;
    
    // Construir filtros
    const filtros = {};
    if (categoria) filtros.categoria = categoria;
    if (concluida !== undefined) filtros.concluida = concluida === 'true';
    if (usuario) filtros.usuario = usuario;
    
    const resultado = await TarefaService.buscarTodasTarefas(filtros);
    
    if (resultado.success) {
      res.json({
        success: true,
        data: resultado.data,
        count: resultado.count,
        filtros: filtros
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
      res.json(resultado);
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
      res.json(resultado);
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
      res.json(resultado);
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
// 🚨 MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================

// Middleware para capturar erros não tratados
router.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({
    success: false,
    error: error.message,
    message: 'Erro interno do servidor'
  });
});

module.exports = router;
```

---

## 🧪 4. Testando o Sistema

### Passo 4.1: Criar Script de Teste

Crie o arquivo `testar-sistema-tarefas.js`:

```javascript
const mongoose = require('mongoose');
const TarefaService = require('./services/TarefaService');
require('dotenv').config();

// Cores para o console
const cores = {
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (cor, mensagem) => {
  console.log(`${cor}${mensagem}${cores.reset}`);
};

// Função para testar o sistema completo
const testarSistema = async () => {
  console.log('\n🧪 TESTE COMPLETO DO SISTEMA DE TAREFAS');
  console.log('═'.repeat(50));
  
  try {
    // Conectar ao MongoDB
    log(cores.azul, '🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(cores.verde, '✅ Conectado ao MongoDB!');
    
    // Teste 1: Criar tarefas
    log(cores.amarelo, '\n📝 Teste 1: Criando tarefas...');
    
    const tarefasTeste = [
      {
        titulo: 'Configurar MongoDB Atlas',
        descricao: 'Conectar o projeto com MongoDB Atlas',
        prioridade: 'alta',
        categoria: 'desenvolvimento',
        tags: ['mongodb', 'atlas', 'configuracao']
      },
      {
        titulo: 'Implementar sistema de tarefas',
        descricao: 'Criar CRUD completo para tarefas',
        prioridade: 'alta',
        categoria: 'desenvolvimento',
        tags: ['crud', 'api', 'tarefas']
      },
      {
        titulo: 'Criar testes unitários',
        descricao: 'Implementar testes para as funcionalidades',
        prioridade: 'media',
        categoria: 'qualidade',
        tags: ['testes', 'jest', 'qualidade']
      }
    ];
    
    const tarefasCriadas = [];
    for (const dadosTarefa of tarefasTeste) {
      const resultado = await TarefaService.criarTarefa(dadosTarefa);
      if (resultado.success) {
        tarefasCriadas.push(resultado.data);
        log(cores.verde, `✅ Tarefa criada: ${resultado.data.titulo}`);
      } else {
        log(cores.vermelho, `❌ Erro ao criar tarefa: ${resultado.message}`);
      }
    }
    
    // Teste 2: Buscar todas as tarefas
    log(cores.amarelo, '\n📋 Teste 2: Buscando todas as tarefas...');
    const todasTarefas = await TarefaService.buscarTodasTarefas();
    if (todasTarefas.success) {
      log(cores.verde, `✅ Encontradas ${todasTarefas.count} tarefas`);
    }
    
    // Teste 3: Marcar tarefa como concluída
    log(cores.amarelo, '\n✅ Teste 3: Marcando primeira tarefa como concluída...');
    if (tarefasCriadas.length > 0) {
      const resultado = await TarefaService.marcarConcluida(tarefasCriadas[0]._id);
      if (resultado.success) {
        log(cores.verde, '✅ Tarefa marcada como concluída!');
      }
    }
    
    // Teste 4: Buscar por categoria
    log(cores.amarelo, '\n🔍 Teste 4: Buscando tarefas de desenvolvimento...');
    const tarefasDev = await TarefaService.buscarPorCategoria('desenvolvimento');
    if (tarefasDev.success) {
      log(cores.verde, `✅ Encontradas ${tarefasDev.count} tarefas de desenvolvimento`);
    }
    
    // Teste 5: Obter estatísticas
    log(cores.amarelo, '\n📊 Teste 5: Obtendo estatísticas...');
    const stats = await TarefaService.obterEstatisticas();
    if (stats.success) {
      log(cores.verde, '✅ Estatísticas obtidas:');
      console.log(`   Total: ${stats.data.total}`);
      console.log(`   Concluídas: ${stats.data.concluidas}`);
      console.log(`   Pendentes: ${stats.data.pendentes}`);
      console.log(`   Percentual: ${stats.data.percentualConcluidas?.toFixed(1)}%`);
    }
    
    // Teste 6: Buscar por texto
    log(cores.amarelo, '\n🔍 Teste 6: Buscando por "MongoDB"...');
    const busca = await TarefaService.buscarPorTexto('MongoDB');
    if (busca.success) {
      log(cores.verde, `✅ Encontradas ${busca.count} tarefas com "MongoDB"`);
    }
    
    // Teste 7: Atualizar tarefa
    log(cores.amarelo, '\n✏️  Teste 7: Atualizando tarefa...');
    if (tarefasCriadas.length > 1) {
      const resultado = await TarefaService.atualizarTarefa(tarefasCriadas[1]._id, {
        prioridade: 'alta',
        descricao: 'Atualizada: Implementar sistema completo de tarefas com CRUD'
      });
      if (resultado.success) {
        log(cores.verde, '✅ Tarefa atualizada!');
      }
    }
    
    log(cores.verde, '\n🎉 TODOS OS TESTES PASSARAM!');
    log(cores.verde, '✅ Sistema de tarefas funcionando perfeitamente!');
    
  } catch (error) {
    log(cores.vermelho, '\n❌ ERRO DURANTE OS TESTES:');
    log(cores.vermelho, `💥 ${error.message}`);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    log(cores.azul, '\n🔌 Conexão com MongoDB fechada');
  }
};

// Executar testes
if (require.main === module) {
  testarSistema().catch(console.error);
}

module.exports = { testarSistema };
```

### Passo 4.2: Adicionar Script ao package.json

Atualize o `package.json`:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "test:mongodb": "node testar-conexao-atlas.js",
    "exemplo:mongodb": "node exemplo-uso-mongodb.js",
    "test:tarefas": "node testar-sistema-tarefas.js"
  }
}
```

---

## 🚀 5. Operações Avançadas

### Passo 5.1: Criar Seed de Dados

Crie o arquivo `scripts/seed-tarefas.js`:

```javascript
const mongoose = require('mongoose');
const TarefaService = require('../services/TarefaService');
require('dotenv').config();

const dadosSeed = [
  {
    titulo: 'Configurar MongoDB Atlas',
    descricao: 'Conectar o projeto com MongoDB Atlas e configurar conexão',
    prioridade: 'alta',
    categoria: 'desenvolvimento',
    tags: ['mongodb', 'atlas', 'configuracao'],
    usuario: 'admin'
  },
  {
    titulo: 'Implementar autenticação',
    descricao: 'Adicionar sistema de login e registro de usuários',
    prioridade: 'alta',
    categoria: 'desenvolvimento',
    tags: ['auth', 'jwt', 'seguranca'],
    usuario: 'admin'
  },
  {
    titulo: 'Criar testes unitários',
    descricao: 'Implementar testes para todas as funcionalidades',
    prioridade: 'media',
    categoria: 'qualidade',
    tags: ['testes', 'jest', 'qualidade'],
    usuario: 'admin'
  },
  {
    titulo: 'Documentar API',
    descricao: 'Criar documentação completa da API',
    prioridade: 'media',
    categoria: 'documentacao',
    tags: ['docs', 'api', 'swagger'],
    usuario: 'admin'
  },
  {
    titulo: 'Implementar cache',
    descricao: 'Adicionar sistema de cache para melhorar performance',
    prioridade: 'baixa',
    categoria: 'performance',
    tags: ['cache', 'redis', 'performance'],
    usuario: 'admin'
  }
];

const executarSeed = async () => {
  try {
    console.log('🌱 Executando seed de dados...');
    
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB!');
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await mongoose.connection.db.collection('tarefas').deleteMany({});
    
    // Criar dados de seed
    console.log('📝 Criando dados de seed...');
    for (const dadosTarefa of dadosSeed) {
      const resultado = await TarefaService.criarTarefa(dadosTarefa);
      if (resultado.success) {
        console.log(`✅ Tarefa criada: ${resultado.data.titulo}`);
      } else {
        console.log(`❌ Erro ao criar tarefa: ${resultado.message}`);
      }
    }
    
    console.log('🎉 Seed executado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
  }
};

if (require.main === module) {
  executarSeed();
}

module.exports = { executarSeed };
```

### Passo 5.2: Criar Script de Backup

Crie o arquivo `scripts/backup-tarefas.js`:

```javascript
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const fazerBackup = async () => {
  try {
    console.log('💾 Iniciando backup das tarefas...');
    
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB!');
    
    // Buscar todas as tarefas
    const tarefas = await mongoose.connection.db.collection('tarefas').find({}).toArray();
    console.log(`📋 Encontradas ${tarefas.length} tarefas`);
    
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tarefas-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    // Salvar backup
    fs.writeFileSync(filepath, JSON.stringify(tarefas, null, 2));
    console.log(`✅ Backup salvo em: ${filepath}`);
    
    // Estatísticas do backup
    const stats = {
      totalTarefas: tarefas.length,
      concluidas: tarefas.filter(t => t.concluida).length,
      pendentes: tarefas.filter(t => !t.concluida).length,
      categorias: [...new Set(tarefas.map(t => t.categoria))],
      usuarios: [...new Set(tarefas.map(t => t.usuario))]
    };
    
    console.log('📊 Estatísticas do backup:');
    console.log(`   Total: ${stats.totalTarefas}`);
    console.log(`   Concluídas: ${stats.concluidas}`);
    console.log(`   Pendentes: ${stats.pendentes}`);
    console.log(`   Categorias: ${stats.categorias.join(', ')}`);
    console.log(`   Usuários: ${stats.usuarios.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erro durante o backup:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
  }
};

if (require.main === module) {
  fazerBackup();
}

module.exports = { fazerBackup };
```

---

## 📋 Comandos para Executar

### 1. Criar Estrutura de Pastas
```bash
mkdir models
mkdir services
mkdir scripts
mkdir backups
```

### 2. Testar Sistema
```bash
# Testar conexão
npm run test:mongodb

# Testar sistema de tarefas
npm run test:tarefas

# Executar seed de dados
node scripts/seed-tarefas.js

# Fazer backup
node scripts/backup-tarefas.js
```

### 3. Iniciar Servidor
```bash
npm start
```

### 4. Testar API
```bash
# Listar tarefas
curl http://localhost:3001/api/tarefas

# Criar tarefa
curl -X POST http://localhost:3001/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Nova Tarefa","descricao":"Descrição da tarefa","prioridade":"media"}'

# Obter estatísticas
curl http://localhost:3001/api/tarefas/stats
```

---

## ✅ Checklist Final

- [ ] Modelos Mongoose criados
- [ ] Serviço de tarefas implementado
- [ ] Rotas da API atualizadas
- [ ] Scripts de teste criados
- [ ] Sistema testado e funcionando
- [ ] Dados de seed executados
- [ ] Backup configurado

---

**🎉 Parabéns! Seu sistema de tarefas está completo e funcionando!**

*Criado por: Professor Lucas Nascimento - Universidade de Vassouras*
