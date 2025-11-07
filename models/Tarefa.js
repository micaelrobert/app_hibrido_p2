/**
 * Model Tarefa (Mongoose)
 *
 * Define o Schema e o Model para as Tarefas no MongoDB.
 * Esta versão foi corrigida para alinhar com o TarefaService e a view tarefas.ejs.
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
    // O campo 'dataCriacao' agora é gerenciado pelo 'timestamps'
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

// Cria e exporta o Model 'Tarefa'
// O Mongoose usará o nome 'Tarefa' para criar a coleção 'tarefas'
module.exports = mongoose.model('Tarefa', TarefaSchema);