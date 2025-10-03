const content = document.getElementById('content');
const token = localStorage.getItem('token');

if (!token) {
    location.href = '/';
}

function logout() {
    localStorage.removeItem('token');
    location.href = '/';
}

// Update tab active state
function updateActiveTab(activeTab) {
    document.querySelectorAll('.tablink').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="openTab('${activeTab}')"]`).classList.add('active');
}

function openTab(name) {
    updateActiveTab(name);
    
    const map = {
        schools: {
            title: 'Escolas',
            subtitle: 'Faça a gestão das instituições de ensino',
            icon: '🏫',
            fields: [['name', 'Nome da Escola']],
            endpoint: '/api/schools'
        },
        branches: {
            title: 'Filiais',
            subtitle: 'Administre as unidades das escolas',
            icon: '🏢',
            fields: [['school_id', 'ID da Escola'], ['name', 'Nome da Filial'], ['address', 'Morada']],
            endpoint: '/api/branches'
        },
        teachers: {
            title: 'Professores',
            subtitle: 'Registe e faça a gestão do corpo docente',
            icon: '👨‍🏫',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome Completo'], ['email', 'Email']],
            endpoint: '/api/teachers'
        },
        students: {
            title: 'Alunos',
            subtitle: 'Administre os estudantes matriculados',
            icon: '👨‍🎓',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome Completo'], ['email', 'Email']],
            endpoint: '/api/students'
        },
        classes: {
            title: 'Turmas',
            subtitle: 'Organize as salas de aula e disciplinas',
            icon: '📚',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome da Turma'], ['teacher_id', 'ID do Professor']],
            endpoint: '/api/classes'
        },
        schedules: {
            title: 'Horários',
            subtitle: 'Configure os horários das aulas',
            icon: '📅',
            fields: [['class_id', 'ID da Turma'], ['weekday', 'Dia da Semana (0=Dom..6=Sáb)'], ['start_time', 'Horário de Início (08:00)'], ['end_time', 'Horário de Término (09:30)']],
            endpoint: '/api/schedules'
        }
    };
    
    const section = map[name];
    renderCRUD(section.title, section.subtitle, section.icon, section.fields, section.endpoint);
}

async function api(method, url, body) {
    try {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: body ? JSON.stringify(body) : undefined
        });
        
        if (!resp.ok) {
            const e = await resp.json().catch(() => ({ error: 'Erro de conexão' }));
            throw new Error(e.error || 'Erro na operação');
        }
        
        return resp.json();
    } catch (error) {
        throw error;
    }
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

async function renderCRUD(title, subtitle, icon, fields, endpoint) {
    content.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${icon} ${title}</h2>
                <p class="section-subtitle">${subtitle}</p>
            </div>
            
            <div class="form-card">
                <h3 style="margin-top: 0; color: var(--text-primary); font-size: 1.1rem; margin-bottom: 1.5rem;">
                    Adicionar ${title.slice(0, -1)}
                </h3>
                <div class="form-grid" id="form"></div>
                <button id="btn-create" class="primary" style="margin-top: 1rem;">
                    <span>Criar ${title.slice(0, -1)}</span>
                </button>
            </div>
            
            <div class="table-container">
                <table class="table" id="table">
                    <thead>
                        <tr>
                            ${fields.map(f => `<th>${f[1]}</th>`).join('')}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;
    
    const form = document.getElementById('form');
    
    // Create form fields
    fields.forEach(([k, label]) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `
            <label for="f_${k}">${label}</label>
            <input id="f_${k}" type="text" placeholder="Digite ${label.toLowerCase()}">
        `;
        form.appendChild(wrapper);
    });
    
    // Create button click handler
    document.getElementById('btn-create').onclick = async () => {
        const button = document.getElementById('btn-create');
        const originalText = button.textContent;
        
        try {
            button.textContent = 'A criar...';
            button.disabled = true;
            
            const body = {};
            let hasEmpty = false;
            
            fields.forEach(([k, label]) => {
                const value = document.getElementById('f_' + k).value.trim();
                if (!value && !label.includes('opcional')) {
                    hasEmpty = true;
                }
                body[k] = value || null;
            });
            
            if (hasEmpty) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            await api('POST', endpoint, body);
            
            // Clear form
            form.querySelectorAll('input').forEach(input => input.value = '');
            
            showNotification(`${title.slice(0, -1)} criado com sucesso!`);
            loadData();
            
        } catch (e) {
            showNotification(e.message, 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    };
    
    async function loadData() {
        try {
            const rows = await api('GET', endpoint);
            const tbody = document.querySelector('#table tbody');
            tbody.innerHTML = '';
            
            if (rows.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="${fields.length + 1}" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                            Nenhum registo encontrado
                        </td>
                    </tr>
                `;
                return;
            }
            
            rows.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    ${fields.map(([k]) => `<td>${row[k] ?? ''}</td>`).join('')}
                    <td class="actions">
                        <button data-id="${row.id}" class="btn-edit">Editar</button>
                        <button data-id="${row.id}" class="btn-delete">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Add delete handlers
            tbody.querySelectorAll('.btn-delete').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm(`Tem a certeza de que deseja eliminar este registo?`)) {
                        try {
                            btn.textContent = 'A eliminar...';
                            btn.disabled = true;
                            
                            await api('DELETE', `${endpoint}/${btn.dataset.id}`);
                            showNotification('Registo eliminado com sucesso!');
                            loadData();
                        } catch (e) {
                            showNotification(e.message, 'error');
                            btn.textContent = 'Eliminar';
                            btn.disabled = false;
                        }
                    }
                };
            });
            
            // Add edit handlers
            tbody.querySelectorAll('.btn-edit').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.id;
                    const tds = btn.closest('tr').querySelectorAll('td');
                    const currentValues = {};
                    
                    fields.forEach((field, index) => {
                        currentValues[field[0]] = tds[index].innerText;
                    });
                    
                    editRecord(id, fields, currentValues, endpoint, loadData);
                };
            });
            
        } catch (e) {
            showNotification(e.message, 'error');
        }
    }
    
    // Store the loadData function globally for use in edit modal
    window.currentLoadFunction = loadData;
    
    loadData();
}

