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
