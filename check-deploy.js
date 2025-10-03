#!/usr/bin/env node

console.log('🔍 Verificando configuração para deploy...\n');

const fs = require('fs');
const path = require('path');

let errors = [];
let warnings = [];
let success = [];

// Verificar arquivos essenciais
const requiredFiles = [
  'package.json',
  'server.js',
  'vercel.json',
  '.env.example',
  'public/index.html',
  'public/dashboard.html'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    success.push(`✅ ${file} existe`);
  } else {
    errors.push(`❌ ${file} não encontrado`);
  }
});

// Verificar package.json
try {
  const pkg = require('./package.json');
  
  if (pkg.scripts && pkg.scripts.start) {
    success.push('✅ Script "start" configurado');
  } else {
    errors.push('❌ Script "start" não encontrado');
  }
  
  if (pkg.scripts && pkg.scripts['vercel-build']) {
    success.push('✅ Script "vercel-build" configurado');
  } else {
    warnings.push('⚠️ Script "vercel-build" recomendado');
  }
  
} catch (e) {
  errors.push('❌ Erro ao ler package.json');
}

// Verificar vercel.json
try {
  const vercelConfig = require('./vercel.json');
  
  if (vercelConfig.builds) {
    success.push('✅ Configuração de builds definida');
  } else {
    errors.push('❌ Configuração de builds não encontrada');
  }
  
  if (vercelConfig.routes) {
    success.push('✅ Rotas configuradas');
  } else {
    warnings.push('⚠️ Rotas não configuradas');
  }
  
} catch (e) {
  errors.push('❌ Erro ao ler vercel.json');
}

// Verificar .env.example
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  if (envExample.includes('JWT_SECRET')) {
    success.push('✅ JWT_SECRET documentado');
  } else {
    warnings.push('⚠️ JWT_SECRET não documentado');
  }
  
} catch (e) {
  warnings.push('⚠️ .env.example não encontrado');
}

// Verificar estrutura de pastas
const requiredDirs = ['public', 'public/css', 'public/js'];

requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    success.push(`✅ Pasta ${dir} existe`);
  } else {
    errors.push(`❌ Pasta ${dir} não encontrada`);
  }
});

// Exibir resultados
console.log('📊 RESULTADO DA VERIFICAÇÃO\n');

if (success.length > 0) {
  console.log('🎉 SUCESSOS:');
  success.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️ AVISOS:');
  warnings.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERROS:');
  errors.forEach(msg => console.log(`  ${msg}`));
  console.log('');
  console.log('🔧 Corrija os erros antes de fazer deploy!');
  process.exit(1);
} else {
  console.log('🚀 Projeto pronto para deploy!');
  console.log('\n📋 Próximos passos:');
  console.log('  1. Commit e push do código');
  console.log('  2. Configurar JWT_SECRET na Vercel');
  console.log('  3. Fazer deploy: vercel --prod');
}