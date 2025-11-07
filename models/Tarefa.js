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
