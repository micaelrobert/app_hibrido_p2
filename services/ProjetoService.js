/**
 * AULA 8 - Service de Projetos
 *
 * Responsável pela lógica de negócios e interação
 * com o banco de dados para a entidade "Projeto".
 */

// Importa o modelo de Projeto
const Projeto = require('../models/Projeto');

/**
 * @function listar
 * @description Retorna todos os projetos do banco de dados.
 * @returns {Promise<Array>} Lista de projetos
 */
const listar = async () => {
  console.log('[ProjetoService] Listando projetos...');
  return await Projeto.find().sort({ dataCriacao: -1 });
};

/**
 * @function criar
 * @description Cria um novo projeto com base nos dados fornecidos.
 * @param {object} dados Os dados do projeto (nome, descricao, etc.)
 * @returns {Promise<object>} O novo projeto criado
 */
const criar = async (dados) => {
  console.log('[ProjetoService] Criando projeto...', dados);

  if (!dados.nome || dados.nome.trim() === '') {
    throw new Error('Nome do projeto é obrigatório');
  }

  const dadosComPadroes = {
    nome: dados.nome,
    descricao: dados.descricao || '',
    status: dados.status || 'ativo',
    dataCriacao: new Date(),
    dataAtualizacao: new Date()
  };

  const projeto = new Projeto(dadosComPadroes);
  return await projeto.save();
};

/**
 * @function remover
 * @description Remove um projeto pelo seu ID.
 * @param {string} id O ID do projeto a ser removido
 * @returns {Promise<void>}
 */
const remover = async (id) => {
  console.log(`[ProjetoService] Removendo projeto ID: ${id}`);
  
  if (!id) {
    throw new Error('ID do projeto é obrigatório');
  }
  
  return await Projeto.findByIdAndDelete(id);
};

// (Não implementamos 'atualizar' ainda, mas podemos adicionar depois)
// const atualizar = async (id, dados) => { ... };


/**
 * @function stats
 * @description (NOVO) Retorna estatísticas de projetos para o Dashboard.
 * @returns {Promise<object>} Objeto com estatísticas
 */
const stats = async () => {
  console.log('[ProjetoService] Calculando estatísticas...');
  
  try {
    const total = await Projeto.countDocuments();
    const concluidos = await Projeto.countDocuments({ status: 'concluido' });
    const ativos = await Projeto.countDocuments({ status: 'ativo' });
    const pausados = await Projeto.countDocuments({ status: 'pausado' });

    const pendentes = total - concluidos;
    const percentualConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    
    // (O dashboard.ejs não pedia, mas é bom ter)
    const ultimosProjetos = await Projeto.find()
      .sort({ dataAtualizacao: -1 })
      .limit(5);

    return {
      total,
      concluidos,
      ativos,
      pausados,
      pendentes, // usado na legenda do gráfico
      percentualConclusao,
      ultimosProjetos
    };

  } catch (error) {
    console.error('[Erro ao calcular stats de ProjetoService]', error);
    throw new Error('Falha ao calcular estatísticas de projetos: ' + error.message);
  }
};

// Exporta as funções
module.exports = {
  listar,
  criar,
  remover,
  // atualizar, // (descomentar quando implementar)
  stats // <-- Exporta a nova função de stats
};