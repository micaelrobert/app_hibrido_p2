# 🚨 SOLUÇÃO RÁPIDA - ERROS MONGODB ATLAS

## ❌ Problemas Identificados:

1. **Erro ENOTFOUND**: String de conexão incorreta
2. **Erro EADDRINUSE**: Porta 3000 já em uso
3. **Arquivo .env**: Não existe ou mal configurado

## 🔧 SOLUÇÕES IMEDIATAS:

### 1. Criar Arquivo .env
```bash
# No terminal, execute:
copy env.example .env
```

### 2. Editar Arquivo .env
Abra o arquivo `.env` e configure:

```env
# Configurações da Aplicação Híbrida
# ==================================

# Porta do servidor (alterada para evitar conflito)
PORT=3001

# Ambiente de execução
NODE_ENV=development

# Configurações do MongoDB Atlas
# SUBSTITUA PELA SUA STRING REAL DO ATLAS
MONGODB_URI=mongodb+srv://admin:SUA_SENHA_AQUI@cluster0.SEU_CLUSTER.mongodb.net/tarefas_db?retryWrites=true&w=majority

# Configurações de segurança
JWT_SECRET=sua_chave_secreta_jwt_aqui
SESSION_SECRET=sua_chave_secreta_sessao_aqui
```

### 3. Obter String de Conexão Correta

**No MongoDB Atlas:**
1. Acesse: https://www.mongodb.com/atlas
2. Faça login na sua conta
3. Clique em **"Database"** no menu lateral
4. Clique em **"Connect"** no seu cluster
5. Selecione **"Connect your application"**
6. Driver: **Node.js**
7. Version: **4.1 or later**
8. **COPIE a string de conexão**

### 4. Configurar String de Conexão

**Exemplo de string correta:**
```
mongodb+srv://admin:minhasenha123@cluster0.abc123.mongodb.net/tarefas_db?retryWrites=true&w=majority
```

**IMPORTANTE:**
- Substitua `minhasenha123` pela sua senha real
- Substitua `abc123` pelo ID do seu cluster
- Mantenha `tarefas_db` como nome do banco

### 5. Resolver Conflito de Porta

**Opção A - Parar processo na porta 3000:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <NUMERO_PID> /F

# Linux/Mac
lsof -ti:3000
kill -9 <NUMERO_PID>
```

**Opção B - Usar porta diferente:**
- O arquivo .env já está configurado para porta 3001
- Execute: `npm start`
- Acesse: `http://localhost:3001`

### 6. Testar Conexão

```bash
# Testar se a conexão está funcionando
npm run test:mongodb

# Ou executar diretamente
node testar-conexao-atlas.js
```

## 🔍 VERIFICAÇÕES IMPORTANTES:

### No MongoDB Atlas, verifique:
- ✅ Cluster está **ATIVO** (não pausado)
- ✅ Usuário foi **CRIADO** com senha
- ✅ IP está na lista de **ACESSO DE REDE**
- ✅ String de conexão está **COMPLETA**

### No seu projeto, verifique:
- ✅ Arquivo `.env` existe e está configurado
- ✅ String `MONGODB_URI` está correta
- ✅ Porta não está em conflito
- ✅ Dependências instaladas (`npm install`)

## 🚀 COMANDOS PARA EXECUTAR:

```bash
# 1. Instalar dependências
npm install

# 2. Testar conexão
npm run test:mongodb

# 3. Iniciar servidor
npm start

# 4. Acessar aplicação
# http://localhost:3001
```

## 🆘 SE AINDA NÃO FUNCIONAR:

### Verificar Logs Detalhados:
```bash
# Executar com logs detalhados
DEBUG=mongoose* npm start
```

### Testar Conexão Manual:
```bash
# Executar teste específico
node testar-conexao-atlas.js
```

### Verificar Configurações:
```bash
# Verificar se .env está sendo carregado
node -e "console.log(require('dotenv').config())"
```

## 📋 CHECKLIST FINAL:

- [ ] Arquivo `.env` criado e configurado
- [ ] String de conexão MongoDB Atlas correta
- [ ] Usuário criado no Atlas com senha
- [ ] IP adicionado na lista de acesso
- [ ] Cluster ativo no Atlas
- [ ] Porta 3001 configurada (sem conflito)
- [ ] Dependências instaladas
- [ ] Teste de conexão executado
- [ ] Servidor iniciado com sucesso

## 🎯 RESULTADO ESPERADO:

Quando tudo estiver funcionando, você verá:
```
✅ Conectado ao MongoDB Atlas com sucesso!
🗄️  Banco de dados: tarefas_db
🌐 Host: cluster0-shard-00-00.xxxxx.mongodb.net
🔌 Porta: 27017
```

E poderá acessar: `http://localhost:3001`

---

**💡 DICA:** Se ainda tiver problemas, execute `node testar-conexao-atlas.js` para diagnóstico detalhado!
