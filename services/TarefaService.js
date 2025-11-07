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
  
  const tarefas = await Tarefa.find().sort({ concluido: 1, dataCriacao: -1 });

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
 * @param {object} dadosTarefa - O objeto contendo os dados da nova tarefa (nome, prioridade).
 * @returns {Promise<object>} Uma promessa que resolve para o documento da nova tarefa criada.
 */
const criar = async (dadosTarefa) => {
  // Pega apenas os campos esperados para evitar sobreposição
  const { nome, prioridade } = dadosTarefa;
  
  if (!nome || !prioridade) {
    throw new Error('Nome e prioridade são obrigatórios.');
  }

  const novaTarefa = new Tarefa({
    nome,
    prioridade,
    concluido: false, // Garante que começa como não concluída
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


/**
 * Busca estatísticas de tarefas para o Dashboard.
 * @returns {Promise<object>} Um objeto com estatísticas (total, concluidas, pendentes, prioridades).
 */
const stats = async () => {
  try {
    const total = await Tarefa.countDocuments();
    const concluidas = await Tarefa.countDocuments({ concluido: true });
    const pendentes = total - concluidas;

    // Conta as prioridades APENAS das tarefas pendentes
    const prioridadesAgrupadas = await Tarefa.aggregate([
      { $match: { concluido: false } },
      { $group: { _id: '$prioridade', count: { $sum: 1 } } },
      { $project: { _id: 0, prioridade: '$_id', count: 1 } }
    ]);

    // Mapeia os resultados para um objeto limpo, garantindo que todas as chaves existam
    const prioridades = {
      'Alta': 0,
      'Media': 0,
      'Baixa': 0
    };

    prioridadesAgrupadas.forEach(p => {
      if (prioridades.hasOwnProperty(p.prioridade)) {
        prioridades[p.prioridade] = p.count;
      }
    });

    return {
      total,
      concluidas,
      pendentes,
      prioridades
    };
  } catch (error) {
    console.error('[Erro TarefaService.stats]', error.message);
    throw new Error('Falha ao calcular estatísticas de tarefas: ' + error.message);
  }
};

// Exporta as funções do serviço
module.exports = {
  listar,
  criar,
  remover,
  atualizar,
  stats,
};