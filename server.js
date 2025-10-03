require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da base de dados - usa memória na Vercel para demonstração
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? ':memory:' : path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log(`📊 Base de dados: ${isVercel ? 'Em memória (Vercel)' : 'SQLite local'}`);

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE,password_hash TEXT,role TEXT DEFAULT 'admin')`);
  db.run(`CREATE TABLE IF NOT EXISTS schools(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS branches(id INTEGER PRIMARY KEY AUTOINCREMENT,school_id INTEGER NOT NULL,name TEXT NOT NULL,address TEXT,FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS teachers(id INTEGER PRIMARY KEY AUTOINCREMENT,school_id INTEGER NOT NULL,branch_id INTEGER,name TEXT NOT NULL,email TEXT,FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE,FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY AUTOINCREMENT,school_id INTEGER NOT NULL,branch_id INTEGER,name TEXT NOT NULL,email TEXT,FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE,FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY AUTOINCREMENT,school_id INTEGER NOT NULL,branch_id INTEGER,name TEXT NOT NULL,teacher_id INTEGER,FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE,FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL,FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS schedules(id INTEGER PRIMARY KEY AUTOINCREMENT,class_id INTEGER NOT NULL,weekday INTEGER NOT NULL,start_time TEXT NOT NULL,end_time TEXT NOT NULL,FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE)`);
  
  // Se for Vercel (memória), criar dados de exemplo
  if (isVercel) {
    console.log('🌐 Criando dados de exemplo para demonstração na Vercel...');
    
    // Criar utilizador admin padrão
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT OR IGNORE INTO users(email,password_hash,role) VALUES(?,?,?)', ['admin@demo.com', hash, 'admin']);
    
    // Criar escola de exemplo
    db.run('INSERT OR IGNORE INTO schools(name) VALUES(?)', ['Escola Secundária de Exemplo']);
    
    // Criar filial de exemplo  
    db.run('INSERT OR IGNORE INTO branches(school_id,name,address) VALUES(?,?,?)', [1, 'Sede Principal', 'Rua da Educação, 123']);
    
    console.log('✅ Dados de exemplo criados!');
  }
});

function authMiddleware(req,res,next){
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token) return res.status(401).json({error:'Token não fornecido'});
  try{ req.user = jwt.verify(token, JWT_SECRET); next(); }catch(e){ return res.status(401).json({error:'Token inválido'}); }
}

function run(sql, params=[]){ return new Promise((resolve,reject)=> db.run(sql, params, function(err){ err?reject(err):resolve({id:this.lastID,changes:this.changes}); })); }
function all(sql, params=[]){ return new Promise((resolve,reject)=> db.all(sql, params, (err,rows)=> err?reject(err):resolve(rows))); }
function get(sql, params=[]){ return new Promise((resolve,reject)=> db.get(sql, params, (err,row)=> err?reject(err):resolve(row))); }

app.post('/api/auth/register', async (req,res)=>{
  try{ 
    const {email,password} = req.body; 
    if(!email||!password) return res.status(400).json({error:'Email e palavra-passe são obrigatórios'});
    
    // Check if user already exists
    const existingUser = await get('SELECT id FROM users WHERE email=?', [email]);
    if(existingUser) {
      return res.status(400).json({error:'Utilizador administrador já existe! Use as credenciais existentes para iniciar sessão.'});
    }
    
    const hash = await bcrypt.hash(password, 10);
    await run('INSERT INTO users(email,password_hash,role) VALUES(?,?,?)', [email,hash,'admin']);
    res.json({ok:true});
  }catch(e){ 
    if(e.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({error:'Utilizador administrador já existe! Use as credenciais existentes para iniciar sessão.'});
    } else {
      res.status(400).json({error:e.message}); 
    }
  }
});
app.post('/api/auth/login', async (req,res)=>{
  try{ const {email,password}=req.body; const user = await get('SELECT * FROM users WHERE email=?',[email]);
    if(!user) return res.status(401).json({error:'Credenciais inválidas'});
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({error:'Credenciais inválidas'});
    const token = jwt.sign({id:user.id,email:user.email,role:user.role}, JWT_SECRET, {expiresIn:'8h'});
    res.json({token});
  }catch(e){ res.status(500).json({error:e.message}); }
});

function crudRoutes(table, fields){
  const base = `/api/${table}`;
  app.get(base, authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM ${table} ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
  app.post(base, authMiddleware, async (req,res)=>{ try{
    const cols = fields.join(','), placeholders = fields.map(_=>'?').join(','), values = fields.map(f=> req.body[f] ?? null);
    const result = await run(`INSERT INTO ${table}(${cols}) VALUES(${placeholders})`, values);
    res.json(await get(`SELECT * FROM ${table} WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); } });
  app.put(`${base}/:id`, authMiddleware, async (req,res)=>{ try{
    const set = fields.map(f=>`${f}=?`).join(','), values = fields.map(f=> req.body[f] ?? null); values.push(req.params.id);
    await run(`UPDATE ${table} SET ${set} WHERE id=?`, values);
    res.json(await get(`SELECT * FROM ${table} WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); } });
  app.delete(`${base}/:id`, authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM ${table} WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });
}

// Rotas básicas sem validações especiais
crudRoutes('schools', ['name']);

// Rotas com validações específicas

// Filiais - validar se a escola existe
app.get('/api/branches', authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM branches ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/branches', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, name, address} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    const result = await run(`INSERT INTO branches(school_id,name,address) VALUES(?,?,?)`, [school_id, name, address]);
    res.json(await get(`SELECT * FROM branches WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/branches/:id', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, name, address} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    await run(`UPDATE branches SET school_id=?,name=?,address=? WHERE id=?`, [school_id, name, address, req.params.id]);
    res.json(await get(`SELECT * FROM branches WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.delete('/api/branches/:id', authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM branches WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });

// Professores - validar escola e filial
app.get('/api/teachers', authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM teachers ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/teachers', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, email} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    const result = await run(`INSERT INTO teachers(school_id,branch_id,name,email) VALUES(?,?,?,?)`, [school_id, branch_id, name, email]);
    res.json(await get(`SELECT * FROM teachers WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/teachers/:id', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, email} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    await run(`UPDATE teachers SET school_id=?,branch_id=?,name=?,email=? WHERE id=?`, [school_id, branch_id, name, email, req.params.id]);
    res.json(await get(`SELECT * FROM teachers WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.delete('/api/teachers/:id', authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM teachers WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });

// Alunos - validar escola e filial
app.get('/api/students', authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM students ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/students', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, email} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    const result = await run(`INSERT INTO students(school_id,branch_id,name,email) VALUES(?,?,?,?)`, [school_id, branch_id, name, email]);
    res.json(await get(`SELECT * FROM students WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/students/:id', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, email} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    await run(`UPDATE students SET school_id=?,branch_id=?,name=?,email=? WHERE id=?`, [school_id, branch_id, name, email, req.params.id]);
    res.json(await get(`SELECT * FROM students WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.delete('/api/students/:id', authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM students WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });

// Turmas - validar escola, filial e professor (VALIDAÇÃO PRINCIPAL SOLICITADA)
app.get('/api/classes', authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM classes ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/classes', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, teacher_id} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    // VALIDAÇÃO PRINCIPAL: Validar se o professor existe (se especificado)
    if (teacher_id) {
      const teacher = await get('SELECT id, name FROM teachers WHERE id = ?', [teacher_id]);
      if (!teacher) {
        return res.status(400).json({error: 'Professor especificado não existe. Por favor, crie primeiro o professor na secção "Professores" antes de o atribuir a uma turma.'});
      }
    }
    
    const result = await run(`INSERT INTO classes(school_id,branch_id,name,teacher_id) VALUES(?,?,?,?)`, [school_id, branch_id, name, teacher_id]);
    res.json(await get(`SELECT * FROM classes WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/classes/:id', authMiddleware, async (req,res)=>{ 
  try{
    const {school_id, branch_id, name, teacher_id} = req.body;
    
    // Validar se a escola existe
    if (school_id) {
      const school = await get('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school) {
        return res.status(400).json({error: 'Escola especificada não existe. Por favor, seleccione uma escola válida.'});
      }
    }
    
    // Validar se a filial existe (se especificada)
    if (branch_id) {
      const branch = await get('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (!branch) {
        return res.status(400).json({error: 'Filial especificada não existe. Por favor, seleccione uma filial válida.'});
      }
    }
    
    // VALIDAÇÃO PRINCIPAL: Validar se o professor existe (se especificado)
    if (teacher_id) {
      const teacher = await get('SELECT id, name FROM teachers WHERE id = ?', [teacher_id]);
      if (!teacher) {
        return res.status(400).json({error: 'Professor especificado não existe. Por favor, crie primeiro o professor na secção "Professores" antes de o atribuir a uma turma.'});
      }
    }
    
    await run(`UPDATE classes SET school_id=?,branch_id=?,name=?,teacher_id=? WHERE id=?`, [school_id, branch_id, name, teacher_id, req.params.id]);
    res.json(await get(`SELECT * FROM classes WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.delete('/api/classes/:id', authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM classes WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });

// Horários - validar se a turma existe
app.get('/api/schedules', authMiddleware, async (req,res)=>{ try{ res.json(await all(`SELECT * FROM schedules ORDER BY id DESC`)); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/schedules', authMiddleware, async (req,res)=>{ 
  try{
    const {class_id, weekday, start_time, end_time} = req.body;
    
    // Validar se a turma existe
    if (class_id) {
      const classExists = await get('SELECT id FROM classes WHERE id = ?', [class_id]);
      if (!classExists) {
        return res.status(400).json({error: 'Turma especificada não existe. Por favor, seleccione uma turma válida.'});
      }
    }
    
    const result = await run(`INSERT INTO schedules(class_id,weekday,start_time,end_time) VALUES(?,?,?,?)`, [class_id, weekday, start_time, end_time]);
    res.json(await get(`SELECT * FROM schedules WHERE id=?`, [result.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/schedules/:id', authMiddleware, async (req,res)=>{ 
  try{
    const {class_id, weekday, start_time, end_time} = req.body;
    
    // Validar se a turma existe
    if (class_id) {
      const classExists = await get('SELECT id FROM classes WHERE id = ?', [class_id]);
      if (!classExists) {
        return res.status(400).json({error: 'Turma especificada não existe. Por favor, seleccione uma turma válida.'});
      }
    }
    
    await run(`UPDATE schedules SET class_id=?,weekday=?,start_time=?,end_time=? WHERE id=?`, [class_id, weekday, start_time, end_time, req.params.id]);
    res.json(await get(`SELECT * FROM schedules WHERE id=?`, [req.params.id]));
  }catch(e){ res.status(400).json({error:e.message}); }
});
app.delete('/api/schedules/:id', authMiddleware, async (req,res)=>{ try{ await run(`DELETE FROM schedules WHERE id=?`, [req.params.id]); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });

app.get('/', (_,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

// Function to get local IP address
function getLocalIPAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  return results[0] || 'localhost';
}

const HOST = process.env.HOST || (process.argv.includes('--host=0.0.0.0') ? '0.0.0.0' : 'localhost');

// Para desenvolvimento local
if (require.main === module) {
  app.listen(PORT, HOST, ()=> {
    console.log('\n🎓 EduGest - Sistema de Gestão Escolar');
    console.log('=====================================');
    
    if (HOST === '0.0.0.0') {
      const localIP = getLocalIPAddress();
      console.log(`🌐 Servidor a executar em modo de desenvolvimento`);
      console.log(`📱 Acesso local: http://localhost:${PORT}`);
      console.log(`🌍 Acesso externo: http://${localIP}:${PORT}`);
      console.log(`\n💡 Outras pessoas podem aceder usando: http://${localIP}:${PORT}`);
      console.log(`\n🔧 Se não conseguir aceder de outros dispositivos:`);
      console.log(`   1. Execute: npm run setup-firewall`);
      console.log(`   2. Certifique-se de que estão na mesma rede Wi-Fi`);
      console.log(`   3. Verifique se a firewall não está a bloquear a porta ${PORT}`);
    } else {
      console.log(`📱 Servidor a executar em: http://localhost:${PORT}`);
      console.log(`\n💡 Para permitir acesso externo, execute: npm run dev`);
    }
    
    console.log('\n🚀 Para parar o servidor, prima Ctrl+C');
    console.log('=====================================\n');
  });
}

// Para Vercel (export da app)
module.exports = app;
