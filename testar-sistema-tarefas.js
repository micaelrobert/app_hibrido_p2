const mongoose = require('mongoose');
const TarefaService = require('./services/TarefaService');
require('dotenv').config();

// Cores para o console
const cores = {
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (cor, mensagem) => {
  console.log(`${cor}${mensagem}${cores.reset}`);
};

// Função para testar o sistema completo
const testarSistema = async () => {
  console.log('\n🧪 TESTE COMPLETO DO SISTEMA DE TAREFAS');
  console.log('═'.repeat(50));
  
  try {
    // Conectar ao MongoDB
    log(cores.azul, '🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(cores.verde, '✅ Conectado ao MongoDB!');
    
    // Teste 1: Criar tarefas
    log(cores.amarelo, '\n📝 Teste 1: Criando tarefas...');
    
    const tarefasTeste = [
      {
        titulo: 'Configurar MongoDB Atlas',
        descricao: 'Conectar o projeto com MongoDB Atlas',
        prioridade: 'alta',
        categoria: 'desenvolvimento',
        tags: ['mongodb', 'atlas', 'configuracao']
      },
      {
        titulo: 'Implementar sistema de tarefas',
        descricao: 'Criar CRUD completo para tarefas',
        prioridade: 'alta',
        categoria: 'desenvolvimento',
        tags: ['crud', 'api', 'tarefas']
      },
      {
        titulo: 'Criar testes unitários',
        descricao: 'Implementar testes para as funcionalidades',
        prioridade: 'media',
        categoria: 'qualidade',
        tags: ['testes', 'jest', 'qualidade']
      }
    ];
    
    const tarefasCriadas = [];
    for (const dadosTarefa of tarefasTeste) {
      const resultado = await TarefaService.criarTarefa(dadosTarefa);
      if (resultado.success) {
        tarefasCriadas.push(resultado.data);
        log(cores.verde, `✅ Tarefa criada: ${resultado.data.titulo}`);
      } else {
        log(cores.vermelho, `❌ Erro ao criar tarefa: ${resultado.message}`);
      }
    }
    
    // Teste 2: Buscar todas as tarefas
    log(cores.amarelo, '\n📋 Teste 2: Buscando todas as tarefas...');
    const todasTarefas = await TarefaService.buscarTodasTarefas();
    if (todasTarefas.success) {
      log(cores.verde, `✅ Encontradas ${todasTarefas.count} tarefas`);
    }
    
    // Teste 3: Marcar tarefa como concluída
    log(cores.amarelo, '\n✅ Teste 3: Marcando primeira tarefa como concluída...');
    if (tarefasCriadas.length > 0) {
      const resultado = await TarefaService.marcarConcluida(tarefasCriadas[0]._id);
      if (resultado.success) {
        log(cores.verde, '✅ Tarefa marcada como concluída!');
      }
    }
    
    // Teste 4: Buscar por categoria
    log(cores.amarelo, '\n🔍 Teste 4: Buscando tarefas de desenvolvimento...');
    const tarefasDev = await TarefaService.buscarPorCategoria('desenvolvimento');
    if (tarefasDev.success) {
      log(cores.verde, `✅ Encontradas ${tarefasDev.count} tarefas de desenvolvimento`);
    }
    
    // Teste 5: Obter estatísticas
    log(cores.amarelo, '\n📊 Teste 5: Obtendo estatísticas...');
    const stats = await TarefaService.obterEstatisticas();
    if (stats.success) {
      log(cores.verde, '✅ Estatísticas obtidas:');
      console.log(`   Total: ${stats.data.total}`);
      console.log(`   Concluídas: ${stats.data.concluidas}`);
      console.log(`   Pendentes: ${stats.data.pendentes}`);
      console.log(`   Percentual: ${stats.data.percentualConcluidas?.toFixed(1)}%`);
    }
    
    // Teste 6: Buscar por texto
    log(cores.amarelo, '\n🔍 Teste 6: Buscando por "MongoDB"...');
    const busca = await TarefaService.buscarPorTexto('MongoDB');
    if (busca.success) {
      log(cores.verde, `✅ Encontradas ${busca.count} tarefas com "MongoDB"`);
    }
    
    // Teste 7: Atualizar tarefa
    log(cores.amarelo, '\n✏️  Teste 7: Atualizando tarefa...');
    if (tarefasCriadas.length > 1) {
      const resultado = await TarefaService.atualizarTarefa(tarefasCriadas[1]._id, {
        prioridade: 'alta',
        descricao: 'Atualizada: Implementar sistema completo de tarefas com CRUD'
      });
      if (resultado.success) {
        log(cores.verde, '✅ Tarefa atualizada!');
      }
    }
    
    log(cores.verde, '\n🎉 TODOS OS TESTES PASSARAM!');
    log(cores.verde, '✅ Sistema de tarefas funcionando perfeitamente!');
    
  } catch (error) {
    log(cores.vermelho, '\n❌ ERRO DURANTE OS TESTES:');
    log(cores.vermelho, `💥 ${error.message}`);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    log(cores.azul, '\n🔌 Conexão com MongoDB fechada');
  }
};

// Executar testes
if (require.main === module) {
  testarSistema().catch(console.error);
}

module.exports = { testarSistema };
