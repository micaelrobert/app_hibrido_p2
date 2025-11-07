/**
 * 🚀 EXEMPLO PRÁTICO: USANDO MONGODB ATLAS
 * ========================================
 * 
 * Este arquivo demonstra como usar a conexão com MongoDB Atlas
 * no seu projeto de aplicativo híbrido.
 * 
 * @author Professor Lucas Nascimento
 * @version 1.0.0
 */

// Importações necessárias
const mongoose = require('mongoose');
require('dotenv').config();

// ============================================================================
// 📊 MODELO DE DADOS - SCHEMA MONGOOSE
// ============================================================================

/**
 * Schema para Tarefas
 * Define a estrutura dos dados que serão armazenados no MongoDB
 */
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
        pendentes: { $sum: { $cond: ['$concluida', 0, 1] } },
        porPrioridade: {
          $push: {
            $cond: ['$concluida', null, '$prioridade']
          }
        }
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
        },
        distribuicaoPrioridade: {
          $reduce: {
            input: '$porPrioridade',
            initialValue: { baixa: 0, media: 0, alta: 0 },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: { $add: [{ $getField: { field: '$$this', input: '$$value' } }, 1] }
                    }]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Criar o modelo
const Tarefa = mongoose.model('Tarefa', tarefaSchema);

// ============================================================================
// 🔌 FUNÇÃO DE CONEXÃO COM MONGODB ATLAS
// ============================================================================

