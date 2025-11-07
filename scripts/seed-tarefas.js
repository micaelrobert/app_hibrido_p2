const mongoose = require('mongoose');
const TarefaService = require('../services/TarefaService');
require('dotenv').config();

const dadosSeed = [
  {
    titulo: 'Configurar MongoDB Atlas',
    descricao: 'Conectar o projeto com MongoDB Atlas e configurar conexão',
    prioridade: 'alta',
    categoria: 'desenvolvimento',
    tags: ['mongodb', 'atlas', 'configuracao'],
    usuario: 'admin'
  },
  {
    titulo: 'Implementar autenticação',
    descricao: 'Adicionar sistema de login e registro de usuários',
    prioridade: 'alta',
    categoria: 'desenvolvimento',
    tags: ['auth', 'jwt', 'seguranca'],
    usuario: 'admin'
  },
  {
    titulo: 'Criar testes unitários',
    descricao: 'Implementar testes para todas as funcionalidades',
    prioridade: 'media',
    categoria: 'qualidade',
    tags: ['testes', 'jest', 'qualidade'],
    usuario: 'admin'
  },
  {
    titulo: 'Documentar API',
    descricao: 'Criar documentação completa da API',
    prioridade: 'media',
    categoria: 'documentacao',
    tags: ['docs', 'api', 'swagger'],
    usuario: 'admin'
  },
  {
    titulo: 'Implementar cache',
    descricao: 'Adicionar sistema de cache para melhorar performance',
    prioridade: 'baixa',
    categoria: 'performance',
    tags: ['cache', 'redis', 'performance'],
    usuario: 'admin'
  },
  {
    titulo: 'Estudar Node.js',
    descricao: 'Aprofundar conhecimentos em Node.js e Express',
    prioridade: 'media',
    categoria: 'estudos',
    tags: ['nodejs', 'express', 'javascript'],
    usuario: 'estudante'
  },
  {
    titulo: 'Fazer exercícios físicos',
    descricao: 'Praticar atividades físicas regularmente',
    prioridade: 'baixa',
    categoria: 'pessoal',
    tags: ['saude', 'exercicio', 'bem-estar'],
    usuario: 'usuario_padrao'
  },
  {
    titulo: 'Reunião com cliente',
    descricao: 'Apresentar progresso do projeto para o cliente',
    prioridade: 'alta',
    categoria: 'trabalho',
    tags: ['reuniao', 'cliente', 'apresentacao'],
    usuario: 'admin'
  },
  {
    titulo: 'Configurar CI/CD',
    descricao: 'Implementar pipeline de integração contínua',
    prioridade: 'media',
    categoria: 'desenvolvimento',
    tags: ['ci-cd', 'github-actions', 'deploy'],
    usuario: 'admin'
  },
  {
    titulo: 'Ler livro sobre arquitetura',
    descricao: 'Estudar padrões de arquitetura de software',
    prioridade: 'baixa',
    categoria: 'estudos',
    tags: ['arquitetura', 'livro', 'padroes'],
    usuario: 'estudante'
  }
];

const executarSeed = async () => {
  try {
    console.log('🌱 Executando seed de dados...');
    
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB!');
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await mongoose.connection.db.collection('tarefas').deleteMany({});
    
    // Criar dados de seed
    console.log('📝 Criando dados de seed...');
    let sucessos = 0;
    let erros = 0;
    
    for (const dadosTarefa of dadosSeed) {
      const resultado = await TarefaService.criarTarefa(dadosTarefa);
      if (resultado.success) {
        console.log(`✅ Tarefa criada: ${resultado.data.titulo}`);
        sucessos++;
      } else {
        console.log(`❌ Erro ao criar tarefa: ${resultado.message}`);
        erros++;
      }
    }
    
    console.log('\n📊 Resumo do Seed:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📋 Total: ${dadosSeed.length}`);
    
    // Obter estatísticas finais
    const stats = await TarefaService.obterEstatisticas();
    if (stats.success) {
      console.log('\n📈 Estatísticas Finais:');
      console.log(`   Total de tarefas: ${stats.data.total}`);
      console.log(`   Concluídas: ${stats.data.concluidas}`);
      console.log(`   Pendentes: ${stats.data.pendentes}`);
      console.log(`   Percentual concluídas: ${stats.data.percentualConcluidas?.toFixed(1)}%`);
    }
    
    console.log('\n🎉 Seed executado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
  }
};

if (require.main === module) {
  executarSeed();
}

module.exports = { executarSeed };
