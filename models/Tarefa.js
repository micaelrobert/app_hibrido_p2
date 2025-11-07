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

// Cria e exporta o Model 'Tarefa'
module.exports = mongoose.model('Tarefa', TarefaSchema);