const conectarMongoDB = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB Atlas...');
    
    // Opções de conexão otimizadas para Atlas
    const opcoes = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    await mongoose.connect(process.env.MONGODB_URI, opcoes);
    
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    console.log(`🗄️  Banco: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB Atlas:', error.message);
    return false;
  }
};

// ============================================================================
// 🧪 EXEMPLOS DE USO - OPERAÇÕES CRUD
// ============================================================================

/**
 * Exemplo 1: Criar uma nova tarefa
 */
const criarTarefa = async (dadosTarefa) => {
  try {
    const tarefa = new Tarefa(dadosTarefa);
    const tarefaSalva = await tarefa.save();
    console.log('✅ Tarefa criada:', tarefaSalva);
    return tarefaSalva;
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error.message);
    throw error;
  }
};

/**
 * Exemplo 2: Buscar todas as tarefas
 */
const buscarTodasTarefas = async (filtros = {}) => {
  try {
    const tarefas = await Tarefa.find(filtros).sort({ dataCriacao: -1 });
    console.log(`📋 Encontradas ${tarefas.length} tarefas`);
    return tarefas;
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error.message);
    throw error;
  }
};

/**
 * Exemplo 3: Buscar tarefa por ID
 */
const buscarTarefaPorId = async (id) => {
  try {
    const tarefa = await Tarefa.findById(id);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }
    console.log('📋 Tarefa encontrada:', tarefa);
    return tarefa;
  } catch (error) {
    console.error('❌ Erro ao buscar tarefa:', error.message);
    throw error;
  }
};

/**
 * Exemplo 4: Atualizar tarefa
 */
const atualizarTarefa = async (id, dadosAtualizacao) => {
  try {
    const tarefa = await Tarefa.findByIdAndUpdate(
      id, 
      dadosAtualizacao, 
      { new: true, runValidators: true }
    );
    
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }
    
    console.log('✅ Tarefa atualizada:', tarefa);
    return tarefa;
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error.message);
    throw error;
  }
};

/**
 * Exemplo 5: Deletar tarefa
 */
const deletarTarefa = async (id) => {
  try {
    const tarefa = await Tarefa.findByIdAndDelete(id);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }
    console.log('🗑️  Tarefa deletada:', tarefa);
    return tarefa;
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error.message);
    throw error;
  }
};

/**
 * Exemplo 6: Buscar tarefas por texto
 */
const buscarTarefasPorTexto = async (texto) => {
  try {
    const tarefas = await Tarefa.find({
      $text: { $search: texto }
    }, {
      score: { $meta: 'textScore' }
    }).sort({
      score: { $meta: 'textScore' }
    });
    
    console.log(`🔍 Encontradas ${tarefas.length} tarefas para "${texto}"`);
    return tarefas;
  } catch (error) {
    console.error('❌ Erro na busca por texto:', error.message);
    throw error;
  }
};

/**
 * Exemplo 7: Obter estatísticas
 */
const obterEstatisticas = async (usuario = null) => {
  try {
    const stats = await Tarefa.obterEstatisticas(usuario);
    console.log('📊 Estatísticas:', stats[0] || {});
    return stats[0] || {};
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.message);
    throw error;
  }
};

// ============================================================================
// 🎯 FUNÇÃO PRINCIPAL - DEMONSTRAÇÃO
// ============================================================================

const demonstrarUso = async () => {
  console.log('\n🚀 DEMONSTRAÇÃO DE USO DO MONGODB ATLAS');
  console.log('═'.repeat(50));
  
  // Conectar ao banco
  const conectado = await conectarMongoDB();
  if (!conectado) {
    console.log('❌ Não foi possível conectar ao banco. Encerrando...');
    return;
  }
  
  try {
    // 1. Criar algumas tarefas de exemplo
    console.log('\n📝 1. Criando tarefas de exemplo...');
    
    const tarefasExemplo = [
      {
        titulo: 'Configurar MongoDB Atlas',
        descricao: 'Conectar o projeto com MongoDB Atlas',
        prioridade: 'alta',
        categoria: 'desenvolvimento',
        tags: ['mongodb', 'atlas', 'configuracao']
      },
      {
        titulo: 'Implementar autenticação',
        descricao: 'Adicionar sistema de login e registro',
        prioridade: 'media',
        categoria: 'desenvolvimento',
        tags: ['auth', 'jwt', 'seguranca']
      },
      {
        titulo: 'Criar testes unitários',
        descricao: 'Implementar testes para as funcionalidades',
        prioridade: 'baixa',
        categoria: 'qualidade',
        tags: ['testes', 'jest', 'qualidade']
      }
    ];
    
    for (const dadosTarefa of tarefasExemplo) {
      await criarTarefa(dadosTarefa);
    }
    
    // 2. Buscar todas as tarefas
    console.log('\n📋 2. Buscando todas as tarefas...');
    const todasTarefas = await buscarTodasTarefas();
    
    // 3. Marcar uma tarefa como concluída
    console.log('\n✅ 3. Marcando primeira tarefa como concluída...');
    if (todasTarefas.length > 0) {
      await todasTarefas[0].marcarConcluida();
    }
    
    // 4. Buscar tarefas por categoria
    console.log('\n🔍 4. Buscando tarefas de desenvolvimento...');
    const tarefasDev = await Tarefa.buscarPorCategoria('desenvolvimento');
    console.log(`Encontradas ${tarefasDev.length} tarefas de desenvolvimento`);
    
    // 5. Buscar por texto
    console.log('\n🔍 5. Buscando por "MongoDB"...');
    const tarefasMongo = await buscarTarefasPorTexto('MongoDB');
    
    // 6. Obter estatísticas
    console.log('\n📊 6. Obtendo estatísticas...');
    const stats = await obterEstatisticas();
    
    // 7. Atualizar uma tarefa
    console.log('\n✏️  7. Atualizando tarefa...');
    if (todasTarefas.length > 1) {
      await atualizarTarefa(todasTarefas[1]._id, {
        prioridade: 'alta',
        descricao: 'Atualizada: Adicionar sistema de login e registro com JWT'
      });
    }
    
    console.log('\n🎉 Demonstração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a demonstração:', error.message);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB Atlas fechada');
  }
};

// ============================================================================
// 🚀 EXECUÇÃO
// ============================================================================

// Executar demonstração se este arquivo for executado diretamente
if (require.main === module) {
  demonstrarUso().catch(console.error);
}

// Exportar funções para uso em outros arquivos
module.exports = {
  Tarefa,
  conectarMongoDB,
  criarTarefa,
  buscarTodasTarefas,
  buscarTarefaPorId,
  atualizarTarefa,
  deletarTarefa,
  buscarTarefasPorTexto,
  obterEstatisticas
};

// ============================================================================
// 📚 COMO USAR ESTE ARQUIVO NO SEU PROJETO
// ============================================================================

/**
 * 1. Copie este arquivo para seu projeto
 * 2. Configure o arquivo .env com sua string de conexão do Atlas
 * 3. Execute: node exemplo-uso-mongodb.js
 * 4. Use as funções exportadas em suas rotas
 * 
 * Exemplo de uso em routes/api.js:
 * 
 * const { Tarefa, criarTarefa, buscarTodasTarefas } = require('../exemplo-uso-mongodb');
 * 
 * app.get('/api/tarefas', async (req, res) => {
 *   try {
 *     const tarefas = await buscarTodasTarefas();
 *     res.json(tarefas);
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

