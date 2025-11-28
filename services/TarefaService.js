/**
 * TarefaService
 *
 * Camada de serviço para gerenciar a lógica de negócios das Tarefas.
 * Interage com o Model 'Tarefa' do Mongoose.
 */
const Tarefa = require('../models/Tarefa');

/**
 * Lista todas as tarefas do banco de dados.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de tarefas.
 */
const listar = async () => {
  // Ordena por 'concluido' (false primeiro), depois por 'prioridade' (Alta, Media, Baixa) e depois 'dataCriacao' (mais recente)
  const prioridadeOrder = { Alta: 1, Media: 2, Baixa: 3 };
  
  // Adicionado .populate('projeto') para "juntar" os dados do projeto
  const tarefas = await Tarefa.find()
    .populate('projeto')
    .sort({ concluido: 1, dataCriacao: -1 });

  // Ordenação personalizada para prioridade
  tarefas.sort((a, b) => {
    if (a.concluido !== b.concluido) {
      return a.concluido ? 1 : -1;
    }
    return (prioridadeOrder[a.prioridade] || 99) - (prioridadeOrder[b.prioridade] || 99);
  });

  return tarefas;
};

/**
 * Cria uma nova tarefa no banco de dados.
 * @param {object} dadosTarefa - O objeto contendo os dados da nova tarefa (nome, prioridade, projeto).
 * @returns {Promise<object>} Uma promessa que resolve para o documento da nova tarefa criada.
 */
const criar = async (dadosTarefa) => {
  // Pega o campo 'projeto' do body
  const { nome, prioridade, projeto } = dadosTarefa;
  
  if (!nome || !prioridade) {
    throw new Error('Nome e prioridade são obrigatórios.');
  }

  const novaTarefa = new Tarefa({
    nome,
    prioridade,
    projeto: projeto || null, // Salva o ID do projeto, ou null se não for enviado
    concluido: false,
    tags: [] // Inicializa o array de tags vazio (compatibilidade com a prova)
  });
  
  await novaTarefa.save();
  return novaTarefa;
};

/**
 * Remove uma tarefa do banco de dados pelo ID.
 * @param {string} id - O ID da tarefa a ser removida.
 * @returns {Promise<void>}
 */
const remover = async (id) => {
  const resultado = await Tarefa.findByIdAndDelete(id);
  if (!resultado) {
    throw new Error('Tarefa não encontrada para remoção.');
  }
};

/**
 * Atualiza uma tarefa existente (concluído ou prioridade).
 * @param {string} id - O ID da tarefa a ser atualizada.
 * @param {object} dados - Os dados para atualizar (ex: { concluido: true } ou { prioridade: 'Alta' })
 * @returns {Promise<object>} A tarefa atualizada.
 */
const atualizar = async (id, dados) => {
  const camposPermitidos = {};
  if (dados.concluido != null) {
    camposPermitidos.concluido = dados.concluido;
  }
  if (dados.prioridade != null) {
    camposPermitidos.prioridade = dados.prioridade;
  }

  if (Object.keys(camposPermitidos).length === 0) {
    throw new Error('Nenhum dado válido para atualização fornecido.');
  }

  const tarefa = await Tarefa.findByIdAndUpdate(
    id,
    { $set: camposPermitidos },
    { new: true, runValidators: true }
  );

  if (!tarefa) {
    throw new Error('Tarefa não encontrada para atualização.');
  }
  return tarefa;
};

// ============================================================================
// 🧪 MÉTODOS EXIGIDOS NA PROVA 03
// ============================================================================

/**
 * Tarefa 1: Busca tarefas por prioridade (Case-insensitive)
 */
const buscarPorPrioridade = async (prioridade) => {
  return await Tarefa.buscarPorPrioridade(prioridade);
};

/**
 * Tarefa 2: Adiciona uma tag à tarefa (sem duplicatas)
 */
const adicionarTag = async (id, tag) => {
  const tarefa = await Tarefa.findById(id);
  if (!tarefa) throw new Error('Tarefa não encontrada.');
  return await tarefa.adicionarTag(tag);
};

/**
 * Tarefa 3: Busca tarefas criadas em um intervalo de datas
 */
const buscarPorIntervaloData = async (dataInicio, dataFim) => {
  return await Tarefa.buscarPorIntervaloData(new Date(dataInicio), new Date(dataFim));
};

/**
 * Tarefa 4: Marca a tarefa como urgente (Alta prioridade + tag 'urgente')
 */
const marcarComoUrgente = async (id) => {
  const tarefa = await Tarefa.findById(id);
  if (!tarefa) throw new Error('Tarefa não encontrada.');
  return await tarefa.marcarComoUrgente();
};

/**
 * Tarefa 5: Busca estatísticas agrupadas (Total + Por Prioridade)
 * Substitui a lógica manual anterior pelo método de agregação do Model.
 */
const stats = async () => {
  try {
    // Chama o método estático criado no Model (Requisito da Tarefa 5)
    const estatisticas = await Tarefa.obterEstatisticas();
    return estatisticas;
  } catch (error) {
    console.error('[Erro TarefaService.stats]', error.message);
    throw new Error('Falha ao calcular estatísticas: ' + error.message);
  }
};

// ============================================================================

/**
 * Busca estatísticas de tarefas pendentes agrupadas por projeto.
 * (Funcionalidade original mantida)
 * @returns {Promise<Array>} Um array com { projetoNome, count }.
 */
const statsPorProjeto = async () => {
  try {
    const stats = await Tarefa.aggregate([
      { $match: { concluido: false } }, // Apenas tarefas pendentes
      {
        $group: {
          _id: '$projeto', // Agrupa pelo ID do projeto
          count: { $sum: 1 }
        }
      },
      {
        $lookup: { // "Join" com a coleção de projetos
          from: 'projetos',
          localField: '_id',
          foreignField: '_id',
          as: 'projetoInfo'
        }
      },
      {
        $project: {
          _id: 0,
          // Se projetoInfo não existir (tarefa sem projeto), usa 'Sem Projeto'
          projetoNome: { $ifNull: [{ $arrayElemAt: ['$projetoInfo.nome', 0] }, 'Sem Projeto'] },
          count: 1
        }
      },
      { $sort: { count: -1 } } // Ordena pelo mais popular
    ]);
    return stats;
  } catch (error) {
    console.error('[Erro TarefaService.statsPorProjeto]', error.message);
    throw new Error('Falha ao calcular estatísticas por projeto: ' + error.message);
  }
};

// Exporta todas as funções (Originais + Prova)
module.exports = {
  listar,
  criar,
  remover,
  atualizar,
  stats,
  statsPorProjeto,
  // Novos métodos da prova
  buscarPorPrioridade,
  adicionarTag,
  buscarPorIntervaloData,
  marcarComoUrgente
};