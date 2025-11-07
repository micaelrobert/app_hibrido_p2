# 🚀 Configuração MongoDB Atlas - Aplicativo Híbrido

## 📋 Visão Geral

Este guia fornece instruções detalhadas para conectar seu projeto de aplicativo híbrido com MongoDB Atlas, a versão em nuvem do MongoDB.

## 🎯 Objetivos

- ✅ Conectar o projeto com MongoDB Atlas
- ✅ Configurar variáveis de ambiente
- ✅ Testar a conexão
- ✅ Implementar operações CRUD básicas

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `GUIA_MONGODB_ATLAS.md` | Guia completo passo a passo |
| `exemplo-uso-mongodb.js` | Exemplos práticos de uso |
| `testar-conexao-atlas.js` | Script de teste da conexão |
| `README_MONGODB_ATLAS.md` | Este arquivo |

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar arquivo .env
# Substituir MONGODB_URI pela sua string de conexão do Atlas
```

### 2. Testar Conexão

```bash
# Testar se a conexão está funcionando
npm run test:mongodb
```

### 3. Executar Exemplo

```bash
# Executar exemplo prático
npm run exemplo:mongodb
```

## 📚 Documentação Detalhada

### Guia Completo
Consulte o arquivo `GUIA_MONGODB_ATLAS.md` para instruções detalhadas sobre:
- Criação de conta no MongoDB Atlas
- Configuração de cluster
- Configuração de segurança
- Obtenção da string de conexão

### Exemplos Práticos
O arquivo `exemplo-uso-mongodb.js` contém:
- Schema Mongoose completo
- Operações CRUD
- Métodos personalizados
- Agregações e estatísticas

## 🔧 Configuração da String de Conexão

### Formato da String
```
mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco?retryWrites=true&w=majority
```

### Exemplo no .env
```env
MONGODB_URI=mongodb+srv://admin:minhasenha123@cluster0.abc123.mongodb.net/tarefas_db?retryWrites=true&w=majority
```

## 🧪 Testes Disponíveis

### Teste de Conexão
```bash
npm run test:mongodb
```

**O que testa:**
- ✅ Configuração do arquivo .env
- ✅ Conectividade com MongoDB Atlas
- ✅ Autenticação
- ✅ Operações básicas (ping, create, read, delete)

### Exemplo Prático
```bash
npm run exemplo:mongodb
```

**O que demonstra:**
- ✅ Criação de documentos
- ✅ Consultas e filtros
- ✅ Atualizações
- ✅ Estatísticas e agregações

## 📊 Estrutura do Banco de Dados

### Coleção: tarefas

```javascript
{
  titulo: String,           // Título da tarefa (obrigatório)
  descricao: String,        // Descrição detalhada
  concluida: Boolean,       // Status de conclusão
  prioridade: String,       // baixa, media, alta
  categoria: String,        // Categoria da tarefa
  dataCriacao: Date,        // Data de criação
  dataConclusao: Date,      // Data de conclusão
  tags: [String],           // Array de tags
  usuario: String,          // Usuário responsável
  createdAt: Date,          // Timestamp de criação
  updatedAt: Date           // Timestamp de atualização
}
```

## 🔍 Índices Criados

- **Texto**: `titulo` e `descricao` (busca full-text)
- **Composto**: `concluida + dataCriacao` (ordenação)
- **Composto**: `usuario + categoria` (filtros)

## 🛠️ Troubleshooting

### Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Authentication failed` | Usuário/senha incorretos | Verificar credenciais no Atlas |
| `Network timeout` | IP não permitido | Adicionar IP na lista de acesso |
| `Invalid connection string` | String malformada | Verificar formato da string |
| `ENOTFOUND` | Problema de DNS | Verificar conexão com internet |

### Comandos de Diagnóstico

```bash
# Verificar configurações
node -e "console.log(require('dotenv').config())"

# Testar conexão manual
node -e "require('./testar-conexao-atlas.js')"

# Ver logs detalhados
DEBUG=mongoose* npm start
```

## 📈 Próximos Passos

### 1. Implementar em Rotas
```javascript
// routes/api.js
const { Tarefa, criarTarefa } = require('../exemplo-uso-mongodb');

app.post('/api/tarefas', async (req, res) => {
  try {
    const tarefa = await criarTarefa(req.body);
    res.json(tarefa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Adicionar Validações
```javascript
// Middleware de validação
const validarTarefa = (req, res, next) => {
  const { titulo } = req.body;
  if (!titulo || titulo.trim().length === 0) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }
  next();
};
```

### 3. Implementar Paginação
```javascript
const buscarTarefasPaginadas = async (pagina = 1, limite = 10) => {
  const skip = (pagina - 1) * limite;
  return await Tarefa.find()
    .skip(skip)
    .limit(limite)
    .sort({ dataCriacao: -1 });
};
```

## 🔒 Segurança

### Boas Práticas
- ✅ Use senhas fortes para usuários do banco
- ✅ Configure IPs específicos em produção
- ✅ Use variáveis de ambiente para credenciais
- ✅ Monitore logs de acesso
- ✅ Configure backup automático

### Configurações Recomendadas
```javascript
// Opções de conexão seguras
const opcoes = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  ssl: true,
  sslValidate: true
};
```

## 📞 Suporte

### Recursos Úteis
- [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Documentação Mongoose](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)

### Contato
- **Professor**: Lucas Nascimento
- **Universidade**: Universidade de Vassouras
- **Disciplina**: Desenvolvimento de Aplicações Híbridas

---

**🎉 Parabéns! Seu projeto agora está conectado ao MongoDB Atlas!**

*Última atualização: 2024*

