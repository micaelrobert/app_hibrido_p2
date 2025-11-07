# 🚀 Guia Completo: Conectar Projeto com MongoDB Atlas

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Criando Conta no MongoDB Atlas](#criando-conta-no-mongodb-atlas)
3. [Configurando Cluster](#configurando-cluster)
4. [Configurando Acesso e Segurança](#configurando-acesso-e-segurança)
5. [Obtendo String de Conexão](#obtendo-string-de-conexão)
6. [Configurando Variáveis de Ambiente](#configurando-variáveis-de-ambiente)
7. [Testando a Conexão](#testando-a-conexão)
8. [Troubleshooting](#troubleshooting)
9. [Próximos Passos](#próximos-passos)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de que você tem:

- ✅ Node.js instalado (versão 14 ou superior)
- ✅ npm ou yarn instalado
- ✅ Conta de email válida
- ✅ Projeto já configurado (que você já tem)

---

## 🌐 1. Criando Conta no MongoDB Atlas

### Passo 1.1: Acesse o MongoDB Atlas
1. Abra seu navegador e acesse: https://www.mongodb.com/atlas
2. Clique no botão **"Try Free"** ou **"Get Started Free"**

### Passo 1.2: Criar Conta
1. Preencha o formulário de registro:
   - **Email**: Seu email válido
   - **Password**: Senha forte (mínimo 8 caracteres)
   - **First Name**: Seu primeiro nome
   - **Last Name**: Seu sobrenome
2. Clique em **"Create your Atlas account"**

### Passo 1.3: Verificar Email
1. Verifique sua caixa de entrada
2. Clique no link de verificação enviado por email
3. Complete a verificação


###   ATE AQUI OK #





---

## 🏗️ 2. Configurando Cluster

### Passo 2.1: Escolher Tipo de Cluster
1. Após fazer login, você verá a tela de criação de cluster
2. Selecione **"M0 Sandbox"** (gratuito)
3. Clique em **"Create a cluster"**

### Passo 2.2: Configurar Região
1. Escolha a região mais próxima do Brasil:
   - **N. Virginia (us-east-1)** - Recomendado
   - **São Paulo (sa-east-1)** - Se disponível
2. Deixe as outras configurações padrão
3. Clique em **"Create Cluster"**

### Passo 2.3: Aguardar Criação
- O cluster levará de 3-5 minutos para ser criado
- Você verá uma barra de progresso
- Aguarde até aparecer **"Cluster is ready"**

---

## 🔐 3. Configurando Acesso e Segurança

### Passo 3.1: Criar Usuário do Banco de Dados
1. Na tela principal do Atlas, clique em **"Database Access"** no menu lateral
2. Clique em **"Add New Database User"**
3. Configure o usuário:
   - **Authentication Method**: Password
   - **Username**: `admin` (ou outro nome de sua escolha)
   - **Password**: Gere uma senha forte (salve em local seguro!)
   - **Database User Privileges**: Read and write to any database
4. Clique em **"Add User"**

### Passo 3.2: Configurar Acesso de Rede
1. No menu lateral, clique em **"Network Access"**
2. Clique em **"Add IP Address"**
3. Para desenvolvimento, adicione:
   - **"Add Current IP Address"** (recomendado)
   - Ou **"Allow Access from Anywhere"** (0.0.0.0/0) - menos seguro
4. Clique em **"Confirm"**

---

## 🔗 4. Obtendo String de Conexão

### Passo 4.1: Acessar String de Conexão
1. No menu lateral, clique em **"Database"**
2. Clique no botão **"Connect"** do seu cluster
3. Selecione **"Connect your application"**

### Passo 4.2: Configurar String
1. **Driver**: Node.js
2. **Version**: 4.1 or later
3. Copie a string de conexão que aparece
4. **IMPORTANTE**: Substitua `<password>` pela senha do usuário criado no Passo 3.1
5. **IMPORTANTE**: Substitua `<dbname>` por `tarefas_db`

### Exemplo de String de Conexão:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/tarefas_db?retryWrites=true&w=majority
```

---

## ⚙️ 5. Configurando Variáveis de Ambiente

### Passo 5.1: Criar Arquivo .env
1. No diretório raiz do seu projeto, crie um arquivo chamado `.env`
2. Copie o conteúdo do arquivo `env.example` para o `.env`

### Passo 5.2: Configurar MongoDB URI
1. Abra o arquivo `.env`
2. Substitua a linha:
   ```
   MONGODB_URI=mongodb://localhost:27017/tarefas_db
   ```
   Por:
   ```
   MONGODB_URI=mongodb+srv://admin:SUA_SENHA_AQUI@cluster0.xxxxx.mongodb.net/tarefas_db?retryWrites=true&w=majority
   ```

### Passo 5.3: Exemplo Completo do .env
```env
# Configurações da Aplicação Híbrida
# ==================================

# Porta do servidor
PORT=3000

# Ambiente de execução
NODE_ENV=development

# Configurações do MongoDB Atlas
MONGODB_URI=mongodb+srv://admin:minhasenha123@cluster0.abc123.mongodb.net/tarefas_db?retryWrites=true&w=majority

# Configurações de segurança
JWT_SECRET=sua_chave_secreta_jwt_aqui
SESSION_SECRET=sua_chave_secreta_sessao_aqui
```

---

## 🧪 6. Testando a Conexão

### Passo 6.1: Instalar Dependências
```bash
npm install
```

### Passo 6.2: Iniciar o Servidor
```bash
npm start
```

### Passo 6.3: Verificar Logs
Se tudo estiver correto, você verá no console:
```
🔄 Tentando conectar ao MongoDB...
📊 URL: mongodb+srv://admin:***@cluster0.xxxxx.mongodb.net/tarefas_db
✅ Conectado ao MongoDB com sucesso!
🗄️  Banco de dados: tarefas_db
🌐 Host: cluster0-shard-00-00.xxxxx.mongodb.net
🔌 Porta: 27017
```

### Passo 6.4: Testar via API
1. Abra seu navegador
2. Acesse: `http://localhost:3000/health`
3. Verifique se o campo `database.status` mostra "Conectado"

---

## 🔧 7. Troubleshooting

### Problema: "Authentication failed"
**Solução:**
- Verifique se a senha está correta no arquivo `.env`
- Certifique-se de que o usuário foi criado corretamente no Atlas

### Problema: "Network timeout"
**Solução:**
- Verifique se seu IP está na lista de IPs permitidos
- Tente adicionar "0.0.0.0/0" temporariamente para teste

### Problema: "Invalid connection string"
**Solução:**
- Verifique se a string de conexão está completa
- Certifique-se de que substituiu `<password>` e `<dbname>`

### Problema: "MongoServerError: bad auth"
**Solução:**
- Verifique se o usuário tem permissões de leitura e escrita
- Confirme se o nome do banco está correto

---

## 📊 8. Verificando a Conexão no Atlas

### Passo 8.1: Acessar Collections
1. No Atlas, clique em **"Collections"**
2. Você verá o banco `tarefas_db` listado
3. Quando sua aplicação criar dados, eles aparecerão aqui

### Passo 8.2: Monitorar Atividade
1. Clique em **"Real Time"** para ver conexões ativas
2. Monitore logs de conexão em tempo real

---

## 🚀 9. Próximos Passos

### 9.1: Criar Schemas Mongoose
Agora que a conexão está funcionando, você pode criar modelos para suas coleções:

```javascript
// models/Tarefa.js
const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: String,
  concluida: { type: Boolean, default: false },
  dataCriacao: { type: Date, default: Date.now },
  dataConclusao: Date
});

module.exports = mongoose.model('Tarefa', tarefaSchema);
```

### 9.2: Implementar CRUD
Use os modelos para criar, ler, atualizar e deletar dados:

```javascript
// routes/api.js
const Tarefa = require('../models/Tarefa');

// GET /api/tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await Tarefa.find();
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 9.3: Configurar Produção
Para produção, considere:
- Usar variáveis de ambiente diferentes
- Configurar backup automático
- Implementar monitoramento
- Configurar alertas

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Node.js MongoDB Driver](https://docs.mongodb.com/drivers/node/)

### Tutoriais Recomendados
- [MongoDB University](https://university.mongodb.com/)
- [Mongoose Quick Start](https://mongoosejs.com/docs/index.html)

---

## ✅ Checklist Final

- [ ] Conta criada no MongoDB Atlas
- [ ] Cluster configurado e funcionando
- [ ] Usuário do banco criado
- [ ] Acesso de rede configurado
- [ ] String de conexão obtida
- [ ] Arquivo .env configurado
- [ ] Aplicação conectando com sucesso
- [ ] Teste de conexão realizado

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** da aplicação
2. **Consulte a documentação** do MongoDB Atlas
3. **Teste a conexão** usando MongoDB Compass
4. **Verifique as configurações** de rede e usuário

---

**🎉 Parabéns! Seu projeto agora está conectado ao MongoDB Atlas!**

*Criado por: Professor Lucas Nascimento - Universidade de Vassouras*
