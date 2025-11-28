/**
 * Model Tarefa (Mongoose)
 *
 * Define o Schema e o Model para as Tarefas no MongoDB.
 */
const mongoose = require('mongoose');

// Define o Schema da Tarefa
const TarefaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da tarefa é obrigatório.'],
      trim: true,
      minlength: [3, 'O nome da tarefa deve ter pelo menos 3 caracteres.'],
    },
    prioridade: {
      type: String,
      required: true,
      enum: ['Baixa', 'Media', 'Alta'],
      default: 'Media',
    },
    concluido: {
      type: Boolean,
      default: false,
    },
    // Adicionado campo 'tags' para suportar as Tarefas 2 e 4 da prova [cite: 16, 37]
    tags: {
      type: [String],
      default: []
    },
    projeto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Projeto',
      required: false // 'false' para permitir tarefas sem projeto
    }
    // ------------------
  },
  {
    // Adiciona os campos 'createdAt' e 'updatedAt' automaticamente
    timestamps: {
      createdAt: 'dataCriacao', // Mapeia 'createdAt' para 'dataCriacao'
      updatedAt: 'dataAtualizacao',
    },
    versionKey: false, // Desativa o campo '__v'
  }
);

// --- IMPLEMENTAÇÕES DA PROVA ---

// Tarefa 1: Método estático buscarPorPrioridade (Case-insensitive) [cite: 6-8]
TarefaSchema.statics.buscarPorPrioridade = function (prioridade) {
  return this.find({
    prioridade: { $regex: new RegExp(`^${prioridade}$`, 'i') }
  });
};

// Tarefa 2: Método de instância adicionarTag (Evita duplicatas) [cite: 15-17]
TarefaSchema.methods.adicionarTag = async function (tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return this; // Retorna a tarefa atual se a tag já existir
};

// Tarefa 3: Método estático buscarPorIntervaloData [cite: 26-28]
TarefaSchema.statics.buscarPorIntervaloData = function (dataInicio, dataFim) {
  return this.find({
    dataCriacao: {
      $gte: new Date(dataInicio),
      $lte: new Date(dataFim)
    }
  });
};

// Tarefa 4: Método de instância marcarComoUrgente [cite: 35-39]
TarefaSchema.methods.marcarComoUrgente = async function () {
  this.prioridade = 'Alta';
  
  // Adiciona a tag 'urgente' se não existir [cite: 37]
  if (!this.tags.includes('urgente')) {
    this.tags.push('urgente');
  }
  
  // A data de atualização é atualizada automaticamente pelo 'timestamps' do Mongoose ao salvar
  return this.save();
};

// Tarefa 5: Método estático obterEstatisticas (Agrupado por prioridade) [cite: 46-49]
TarefaSchema.statics.obterEstatisticas = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        totalGeral: [{ $count: 'count' }],
        porPrioridade: [
          {
            $group: {
              _id: '$prioridade',
              total: { $sum: 1 },
              concluidas: {
                $sum: { $cond: [{ $eq: ['$concluido', true] }, 1, 0] }
              },
              pendentes: {
                $sum: { $cond: [{ $eq: ['$concluido', false] }, 1, 0] }
              }
            }
          }
        ]
      }
    }
  ]);

  // Formata a resposta para limpar a estrutura do facet
  const resultado = stats[0];
  return {
    total: resultado.totalGeral[0] ? resultado.totalGeral[0].count : 0,
    porPrioridade: resultado.porPrioridade
  };
};

// Cria e exporta o Model 'Tarefa'
module.exports = mongoose.model('Tarefa', TarefaSchema);