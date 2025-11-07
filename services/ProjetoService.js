const Projeto = require('../models/Projeto');

/**
 * Camada de serviço para operações CRUD de Projetos.
 * Abstrai a lógica de banco de dados das rotas.
 */
class ProjetoService {

  /**
   * Lista todos os projetos do banco de dados.
   * @returns {Promise<Array>} Lista de projetos.
   */
  static async listar() {
    try {
      return await Projeto.find().sort({ createdAt: 'desc' });
    } catch (error) {
      throw new Error(`Erro ao listar projetos: ${error.message}`);
    }
  }

  /**
   * Busca um projeto específico pelo ID.
   * @param {string} id - O ID do projeto.
   * @returns {Promise<Object|null>} O projeto encontrado ou null.
   */
  static async buscarPorId(id) {
    try {
      return await Projeto.findById(id);
    } catch (error) {
      throw new Error(`Erro ao buscar projeto por ID: ${error.message}`);
    }
  }

  /**
   * Cria um novo projeto.
   * @param {Object} data - Os dados do projeto (nome, descricao).
   * @returns {Promise<Object>} O projeto criado.
   */
  static async criar(data) {
    try {
      const projeto = new Projeto(data);
      return await projeto.save();
    } catch (error) {
      // Trata erros de validação do Mongoose
      if (error.name === 'ValidationError') {
        const mensagens = Object.values(error.errors).map(val => val.message).join(', ');
        throw new Error(`Erro de validação: ${mensagens}`);
      }
      throw new Error(`Erro ao criar projeto: ${error.message}`);
    }
  }

  /**
   * Atualiza um projeto existente.
   * @param {string} id - O ID do projeto a ser atualizado.
   * @param {Object} data - Os novos dados do projeto.
   * @returns {Promise<Object|null>} O projeto atualizado.
   */
  static async atualizar(id, data) {
    try {
      return await Projeto.findByIdAndUpdate(id, data, {
        new: true, // Retorna o documento modificado
        runValidators: true // Executa validadores do schema na atualização
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const mensagens = Object.values(error.errors).map(val => val.message).join(', ');
        throw new Error(`Erro de validação: ${mensagens}`);
      }
      throw new Error(`Erro ao atualizar projeto: ${error.message}`);
    }
  }

  /**
   * Remove um projeto pelo ID.
   * @param {string} id - O ID do projeto a ser removido.
   * @returns {Promise<Object|null>} O projeto que foi removido.
   */
  static async remover(id) {
    try {
      return await Projeto.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Erro ao remover projeto: ${error.message}`);
    }
  }
}

module.exports = ProjetoService;