function editRecord(id, fields, currentValues, endpoint, reloadFunction) {
    // Create modal-like form for editing
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const form = document.createElement('div');
    form.className = 'card';
    form.style.cssText = `
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    form.innerHTML = `
        <h3 style="margin-top: 0;">Editar Registo</h3>
        <div id="edit-form"></div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button id="save-btn" class="primary" style="flex: 1;">Guardar</button>
            <button id="cancel-btn" class="secondary" style="flex: 1;">Cancelar</button>
        </div>
    `;
    
    modal.appendChild(form);
    document.body.appendChild(modal);
    
    const editForm = document.getElementById('edit-form');
    
    // Create edit fields
    fields.forEach(([k, label]) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `
            <label for="edit_${k}">${label}</label>
            <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
        `;
        editForm.appendChild(wrapper);
    });
    
    // Handle save
    document.getElementById('save-btn').onclick = async () => {
        try {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.textContent = 'A guardar...';
            saveBtn.disabled = true;
            
            const newValues = {};
            let hasEmptyRequired = false;
            
            fields.forEach(([k, label]) => {
                const value = document.getElementById('edit_' + k).value.trim();
                if (!value && !label.includes('opcional')) {
                    hasEmptyRequired = true;
                }
                newValues[k] = value || null;
            });
            
            if (hasEmptyRequired) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                saveBtn.textContent = 'Guardar';
                saveBtn.disabled = false;
                return;
            }
            
            await api('PUT', `${endpoint}/${id}`, newValues);
            showNotification('Registo actualizado com sucesso!');
            document.body.removeChild(modal);
            
            // Reload data using the passed function
            if (reloadFunction) {
                reloadFunction();
            }
            
        } catch (e) {
            showNotification(e.message, 'error');
            document.getElementById('save-btn').textContent = 'Guardar';
            document.getElementById('save-btn').disabled = false;
        }
    };
    
    // Handle cancel
    document.getElementById('cancel-btn').onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    // Close on Escape key
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'Enter' && e.ctrlKey) {
            document.getElementById('save-btn').click();
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize with schools tab
openTab('schools');
