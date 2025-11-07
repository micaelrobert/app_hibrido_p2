const mongoose = require('mongoose');

// Esquema simples para Projetos, conforme sugerido no PDF.
const ProjetoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O campo "nome" é obrigatório.'],
    trim: true
  },
  descricao: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    default: 'Pendente',
    enum: ['Pendente', 'Em Andamento', 'Concluído']
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = mongoose.model('Projeto', ProjetoSchema);