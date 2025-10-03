# 🚀 Guia de Deploy para Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Git repository**: Código deve estar no GitHub/GitLab/Bitbucket
3. **Vercel CLI**: `npm i -g vercel` (opcional)

## 🔧 Configuração

### 1. Preparar o Projeto

```bash
# Certifique-se de que todos os arquivos estão commitados
git add .
git commit -m "Preparar para deploy Vercel"
git push origin main
```

### 2. Configurar Variáveis de Ambiente

Na dashboard da Vercel, adicione as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `JWT_SECRET` | `sua_chave_super_secreta_aqui_123` | Chave para JWT (OBRIGATÓRIO) |
| `NODE_ENV` | `production` | Ambiente de produção |

⚠️ **IMPORTANTE**: Gere uma chave JWT forte e única para produção!

### 3. Deploy via Dashboard Vercel

1. **Login na Vercel**: [vercel.com](https://vercel.com)
2. **Novo Projeto**: Click "New Project"
3. **Importar Repositório**: Selecione seu repo do GitHub
4. **Configurar**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

5. **Adicionar Variáveis**: Na seção "Environment Variables"
6. **Deploy**: Click "Deploy"

### 4. Deploy via CLI (Alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy do projeto
vercel

# Seguir as instruções interativas:
# ? Set up and deploy "~/EduGest"? [Y/n] y
# ? Which scope do you want to deploy to? (seu-username)
# ? Link to existing project? [y/N] n
# ? What's your project's name? edugest-sistema-gestao-escolar
# ? In which directory is your code located? ./

# Deploy em produção
vercel --prod
```

## 🌐 Pós-Deploy

### URLs Geradas
- **Preview**: `https://edugest-xxx-username.vercel.app`
- **Produção**: `https://edugest-sistema-gestao-escolar.vercel.app`

### Primeiro Acesso
1. Abra a URL de produção
2. Click "Configurar Sistema"
3. Crie o usuário administrador
4. Faça login e comece a usar!

## ⚙️ Configurações Avançadas

### Custom Domain
1. Na dashboard Vercel → Settings → Domains
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### Monitoramento
- **Logs**: Dashboard Vercel → Functions → Ver logs
- **Analytics**: Dashboard Vercel → Analytics
- **Performance**: Dashboard Vercel → Speed Insights

## 🔧 Resolução de Problemas

### Erro de Build
```bash
# Verificar localmente
npm run vercel-build
npm start
```

### Base de Dados
⚠️ **Limitação**: SQLite não persiste na Vercel (serverless)

**Soluções recomendadas**:
1. **PlanetScale** (MySQL compatível)
2. **Supabase** (PostgreSQL)
3. **MongoDB Atlas**
4. **Vercel Postgres**

### Exemplo de migração para Vercel Postgres:
```javascript
// No server.js, substituir SQLite por:
const { createClient } = require('@vercel/postgres');
const client = createClient();
```

## 📁 Estrutura para Vercel

```
EduGest/
├── api/
│   └── index.js          # Entry point para Vercel
├── public/               # Arquivos estáticos
├── server.js             # Aplicação principal
├── vercel.json           # Configuração Vercel
├── package.json          # Dependencies
└── .env.example          # Template de variáveis
```

## 🚦 CI/CD Automático

A Vercel automaticamente:
- 🔄 **Re-deploy** em push para main
- 🔍 **Preview** para pull requests
- 📊 **Analytics** de performance
- 🔒 **HTTPS** automático

## 💡 Dicas de Otimização

1. **Minificar recursos** estáticos
2. **Usar CDN** para assets grandes
3. **Configurar cache headers**
4. **Otimizar imagens** (WebP, etc.)
5. **Lazy loading** onde possível

---

## 🆘 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [vercel.com/community](https://vercel.com/community)
- **Status**: [vercel-status.com](https://vercel-status.com)

---

**🎉 Pronto! Seu EduGest está na nuvem!**