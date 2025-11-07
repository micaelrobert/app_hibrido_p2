/**
 * 🔧 SCRIPT DE CONFIGURAÇÃO - MONGODB ATLAS
 * ==========================================
 * 
 * Este script ajuda você a configurar corretamente a conexão com MongoDB Atlas
 * e resolver os problemas de conexão.
 * 
 * Como usar:
 * 1. Execute: node configurar-atlas.js
 * 2. Siga as instruções na tela
 * 
 * @author Professor Lucas Nascimento
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Cores para o console
const cores = {
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  reset: '\x1b[0m',
  negrito: '\x1b[1m'
};

const log = (cor, mensagem) => {
  console.log(`${cor}${mensagem}${cores.reset}`);
};

// Função para criar arquivo .env
const criarArquivoEnv = () => {
  const conteudoEnv = `# Configurações da Aplicação Híbrida
# ==================================

# Porta do servidor (alterada para evitar conflito)
PORT=3001

# Ambiente de execução
NODE_ENV=development

# Configurações do MongoDB Atlas
# SUBSTITUA PELA SUA STRING DE CONEXÃO REAL DO ATLAS
MONGODB_URI=mongodb+srv://admin:SUA_SENHA_AQUI@cluster0.SEU_CLUSTER.mongodb.net/tarefas_db?retryWrites=true&w=majority

# Configurações de segurança
JWT_SECRET=sua_chave_secreta_jwt_aqui
SESSION_SECRET=sua_chave_secreta_sessao_aqui`;

  try {
    fs.writeFileSync('.env', conteudoEnv);
    log(cores.verde, '✅ Arquivo .env criado com sucesso!');
    return true;
  } catch (error) {
    log(cores.vermelho, '❌ Erro ao criar arquivo .env:', error.message);
    return false;
  }
};

// Função para verificar se o arquivo .env existe
const verificarArquivoEnv = () => {
  const envPath = path.join(process.cwd(), '.env');
  return fs.existsSync(envPath);
};

// Função para mostrar instruções de configuração
const mostrarInstrucoes = () => {
  console.log('\n' + '═'.repeat(60));
  log(cores.negrito + cores.azul, '🔧 INSTRUÇÕES DE CONFIGURAÇÃO MONGODB ATLAS');
  console.log('═'.repeat(60));
  
  console.log('\n📋 PASSO A PASSO:');
  console.log('─'.repeat(30));
  
  console.log('\n1️⃣  ACESSE O MONGODB ATLAS:');
  console.log('   • Vá para: https://www.mongodb.com/atlas');
  console.log('   • Faça login na sua conta');
  
  console.log('\n2️⃣  OBTER STRING DE CONEXÃO:');
  console.log('   • Clique em "Database" no menu lateral');
  console.log('   • Clique em "Connect" no seu cluster');
  console.log('   • Selecione "Connect your application"');
  console.log('   • Driver: Node.js');
  console.log('   • Version: 4.1 or later');
  console.log('   • Copie a string de conexão');
  
  console.log('\n3️⃣  CONFIGURAR ARQUIVO .env:');
  console.log('   • Abra o arquivo .env criado');
  console.log('   • Substitua a linha MONGODB_URI pela sua string');
  console.log('   • Exemplo:');
  console.log('     MONGODB_URI=mongodb+srv://admin:minhasenha123@cluster0.abc123.mongodb.net/tarefas_db?retryWrites=true&w=majority');
  
  console.log('\n4️⃣  VERIFICAR CONFIGURAÇÕES:');
  console.log('   • Usuário criado no Atlas');
  console.log('   • IP adicionado na lista de acesso');
  console.log('   • Cluster ativo e funcionando');
  
  console.log('\n5️⃣  TESTAR CONEXÃO:');
  console.log('   • Execute: npm run test:mongodb');
  console.log('   • Ou: node testar-conexao-atlas.js');
};

// Função para resolver conflito de porta
const resolverConflitoPorta = () => {
  console.log('\n🔧 RESOLVENDO CONFLITO DE PORTA:');
  console.log('─'.repeat(40));
  
  console.log('\n📋 OPÇÕES DISPONÍVEIS:');
  console.log('1. Parar processo na porta 3000');
  console.log('2. Usar porta diferente (3001)');
  console.log('3. Reiniciar o terminal');
  
  console.log('\n💡 COMANDOS ÚTEIS:');
  console.log('• Windows:');
  console.log('  netstat -ano | findstr :3000');
  console.log('  taskkill /PID <PID_NUMERO> /F');
  console.log('');
  console.log('• Linux/Mac:');
  console.log('  lsof -ti:3000');
  console.log('  kill -9 <PID_NUMERO>');
  
  console.log('\n✅ SOLUÇÃO RÁPIDA:');
  console.log('• O arquivo .env foi configurado para usar a porta 3001');
  console.log('• Execute: npm start');
  console.log('• Acesse: http://localhost:3001');
};

// Função para diagnosticar problemas
const diagnosticarProblemas = () => {
  console.log('\n🔍 DIAGNÓSTICO DE PROBLEMAS:');
  console.log('─'.repeat(40));
  
  console.log('\n❌ ERRO: ENOTFOUND _mongodb._tcp.cluster0.abcd123.mongodb.net');
  console.log('💡 CAUSAS POSSÍVEIS:');
  console.log('• String de conexão incorreta');
  console.log('• Cluster não existe ou está inativo');
  console.log('• Problema de DNS/rede');
  console.log('• Usuário não tem permissões');
  
  console.log('\n❌ ERRO: EADDRINUSE: address already in use :::3000');
  console.log('💡 CAUSAS POSSÍVEIS:');
  console.log('• Outro processo usando a porta 3000');
  console.log('• Servidor anterior não foi fechado');
  console.log('• Múltiplas instâncias rodando');
  
  console.log('\n🛠️  SOLUÇÕES:');
  console.log('1. Verificar string de conexão no Atlas');
  console.log('2. Confirmar que o cluster está ativo');
  console.log('3. Verificar permissões do usuário');
  console.log('4. Parar processos na porta 3000');
  console.log('5. Usar porta diferente (3001)');
};

// Função principal
const main = () => {
  console.log('\n' + '═'.repeat(60));
  log(cores.negrito + cores.azul, '🚀 CONFIGURADOR MONGODB ATLAS');
  console.log('═'.repeat(60));
  
  // Verificar se .env existe
  if (!verificarArquivoEnv()) {
    log(cores.amarelo, '⚠️  Arquivo .env não encontrado!');
    log(cores.azul, '🔄 Criando arquivo .env...');
    
    if (criarArquivoEnv()) {
      log(cores.verde, '✅ Arquivo .env criado!');
    } else {
      log(cores.vermelho, '❌ Falha ao criar arquivo .env');
      return;
    }
  } else {
    log(cores.verde, '✅ Arquivo .env encontrado!');
  }
  
  // Mostrar instruções
  mostrarInstrucoes();
  
  // Resolver conflito de porta
  resolverConflitoPorta();
  
  // Diagnosticar problemas
  diagnosticarProblemas();
  
  console.log('\n' + '═'.repeat(60));
  log(cores.verde, '🎉 CONFIGURAÇÃO CONCLUÍDA!');
  console.log('═'.repeat(60));
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Configure sua string de conexão no arquivo .env');
  console.log('2. Execute: npm run test:mongodb');
  console.log('3. Se funcionar, execute: npm start');
  console.log('4. Acesse: http://localhost:3001');
  
  console.log('\n🆘 PRECISA DE AJUDA?');
  console.log('• Consulte: GUIA_MONGODB_ATLAS.md');
  console.log('• Execute: node testar-conexao-atlas.js');
  console.log('• Verifique os logs do MongoDB Atlas');
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  criarArquivoEnv,
  verificarArquivoEnv,
  mostrarInstrucoes,
  resolverConflitoPorta,
  diagnosticarProblemas
};
