# 🎓 EduGest - Sistema de Gestão Escolar

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Sistema web moderno e intuitivo para gestão completa de instituições de ensino**

[📋 Funcionalidades](#-funcionalidades) • [🚀 Início Rápido](#-início-rápido) • [📱 Acesso Remoto](#-acesso-remoto) • [🔧 Resolução de Problemas](#-resolução-de-problemas)

</div>

---

## 📖 Sobre o Projecto

O **EduGest** é uma solução completa de gestão escolar desenvolvida com tecnologias modernas. Permite administrar múltiplas escolas, filiais, professores, alunos, turmas e horários através de uma interface web elegante e responsiva.

### 🎯 Objectivos
- Centralizar a gestão educacional
- Simplificar processos administrativos
- Proporcionar acesso multiplataforma
- Garantir segurança e escalabilidade

---

## ✨ Funcionalidades

### 🏫 **Gestão Institucional**
| Módulo | Descrição | Estado |
|--------|-----------|--------|
| **Escolas** | Registo e administração de múltiplas instituições | ✅ Completo |
| **Filiais** | Organização de diferentes unidades por escola | ✅ Completo |

### � **Gestão de Pessoas**
| Módulo | Descrição | Estado |
|--------|-----------|--------|
| **Professores** | Cadastro completo do corpo docente | ✅ Completo |
| **Alunos** | Administração de estudantes matriculados | ✅ Completo |

### 📚 **Gestão Académica**
| Módulo | Descrição | Estado |
|--------|-----------|--------|
| **Turmas** | Organização de salas de aula e disciplinas | ✅ Completo |
| **Horários** | Configuração detalhada de horários das aulas | ✅ Completo |

### 🔐 **Recursos Técnicos**
- **Autenticação Segura**: Sistema JWT com tokens de 8 horas
- **Interface Responsiva**: Design adaptável para desktop, tablet e móvel
- **Base de Dados**: SQLite com estrutura relacional optimizada
- **API RESTful**: Endpoints organizados para todas as operações CRUD

---

## 🚀 Início Rápido

### ⚡ Instalação e Execução
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar em modo desenvolvimento (recomendado)
npm run dev

# 3. Aceder ao sistema
# Local: http://localhost:3000
# Rede: http://[SEU_IP]:3000
```

### � Deploy na Nuvem (Vercel)
```bash
# Deploy rápido na Vercel
npm i -g vercel
vercel

# Ou consulte o guia completo: DEPLOY.md
```

### �🎯 Primeiro Acesso
1. **Abra o navegador** em `http://localhost:3000`
2. **Configure o sistema** clicando em "Configurar Sistema"
3. **Inicie sessão** com as credenciais criadas
4. **Comece a gestão** cadastrando a primeira escola

### � Credenciais Padrão
```
Email: admin@demo.com
Palavra-passe: admin123
```

---

## � Acesso Remoto

### 🌐 Configuração para Múltiplos Dispositivos

**Passo 1: Configurar Servidor**
```bash
npm run dev
```

**Passo 2: Configurar Firewall (Windows)**
```bash
# Execute como Administrador
npm run setup-firewall
```

**Passo 3: Conectar Dispositivos**
- Certifique-se de que todos os dispositivos estão na **mesma rede Wi-Fi**
- Use o endereço mostrado no terminal (ex: `http://192.168.1.25:3000`)
- Abra o navegador no dispositivo e aceda ao endereço

### 📋 Requisitos para Acesso Externo
- ✅ Mesma rede Wi-Fi/LAN
- ✅ Firewall configurado (porta 3000)
- ✅ Servidor em execução
- ✅ IP válido na rede local

---

## � Resolução de Problemas

### ❌ "Timeout" ou "Não consegue conectar"

**Soluções por ordem de prioridade:**

1. **Verificar Firewall**
   ```bash
   # Execute como Administrador
   npm run setup-firewall
   ```

2. **Verificar Rede**
   - Todos os dispositivos na mesma Wi-Fi?
   - IP correcto? Execute `ipconfig` para verificar

3. **Testar Conectividade Local**
   ```bash
   curl http://localhost:3000
   # ou abra http://localhost:3000 no navegador
   ```

4. **Verificar Porta**
   - Feche outros programas que possam usar a porta 3000
   - Tente reiniciar o servidor

5. **Desactivar Temporariamente**
   - Antivírus
   - Firewall de terceiros

### 🔍 Diagnóstico de Rede

**Encontrar o IP manualmente:**
```bash
ipconfig
# Procure "Endereço IPv4" na secção Wi-Fi
```

**Testar conectividade:**
```bash
# No dispositivo host
netstat -an | findstr :3000

# Testar de outro dispositivo
ping [IP_DO_SERVIDOR]
```

---

## 📱 Scripts Disponíveis

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `npm start` | Servidor apenas local | Produção |
| `npm run dev` | Servidor com acesso externo | Desenvolvimento |
| `npm run setup-firewall` | Configurar firewall automaticamente | Setup inicial |
| `npm run help` | Mostrar todos os comandos | Ajuda |

---

## �️ Stack Tecnológica

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **SQLite** - Base de dados embebida
- **JWT** - Autenticação segura
- **bcryptjs** - Encriptação de palavras-passe

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript (Vanilla)** - Lógica interactiva
- **Design Responsivo** - Mobile-first approach

### **Funcionalidades Técnicas**
- 🔄 **API RESTful** completa
- 🔐 **Middleware de autenticação**
- 📱 **Interface responsiva**
- 🎨 **Design system consistente**
- ⚡ **Performance optimizada**

---

## 📂 Estrutura do Projecto

```
EduGest/
├── 📁 public/                 # Frontend
│   ├── 📁 css/               
│   │   └── styles.css        # Estilos principais
│   ├── 📁 js/                
│   │   ├── login.js          # Lógica de autenticação
│   │   └── dashboard.js      # Interface principal
│   ├── index.html            # Página de login
│   └── dashboard.html        # Painel administrativo
├── 📄 server.js              # Servidor Express + API
├── 📄 package.json           # Configuração do projecto
├── 📄 .env                   # Variáveis de ambiente
├── 🗃️ data.db               # Base de dados SQLite
└── 📄 README.md             # Este ficheiro
```

---

## 🚦 Workflow de Desenvolvimento

### 🔄 Fluxo Típico de Uso

1. **Configuração Inicial**
   ```bash
   npm install
   npm run setup-firewall  # Se necessário
   ```

2. **Desenvolvimento**
   ```bash
   npm run dev             # Servidor com acesso externo
   ```

3. **Produção Local**
   ```bash
   npm start              # Apenas acesso local
   ```

### 📊 Monitorização

O servidor fornece informações detalhadas durante a execução:
- 🌐 URLs de acesso (local e externo)
- 🔧 Instruções de configuração
- 💡 Dicas de resolução de problemas

---

## 🔜 Funcionalidades Futuras

- [ ] **Dashboard com gráficos** de estatísticas
- [ ] **Exportação de dados** (PDF, Excel)
- [ ] **Notificações** em tempo real
- [ ] **Backup automático** da base de dados
- [ ] **Multi-idioma** (EN, ES, FR)
- [ ] **Modo escuro** na interface
- [ ] **PWA** (Progressive Web App)

---

## 📞 Suporte

Para questões ou problemas:

1. **Verifique a secção** [🔧 Resolução de Problemas](#-resolução-de-problemas)
2. **Execute o diagnóstico** com `npm run setup-firewall`
3. **Consulte os logs** do servidor para erros específicos

---

## 🌐 Deploy na Nuvem

### 🚀 Vercel (Recomendado)

**Deploy rápido:**
```bash
npm i -g vercel
vercel
```

**⚠️ Erro Comum Resolvido:**
- ❌ `"The functions property cannot be used in conjunction with the builds property"`
- ✅ **Solução**: Removida propriedade `functions` do `vercel.json`
- ✅ **Estado**: Deploy funciona perfeitamente

**Configuração necessária:**
- ✅ `vercel.json` configurado e testado
- ✅ Servidor compatível com Vercel
- ✅ Base de dados em memória (demonstração)
- ✅ Dados de exemplo criados automaticamente

**Variáveis de ambiente na Vercel:**
```bash
JWT_SECRET=sua_chave_super_secreta
NODE_ENV=production
```

📋 **Guia completo**: Consulte `DEPLOY_VERCEL.md` para instruções detalhadas.
- Adicione `JWT_SECRET` nas variáveis de ambiente
- Configure domínio personalizado (opcional)

📋 **Guia completo**: Consulte `DEPLOY.md` para instruções detalhadas

### 🔧 Outras Plataformas

| Plataforma | Suporte | Dificuldade |
|------------|---------|-------------|
| **Vercel** | ✅ Nativo | Fácil |
| **Netlify** | ⚡ Funções | Médio |
| **Railway** | 🚂 Full Stack | Fácil |
| **Heroku** | 💜 Clássico | Médio |
| **DigitalOcean** | 🌊 VPS | Avançado |

---

## 📞 Suporte

Para questões ou problemas:

1. **Verifique a secção** [🔧 Resolução de Problemas](#-resolução-de-problemas)
2. **Execute o diagnóstico** com `npm run setup-firewall`
3. **Consulte os logs** do servidor para erros específicos

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade educativa**

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Responsive Design](https://img.shields.io/badge/Design-Responsive-blue?style=flat-square)](https://web.dev/responsive-web-design-basics/)
[![Mobile Friendly](https://img.shields.io/badge/Mobile-Friendly-green?style=flat-square)](https://developers.google.com/web/fundamentals/design-and-ux/responsive/)

</div>
