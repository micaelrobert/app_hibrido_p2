# 🚀 Comandos para Testar o Sistema de Tarefas

## 📋 Comandos Disponíveis

### 1. Testar Conexão MongoDB
```bash
npm run test:mongodb
```
**O que faz:** Testa se a conexão com MongoDB Atlas está funcionando

### 2. Testar Sistema de Tarefas
```bash
npm run test:tarefas
```
**O que faz:** Executa testes completos do sistema de tarefas

### 3. Popular Banco com Dados de Exemplo
```bash
npm run seed:tarefas
```
**O que faz:** Cria tarefas de exemplo no banco de dados

### 4. Iniciar Servidor
```bash
npm start
```
**O que faz:** Inicia o servidor na porta 3001

## 🧪 Testando a API

### 1. Verificar Status da API
```bash
curl http://localhost:3001/api/status
```

### 2. Listar Todas as Tarefas
```bash
curl http://localhost:3001/api/tarefas
```

### 3. Criar Nova Tarefa
```bash
curl -X POST http://localhost:3001/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nova Tarefa",
    "descricao": "Descrição da tarefa",
    "prioridade": "media",
    "categoria": "desenvolvimento",
    "tags": ["tag1", "tag2"]
  }'
```

### 4. Buscar Tarefa por ID
```bash
curl http://localhost:3001/api/tarefas/SEU_ID_AQUI
```

### 5. Atualizar Tarefa
```bash
curl -X PUT http://localhost:3001/api/tarefas/SEU_ID_AQUI \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Título Atualizado",
    "prioridade": "alta"
  }'
```

### 6. Marcar como Concluída
```bash
curl -X PATCH http://localhost:3001/api/tarefas/SEU_ID_AQUI/concluir
```

### 7. Deletar Tarefa
```bash
curl -X DELETE http://localhost:3001/api/tarefas/SEU_ID_AQUI
```

### 8. Obter Estatísticas
```bash
curl http://localhost:3001/api/tarefas/stats
```

### 9. Buscar por Categoria
```bash
curl http://localhost:3001/api/tarefas/categoria/desenvolvimento
```

### 10. Buscar por Texto
```bash
curl http://localhost:3001/api/tarefas/buscar/MongoDB
```

## 🔍 Filtros Disponíveis

### Listar Tarefas com Filtros
```bash
# Por categoria
curl "http://localhost:3001/api/tarefas?categoria=desenvolvimento"

# Por status de conclusão
curl "http://localhost:3001/api/tarefas?concluida=false"

# Por prioridade
curl "http://localhost:3001/api/tarefas?prioridade=alta"

# Por usuário
curl "http://localhost:3001/api/tarefas?usuario=admin"

# Combinando filtros
curl "http://localhost:3001/api/tarefas?categoria=desenvolvimento&concluida=false&prioridade=alta"
```

## 📊 Exemplos de Resposta

### Listar Tarefas
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "titulo": "Configurar MongoDB Atlas",
      "descricao": "Conectar o projeto com MongoDB Atlas",
      "concluida": false,
      "prioridade": "alta",
      "categoria": "desenvolvimento",
      "tags": ["mongodb", "atlas"],
      "usuario": "admin",
      "dataCriacao": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Estatísticas
```json
{
  "success": true,
  "data": {
    "total": 10,
    "concluidas": 3,
    "pendentes": 7,
    "percentualConcluidas": 30
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Sequência de Testes Recomendada

### 1. Teste Básico
```bash
# 1. Testar conexão
npm run test:mongodb

# 2. Popular dados
npm run seed:tarefas

# 3. Iniciar servidor
npm start
```

### 2. Teste da API
```bash
# 1. Verificar status
curl http://localhost:3001/api/status

# 2. Listar tarefas
curl http://localhost:3001/api/tarefas

# 3. Criar tarefa
curl -X POST http://localhost:3001/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste API","descricao":"Testando criação via API"}'

# 4. Ver estatísticas
curl http://localhost:3001/api/tarefas/stats
```

### 3. Teste Completo
```bash
# Executar todos os testes
npm run test:tarefas
```

## 🚨 Troubleshooting

### Erro de Conexão
```bash
# Verificar se .env está configurado
cat .env

# Testar conexão
npm run test:mongodb
```

### Erro de Porta
```bash
# Verificar processos na porta 3001
netstat -ano | findstr :3001

# Parar processo se necessário
taskkill /PID NUMERO_PID /F
```

### Erro de Dependências
```bash
# Reinstalar dependências
npm install
```

## 📱 Testando no Navegador

### URLs para Testar
- **Status da API:** http://localhost:3001/api/status
- **Listar Tarefas:** http://localhost:3001/api/tarefas
- **Estatísticas:** http://localhost:3001/api/tarefas/stats
- **Exemplos:** http://localhost:3001/api/exemplos

### Usando Postman ou Insomnia
1. Importe as URLs acima
2. Configure headers: `Content-Type: application/json`
3. Use os exemplos de body fornecidos

## ✅ Checklist de Testes

- [ ] Conexão MongoDB funcionando
- [ ] Servidor iniciando sem erros
- [ ] API respondendo corretamente
- [ ] CRUD de tarefas funcionando
- [ ] Filtros funcionando
- [ ] Estatísticas funcionando
- [ ] Busca por texto funcionando
- [ ] Dados persistindo no banco

---

**🎉 Se todos os testes passarem, seu sistema está funcionando perfeitamente!**
