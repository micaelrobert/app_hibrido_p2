const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'O título da tarefa é obrigatório'],
    trim: true,
    maxlength: [100, 'O título não pode ter mais de 100 caracteres']
  },
  descricao: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'A descrição não pode ter mais de 500 caracteres']
  },
  status: {
    type: String,
    required: true,
    default: 'pendente',
    enum: ['pendente', 'em_andamento', 'concluida']
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Tarefa', TarefaSchema);