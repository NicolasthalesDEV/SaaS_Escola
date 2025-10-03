const msg = document.getElementById('msg');

function showMessage(text, type = 'error') {
  msg.className = `message ${type}`;
  msg.textContent = text;
  msg.classList.remove('hidden');
}

function hideMessage() {
  msg.classList.add('hidden');
}

document.getElementById('btn-login').onclick = async () => {
  hideMessage();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!email || !password) {
    showMessage('Por favor, preencha todos os campos.');
    return;
  }
  
  const btn = document.getElementById('btn-login');
  btn.textContent = 'A entrar...';
  btn.disabled = true;
  
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await resp.json();
    
    if (resp.ok) {
      localStorage.setItem('token', data.token);
      showMessage('Início de sessão realizado com sucesso!', 'success');
      setTimeout(() => {
        location.href = '/dashboard.html';
      }, 1000);
    } else {
      showMessage(data.error || 'Erro ao autenticar');
    }
  } catch (error) {
    showMessage('Erro de ligação. Tente novamente.');
  } finally {
    btn.textContent = 'Entrar';
    btn.disabled = false;
  }
};

document.getElementById('btn-seed').onclick = async () => {
  hideMessage();
  
  const email = document.getElementById('email').value.trim() || 'admin@demo.com';
  const password = document.getElementById('password').value.trim() || 'admin123';
  
  const btn = document.getElementById('btn-seed');
  btn.textContent = 'A configurar...';
  btn.disabled = true;
  
  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await resp.json();
    
    if (resp.ok) {
      showMessage('Sistema configurado com sucesso! Agora pode iniciar sessão.', 'success');
      // Pre-fill the form with the created credentials
      document.getElementById('email').value = email;
      document.getElementById('password').value = password;
    } else {
      if (data.error.includes('já existe')) {
        showMessage(data.error + ' Tente iniciar sessão com as suas credenciais.', 'error');
        // If default credentials were used, suggest them
        if (!document.getElementById('email').value.trim()) {
          document.getElementById('email').value = 'admin@demo.com';
          document.getElementById('password').value = 'admin123';
        }
      } else {
        showMessage(data.error || 'Erro ao configurar sistema');
      }
    }
  } catch (error) {
    showMessage('Erro de ligação. Tente novamente.');
  } finally {
    btn.textContent = 'Configurar Sistema';
    btn.disabled = false;
  }
};

// Add enter key support
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-login').click();
  }
});
