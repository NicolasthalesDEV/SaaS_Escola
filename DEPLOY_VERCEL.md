# 🚀 Deploy na Vercel - EduGest

## ✅ Configuração Corrigida

O erro "The `functions` property cannot be used in conjunction with the `builds` property" foi **resolvido**!

### 📁 Ficheiros de Configuração

- ✅ `vercel.json` - Configuração simplificada
- ✅ `server.js` - Compatível com Vercel (base de dados em memória)
- ✅ `.env.example` - Variáveis de ambiente documentadas

### 🔧 Passos para Deploy

1. **Preparar o Projecto**
   ```bash
   # Certifique-se de que está no directório correcto
   cd SaaS_Escola
   
   # Verificar se todos os ficheiros estão presentes
   ls vercel.json package.json server.js
   ```

2. **Deploy via GitHub (Recomendado)**
   - Faça push do código para o GitHub
   - Conecte o repositório na Vercel
   - O deploy será automático

3. **Deploy via CLI da Vercel**
   ```bash
   # Instalar CLI da Vercel
   npm i -g vercel
   
   # Fazer login
   vercel login
   
   # Deploy
   vercel
   ```

### 🎯 Configurações Aplicadas

#### `vercel.json` (Simplificado)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Modificações no Servidor
- ✅ **Base de dados**: SQLite em memória na Vercel
- ✅ **Dados de exemplo**: Criados automaticamente
- ✅ **Compatibilidade**: Funciona local e na Vercel

### 🔐 Variáveis de Ambiente na Vercel

Configure estas variáveis no painel da Vercel:

```bash
JWT_SECRET=sua_chave_super_secreta_aqui
NODE_ENV=production
```

### ⚠️ Limitações da Vercel

**Base de Dados:**
- SQLite não persiste entre requests
- Dados são recriados a cada execução
- Para produção real, use PostgreSQL/MySQL

**Soluções para Produção:**
- **Supabase** (PostgreSQL gratuito)
- **PlanetScale** (MySQL serverless)
- **MongoDB Atlas** (NoSQL)

### 🧪 Teste Local Antes do Deploy

```bash
# Testar em modo produção
NODE_ENV=production npm start

# Verificar se tudo funciona
curl http://localhost:3000
curl http://localhost:3000/api/schools
```

### 🚀 Após o Deploy

1. **URL da Aplicação**
   - Será algo como: `https://seu-projeto.vercel.app`

2. **Primeiro Acesso**
   - Clique em "Configurar Sistema"
   - Use as credenciais: `admin@demo.com` / `admin123`

3. **Dados de Exemplo**
   - Escola e filial já estarão criadas
   - Pode adicionar professores, alunos, etc.

### 🔧 Resolução de Problemas

**Se o deploy falhar:**

1. **Verificar logs na Vercel**
2. **Testar localmente com NODE_ENV=production**
3. **Verificar se todas as dependências estão no package.json**

**Comandos úteis:**
```bash
# Ver logs do deploy
vercel logs

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Testar build local
npm run build  # se tiver script de build
```

### 🎉 Pronto!

Agora o deploy deve funcionar sem erros. A aplicação estará disponível globalmente através da Vercel com:

- ✅ Interface responsiva
- ✅ API funcional  
- ✅ Autenticação JWT
- ✅ Dados de exemplo
- ✅ HTTPS automático
- ✅ CDN global