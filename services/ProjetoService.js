/**
 * ProjetoService
 *
 * Camada de serviço para gerenciar a lógica de negócios dos Projetos.
 * Interage com o Model 'Projeto' do Mongoose.
 */
const Projeto = require('../models/Projeto');

/**
 * Lista todos os projetos do banco de dados.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de projetos.
 */
const listar = async () => {
  // Ordena por 'concluido' (false primeiro), depois por 'prioridade' (Alta, Media, Baixa) e depois 'dataCriacao' (mais recente)
  const prioridadeOrder = { Alta: 1, Media: 2, Baixa: 3 };
  
  const projetos = await Projeto.find().sort({ concluido: 1, dataCriacao: -1 });

  // Ordenação personalizada para prioridade
  projetos.sort((a, b) => {
    if (a.concluido !== b.concluido) {
      return a.concluido ? 1 : -1;
    }
    return (prioridadeOrder[a.prioridade] || 99) - (prioridadeOrder[b.prioridade] || 99);
  });
  
  return projetos;
};

/**
 * Cria um novo projeto no banco de dados.
 * @param {object} dadosProjeto - O objeto contendo os dados do novo projeto (nome, prioridade).
 * @returns {Promise<object>} Uma promessa que resolve para o documento do novo projeto criado.
 */
const criar = async (dadosProjeto) => {
  const { nome, prioridade } = dadosProjeto;

  if (!nome || !prioridade) {
    throw new Error('Nome e prioridade são obrigatórios.');
  }
  
  const novoProjeto = new Projeto({
    nome,
    prioridade,
    concluido: false,
  });

  await novoProjeto.save();
  return novoProjeto;
};

/**
 * Remove um projeto do banco de dados pelo ID.
 * @param {string} id - O ID do projeto a ser removido.
 * @returns {Promise<void>}
 */
const remover = async (id) => {
  const resultado = await Projeto.findByIdAndDelete(id);
  if (!resultado) {
    throw new Error('Projeto não encontrado para remoção.');
  }
};

/**
 * Atualiza um projeto existente (concluído ou prioridade).
 * @param {string} id - O ID da projeto a ser atualizada.
 * @param {object} dados - Os dados para atualizar (ex: { concluido: true } ou { prioridade: 'Alta' })
 * @returns {Promise<object>} O projeto atualizado.
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

  const projeto = await Projeto.findByIdAndUpdate(
    id,
    { $set: camposPermitidos },
    { new: true, runValidators: true }
  );

  if (!projeto) {
    throw new Error('Projeto não encontrado para atualização.');
  }
  return projeto;
};

/**
 * Busca estatísticas de projetos para o Dashboard.
 * @returns {Promise<object>} Um objeto com estatísticas (total, concluidos, pendentes, prioridades).
 */
const stats = async () => {
  try {
    const total = await Projeto.countDocuments();
    const concluidas = await Projeto.countDocuments({ concluido: true });
    const pendentes = total - concluidas;

    // Conta as prioridades APENAS dos projetos pendentes
    const prioridadesAgrupadas = await Projeto.aggregate([
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
    console.error('[Erro ProjetoService.stats]', error.message);
    throw new Error('Falha ao calcular estatísticas de projetos: ' + error.message);
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