const Tarefa = require('../models/Tarefa');

/**
 * Camada de serviço para operações CRUD de Tarefas.
 */
class TarefaService {
  /**
   * Lista todas as tarefas.
   * @returns {Promise<Array>}
   */
  static async listar() {
    return await Tarefa.find().sort({ dataCriacao: 'desc' });
  }

  /**
   * Busca uma tarefa pelo ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async buscarPorId(id) {
    return await Tarefa.findById(id);
  }

  /**
   * Cria uma nova tarefa.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async criar(data) {
    const tarefa = new Tarefa(data);
    return await tarefa.save();
  }

  /**
   * Atualiza uma tarefa existente.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async atualizar(id, data) {
    return await Tarefa.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Remove uma tarefa.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async remover(id) {
    return await Tarefa.findByIdAndDelete(id);
  }
}

module.exports = TarefaService;