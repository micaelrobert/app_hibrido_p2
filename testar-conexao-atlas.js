/**
 * 🧪 SCRIPT DE TESTE - CONEXÃO MONGODB ATLAS
 * ==========================================
 * 
 * Este script testa se a conexão com MongoDB Atlas está funcionando
 * corretamente no seu projeto.
 * 
 * Como usar:
 * 1. Configure o arquivo .env com sua string de conexão
 * 2. Execute: node testar-conexao-atlas.js
 * 
 * @author Professor Lucas Nascimento
 * @version 1.0.0
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Cores para o console
const cores = {
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  reset: '\x1b[0m',
  negrito: '\x1b[1m'
};

// Função para log colorido
const log = (cor, mensagem) => {
  console.log(`${cor}${mensagem}${cores.reset}`);
};

// Função para testar conexão
const testarConexao = async () => {
  console.log('\n🧪 TESTE DE CONEXÃO MONGODB ATLAS');
  console.log('═'.repeat(50));
  
  // Verificar se a variável de ambiente está configurada
  if (!process.env.MONGODB_URI) {
    log(cores.vermelho, '❌ ERRO: Variável MONGODB_URI não encontrada no arquivo .env');
    log(cores.amarelo, '💡 Dica: Copie o arquivo env.example para .env e configure sua string de conexão');
    return false;
  }
  
  log(cores.azul, '📋 Verificando configurações...');
  log(cores.azul, `🌐 URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  try {
    log(cores.amarelo, '🔄 Tentando conectar ao MongoDB Atlas...');
    
    // Opções de conexão
    const opcoes = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    };
    
    // Conectar
    await mongoose.connect(process.env.MONGODB_URI, opcoes);
    
    log(cores.verde, '✅ Conexão estabelecida com sucesso!');
    
    // Informações da conexão
    const conexao = mongoose.connection;
    log(cores.azul, `🗄️  Banco de dados: ${conexao.name}`);
    log(cores.azul, `🌐 Host: ${conexao.host}`);
    log(cores.azul, `🔌 Porta: ${conexao.port}`);
    log(cores.azul, `📊 Estado: ${conexao.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
    
    // Testar operação simples
    log(cores.amarelo, '🏓 Testando operação de ping...');
    await conexao.db.admin().ping();
    log(cores.verde, '✅ Ping executado com sucesso!');
    
    // Testar criação de coleção
    log(cores.amarelo, '📝 Testando criação de documento...');
    const Teste = mongoose.model('Teste', new mongoose.Schema({
      nome: String,
      data: { type: Date, default: Date.now }
    }));
    
    const documentoTeste = new Teste({
      nome: 'Teste de Conexão',
      data: new Date()
    });
    
    await documentoTeste.save();
    log(cores.verde, '✅ Documento criado com sucesso!');
    
    // Limpar documento de teste
    await Teste.deleteOne({ _id: documentoTeste._id });
    log(cores.azul, '🧹 Documento de teste removido');
    
    // Testar query
    log(cores.amarelo, '🔍 Testando consulta...');
    const contagem = await Teste.countDocuments();
    log(cores.verde, `✅ Consulta executada: ${contagem} documentos encontrados`);
    
    log(cores.verde, '\n🎉 TODOS OS TESTES PASSARAM!');
    log(cores.verde, '✅ Sua conexão com MongoDB Atlas está funcionando perfeitamente!');
    
    return true;
    
  } catch (error) {
    log(cores.vermelho, '\n❌ ERRO DURANTE O TESTE:');
    log(cores.vermelho, `💥 ${error.message}`);
    
    // Diagnósticos específicos
    if (error.message.includes('authentication failed')) {
      log(cores.amarelo, '💡 Diagnóstico: Problema de autenticação');
      log(cores.amarelo, '   - Verifique se o usuário e senha estão corretos');
      log(cores.amarelo, '   - Confirme se o usuário tem permissões adequadas');
    } else if (error.message.includes('network timeout')) {
      log(cores.amarelo, '💡 Diagnóstico: Problema de rede');
      log(cores.amarelo, '   - Verifique se seu IP está na lista de IPs permitidos');
      log(cores.amarelo, '   - Tente adicionar 0.0.0.0/0 temporariamente para teste');
    } else if (error.message.includes('invalid connection string')) {
      log(cores.amarelo, '💡 Diagnóstico: String de conexão inválida');
      log(cores.amarelo, '   - Verifique se a string está completa');
      log(cores.amarelo, '   - Confirme se substituiu <password> e <dbname>');
    } else if (error.message.includes('ENOTFOUND')) {
      log(cores.amarelo, '💡 Diagnóstico: Problema de DNS');
      log(cores.amarelo, '   - Verifique sua conexão com a internet');
      log(cores.amarelo, '   - Confirme se a string de conexão está correta');
    }
    
    return false;
    
  } finally {
    // Fechar conexão
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log(cores.azul, '🔌 Conexão fechada');
    }
  }
};

// Função para verificar configurações
const verificarConfiguracoes = () => {
  console.log('\n🔍 VERIFICAÇÃO DE CONFIGURAÇÕES');
  console.log('─'.repeat(40));
  
  const configuracoes = {
    'Node.js': process.version,
    'Mongoose': mongoose.version,
    'Arquivo .env': process.env.MONGODB_URI ? '✅ Encontrado' : '❌ Não encontrado',
    'MONGODB_URI': process.env.MONGODB_URI ? '✅ Configurado' : '❌ Não configurado',
    'NODE_ENV': process.env.NODE_ENV || 'development'
  };
  
  Object.entries(configuracoes).forEach(([chave, valor]) => {
    const cor = valor.includes('✅') ? cores.verde : valor.includes('❌') ? cores.vermelho : cores.azul;
    log(cor, `${chave.padEnd(15)} ${valor}`);
  });
};

// Função principal
const main = async () => {
  console.log(`${cores.negrito}${cores.azul}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                🧪 TESTE DE CONEXÃO MONGODB ATLAS            ║');
  console.log('║                                                              ║');
  console.log('║  📚 Universidade de Vassouras - Aula Laboratório            ║');
  console.log('║  👨‍🏫 Professor: Lucas Nascimento                          ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${cores.reset}`);
  
  verificarConfiguracoes();
  
  const sucesso = await testarConexao();
  
  console.log('\n📋 RESUMO DO TESTE:');
  console.log('─'.repeat(30));
  
  if (sucesso) {
    log(cores.verde, '✅ Status: SUCESSO');
    log(cores.verde, '🎉 Sua aplicação está pronta para usar MongoDB Atlas!');
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Use as funções do arquivo exemplo-uso-mongodb.js');
    console.log('   2. Crie seus próprios modelos Mongoose');
    console.log('   3. Implemente as operações CRUD em suas rotas');
  } else {
    log(cores.vermelho, '❌ Status: FALHA');
    log(cores.vermelho, '🔧 Corrija os problemas antes de continuar');
    console.log('\n🆘 Precisa de ajuda?');
    console.log('   1. Consulte o arquivo GUIA_MONGODB_ATLAS.md');
    console.log('   2. Verifique as configurações no MongoDB Atlas');
    console.log('   3. Confirme se o arquivo .env está correto');
  }
  
  console.log('\n' + '═'.repeat(60));
};

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testarConexao, verificarConfiguracoes };

