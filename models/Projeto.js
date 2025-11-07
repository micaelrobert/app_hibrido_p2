/**
 * Model Projeto (Mongoose)
 *
 * Define o Schema e o Model para os Projetos no MongoDB.
 */
const mongoose = require('mongoose');

// Define o Schema do Projeto
const projetoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do projeto é obrigatório.'],
      trim: true,
      minlength: [3, 'O nome do projeto deve ter pelo menos 3 caracteres.'],
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

// Cria e exporta o Model 'Projeto'
// O Mongoose usará o nome 'Projeto' para criar a coleção 'projetos'
module.exports = mongoose.model('Projeto', projetoSchema);