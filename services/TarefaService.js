/**
 * AULA 5 - Service de Tarefas
 *
 * Este arquivo é responsável por toda a lógica de negócios
 * (regras, validações, consultas ao DB) das Tarefas.
 * O Roteador (api-mongodb.js) e o Controller (aqui, simplificado)
 * apenas recebem as requisições e chamam os métodos deste serviço.
 */

// Importa o modelo de Tarefa
const Tarefa = require('../models/Tarefa');

/**
 * @function listar
 * @description Retorna todas as tarefas do banco de dados.
 * @returns {Promise<Array>} Lista de tarefas
 */
const listar = async () => {
  console.log('[TarefaService] Listando tarefas...');
  // .sort({ dataCriacao: -1 }) -> ordena pelas mais recentes
  return await Tarefa.find().sort({ dataCriacao: -1 });
};

/**
 * @function criar
 * @description Cria uma nova tarefa com base nos dados fornecidos.
 * @param {object} dados Os dados da tarefa (titulo, descricao, status, etc.)
 * @returns {Promise<object>} A nova tarefa criada
 */
const criar = async (dados) => {
  console.log('[TarefaService] Criando tarefa...', dados);

  // Validação simples (exemplo)
  if (!dados.titulo || dados.titulo.trim() === '') {
    throw new Error('Título é obrigatório');
  }

  // Define valores padrão se não forem fornecidos
  const dadosComPadroes = {
    titulo: dados.titulo,
    descricao: dados.descricao || '',
    status: dados.status || 'pendente',
    prioridade: dados.prioridade || 'media',
    dataCriacao: new Date(),
    dataAtualizacao: new Date()
  };

  const tarefa = new Tarefa(dadosComPadroes);
  return await tarefa.save();
};

/**
 * @function remover
 * @description Remove uma tarefa pelo seu ID.
 * @param {string} id O ID da tarefa a ser removida
 * @returns {Promise<void>}
 */
const remover = async (id) => {
  console.log(`[TarefaService] Removendo tarefa ID: ${id}`);
  
  if (!id) {
    throw new Error('ID da tarefa é obrigatório');
  }
  
  return await Tarefa.findByIdAndDelete(id);
};

/**
 * @function stats
 * @description (NOVO) Retorna estatísticas de tarefas para o Dashboard.
 * @returns {Promise<object>} Objeto com estatísticas
 */
const stats = async () => {
  console.log('[TarefaService] Calculando estatísticas...');
  
  try {
    const total = await Tarefa.countDocuments();
    const concluidas = await Tarefa.countDocuments({ status: 'concluida' });
    const pendentes = total - concluidas;
    const percentualConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    // Agregação para contar por prioridade
    const prioridadeCounts = await Tarefa.aggregate([
      {
        $group: {
          _id: '$prioridade',
          count: { $sum: 1 }
        }
      }
    ]);

    const porPrioridade = {
      alta: 0,
      media: 0,
      baixa: 0
    };

    prioridadeCounts.forEach(item => {
      if (item._id && porPrioridade.hasOwnProperty(item._id)) {
        porPrioridade[item._id] = item.count;
      }
    });
    
    // Buscar as 5 tarefas atualizadas mais recentemente
    const ultimasTarefas = await Tarefa.find()
      .sort({ dataAtualizacao: -1 }) // Ordena pela data de atualização
      .limit(5);

    return {
      total,
      concluidas,
      pendentes,
      percentualConclusao,
      porPrioridade,
      ultimasTarefas
    };

  } catch (error) {
    console.error('[Erro ao calcular stats de TarefaService]', error);
    throw new Error('Falha ao calcular estatísticas de tarefas: ' + error.message);
  }
};


// Exporta as funções para serem usadas pelos roteadores
module.exports = {
  listar,
  criar,
  remover,
  stats // <-- Exporta a nova função de stats
};