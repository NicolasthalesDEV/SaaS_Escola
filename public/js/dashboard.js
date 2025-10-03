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
            endpoint: '/api/branches',
            customFields: ['school_id']
        },
        teachers: {
            title: 'Professores',
            subtitle: 'Registe e faça a gestão do corpo docente',
            icon: '👨‍🏫',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome Completo'], ['email', 'Email']],
            endpoint: '/api/teachers',
            customFields: ['school_id', 'branch_id']
        },
        students: {
            title: 'Alunos',
            subtitle: 'Administre os estudantes matriculados',
            icon: '👨‍🎓',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome Completo'], ['email', 'Email']],
            endpoint: '/api/students',
            customFields: ['school_id', 'branch_id']
        },
        classes: {
            title: 'Turmas',
            subtitle: 'Organize as salas de aula e disciplinas',
            icon: '📚',
            fields: [['school_id', 'ID da Escola'], ['branch_id', 'ID da Filial (opcional)'], ['name', 'Nome da Turma'], ['teacher_id', 'Professor (seleccione da lista)']],
            endpoint: '/api/classes',
            customFields: ['school_id', 'branch_id', 'teacher_id']
        },
        schedules: {
            title: 'Horários',
            subtitle: 'Configure os horários das aulas',
            icon: '📅',
            fields: [['class_id', 'ID da Turma'], ['weekday', 'Dia da Semana'], ['start_time', 'Horário de Início'], ['end_time', 'Horário de Término']],
            endpoint: '/api/schedules',
            customFields: ['class_id', 'weekday', 'start_time', 'end_time']
        }
    };
    
    const section = map[name];
    renderCRUD(section.title, section.subtitle, section.icon, section.fields, section.endpoint, section);
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

async function renderCRUD(title, subtitle, icon, fields, endpoint, section = {}) {
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
    const promises = fields.map(async ([k, label]) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        
        // Check if this field needs special treatment
        if (section.customFields && section.customFields.includes(k)) {
            if (k === 'teacher_id') {
                // Create dropdown for teachers
                try {
                    const teachers = await api('GET', '/api/teachers');
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Seleccione um professor...</option>
                            ${teachers.map(teacher => 
                                `<option value="${teacher.id}">${teacher.name} (ID: ${teacher.id})</option>`
                            ).join('')}
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                            ⚠️ Só pode atribuir professores já registados. Se não vê o professor desejado, crie-o primeiro na secção "Professores".
                        </small>
                    `;
                } catch (e) {
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Erro ao carregar professores</option>
                        </select>
                    `;
                }
            } else if (k === 'class_id') {
                // Create dropdown for classes
                try {
                    const classes = await api('GET', '/api/classes');
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Seleccione uma turma...</option>
                            ${classes.map(classItem => 
                                `<option value="${classItem.id}">${classItem.name} (ID: ${classItem.id})</option>`
                            ).join('')}
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                            ⚠️ Só pode atribuir turmas já registadas. Se não vê a turma desejada, crie-a primeiro na secção "Turmas".
                        </small>
                    `;
                } catch (e) {
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Erro ao carregar turmas</option>
                        </select>
                    `;
                }
            } else if (k === 'school_id') {
                // Create dropdown for schools
                try {
                    const schools = await api('GET', '/api/schools');
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Seleccione uma escola...</option>
                            ${schools.map(school => 
                                `<option value="${school.id}">${school.name} (ID: ${school.id})</option>`
                            ).join('')}
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                            ⚠️ Só pode atribuir escolas já registadas. Se não vê a escola desejada, crie-a primeiro na secção "Escolas".
                        </small>
                    `;
                } catch (e) {
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Erro ao carregar escolas</option>
                        </select>
                    `;
                }
            } else if (k === 'branch_id') {
                // Create dropdown for branches
                try {
                    const branches = await api('GET', '/api/branches');
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Seleccione uma filial...</option>
                            ${branches.map(branch => 
                                `<option value="${branch.id}">${branch.name} (ID: ${branch.id})</option>`
                            ).join('')}
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                            ⚠️ Campo opcional. Deixe em branco se não aplicável.
                        </small>
                    `;
                } catch (e) {
                    wrapper.innerHTML = `
                        <label for="f_${k}">${label}</label>
                        <select id="f_${k}">
                            <option value="">Erro ao carregar filiais</option>
                        </select>
                    `;
                }
            } else if (k === 'weekday') {
                // Create dropdown for weekdays
                wrapper.innerHTML = `
                    <label for="f_${k}">${label}</label>
                    <select id="f_${k}">
                        <option value="">Seleccione o dia da semana...</option>
                        <option value="0">Domingo</option>
                        <option value="1">Segunda-feira</option>
                        <option value="2">Terça-feira</option>
                        <option value="3">Quarta-feira</option>
                        <option value="4">Quinta-feira</option>
                        <option value="5">Sexta-feira</option>
                        <option value="6">Sábado</option>
                    </select>
                `;
            } else if (k === 'start_time') {
                // Create time input for start time
                wrapper.innerHTML = `
                    <label for="f_${k}">${label}</label>
                    <input id="f_${k}" type="time" placeholder="08:00">
                    <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                        Formato: HH:MM (ex: 08:00, 14:30)
                    </small>
                `;
            } else if (k === 'end_time') {
                // Create time input for end time
                wrapper.innerHTML = `
                    <label for="f_${k}">${label}</label>
                    <input id="f_${k}" type="time" placeholder="09:30">
                    <small style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                        Formato: HH:MM (ex: 09:30, 16:00)
                    </small>
                `;
            }
        } else {
            // Regular input field
            wrapper.innerHTML = `
                <label for="f_${k}">${label}</label>
                <input id="f_${k}" type="text" placeholder="Digite ${label.toLowerCase()}">
            `;
        }
        
        return wrapper;
    });
    
    // Wait for all promises and add to form
    const wrappers = await Promise.all(promises);
    wrappers.forEach(wrapper => form.appendChild(wrapper));
    
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
            
            // Carregar mapas de nomes para mostrar informações mais úteis
            let teachersMap = {};
            let classesMap = {};
            let schoolsMap = {};
            let branchesMap = {};
            
            // Se for a tabela de turmas, caregar nomes dos professores
            if (endpoint === '/api/classes') {
                try {
                    const teachers = await api('GET', '/api/teachers');
                    teachersMap = teachers.reduce((map, teacher) => {
                        map[teacher.id] = teacher.name;
                        return map;
                    }, {});
                } catch (e) {
                    console.warn('Erro ao carregar professores:', e);
                }
            }
            
            // Se for a tabela de horários, caregar nomes das turmas
            if (endpoint === '/api/schedules') {
                try {
                    const classes = await api('GET', '/api/classes');
                    classesMap = classes.reduce((map, classItem) => {
                        map[classItem.id] = classItem.name;
                        return map;
                    }, {});
                } catch (e) {
                    console.warn('Erro ao carregar turmas:', e);
                }
            }
            
            // Carregar escolas para todas as tabelas que referenciam school_id
            if (['branches', 'teachers', 'students', 'classes'].some(table => endpoint.includes(table))) {
                try {
                    const schools = await api('GET', '/api/schools');
                    schoolsMap = schools.reduce((map, school) => {
                        map[school.id] = school.name;
                        return map;
                    }, {});
                } catch (e) {
                    console.warn('Erro ao carregar escolas:', e);
                }
            }
            
            // Carregar filiais para todas as tabelas que referenciam branch_id
            if (['teachers', 'students', 'classes'].some(table => endpoint.includes(table))) {
                try {
                    const branches = await api('GET', '/api/branches');
                    branchesMap = branches.reduce((map, branch) => {
                        map[branch.id] = branch.name;
                        return map;
                    }, {});
                } catch (e) {
                    console.warn('Erro ao carregar filiais:', e);
                }
            }
            
            rows.forEach(row => {
                const tr = document.createElement('tr');
                
                // Processar cada campo para mostrar informações mais úteis
                const processedFields = fields.map(([k]) => {
                    let value = row[k] ?? '';
                    
                    // Se for teacher_id na tabela de turmas, mostrar nome do professor
                    if (k === 'teacher_id' && endpoint === '/api/classes' && value && teachersMap[value]) {
                        return `${teachersMap[value]} (ID: ${value})`;
                    }
                    
                    // Se for class_id na tabela de horários, mostrar nome da turma
                    if (k === 'class_id' && endpoint === '/api/schedules' && value && classesMap[value]) {
                        return `${classesMap[value]} (ID: ${value})`;
                    }
                    
                    // Se for school_id, mostrar nome da escola
                    if (k === 'school_id' && value && schoolsMap[value]) {
                        return `${schoolsMap[value]} (ID: ${value})`;
                    }
                    
                    // Se for branch_id, mostrar nome da filial
                    if (k === 'branch_id' && value && branchesMap[value]) {
                        return `${branchesMap[value]} (ID: ${value})`;
                    }
                    
                    // Se for weekday, mostrar nome do dia
                    if (k === 'weekday' && value !== '' && value !== null) {
                        const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                        return weekdays[value] || value;
                    }
                    
                    return value;
                });
                
                tr.innerHTML = `
                    ${processedFields.map(value => `<td>${value}</td>`).join('')}
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
                        let value = tds[index].innerText;
                        
                        // Se for teacher_id, extrair apenas o ID do texto "Nome (ID: 123)"
                        if (field[0] === 'teacher_id' && value.includes('(ID:')) {
                            const match = value.match(/\(ID:\s*(\d+)\)/);
                            value = match ? match[1] : value;
                        }
                        
                        // Se for class_id, extrair apenas o ID do texto "Nome (ID: 123)"
                        if (field[0] === 'class_id' && value.includes('(ID:')) {
                            const match = value.match(/\(ID:\s*(\d+)\)/);
                            value = match ? match[1] : value;
                        }
                        
                        // Se for school_id, extrair apenas o ID do texto "Nome (ID: 123)"
                        if (field[0] === 'school_id' && value.includes('(ID:')) {
                            const match = value.match(/\(ID:\s*(\d+)\)/);
                            value = match ? match[1] : value;
                        }
                        
                        // Se for branch_id, extrair apenas o ID do texto "Nome (ID: 123)"
                        if (field[0] === 'branch_id' && value.includes('(ID:')) {
                            const match = value.match(/\(ID:\s*(\d+)\)/);
                            value = match ? match[1] : value;
                        }
                        
                        // Se for weekday, extrair o número do nome do dia
                        if (field[0] === 'weekday') {
                            const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                            const dayIndex = weekdays.indexOf(value);
                            value = dayIndex !== -1 ? dayIndex : value;
                        }
                        
                        currentValues[field[0]] = value;
                    });
                    
                    editRecord(id, fields, currentValues, endpoint, loadData, section);
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

function editRecord(id, fields, currentValues, endpoint, reloadFunction, section = {}) {
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
    
    // Create edit fields (async to handle dropdowns)
    const createEditFields = async () => {
        for (const [k, label] of fields) {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-group';
            
            // Check if this field needs special treatment
            if (section.customFields && section.customFields.includes(k)) {
                if (k === 'teacher_id') {
                    // Create dropdown for teachers in edit mode
                    try {
                        const teachers = await api('GET', '/api/teachers');
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <select id="edit_${k}">
                                <option value="">Seleccione um professor...</option>
                                ${teachers.map(teacher => 
                                    `<option value="${teacher.id}" ${teacher.id == currentValues[k] ? 'selected' : ''}>${teacher.name} (ID: ${teacher.id})</option>`
                                ).join('')}
                            </select>
                        `;
                    } catch (e) {
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
                        `;
                    }
                } else if (k === 'class_id') {
                    // Create dropdown for classes in edit mode
                    try {
                        const classes = await api('GET', '/api/classes');
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <select id="edit_${k}">
                                <option value="">Seleccione uma turma...</option>
                                ${classes.map(classItem => 
                                    `<option value="${classItem.id}" ${classItem.id == currentValues[k] ? 'selected' : ''}>${classItem.name} (ID: ${classItem.id})</option>`
                                ).join('')}
                            </select>
                        `;
                    } catch (e) {
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
                        `;
                    }
                } else if (k === 'school_id') {
                    // Create dropdown for schools in edit mode
                    try {
                        const schools = await api('GET', '/api/schools');
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <select id="edit_${k}">
                                <option value="">Seleccione uma escola...</option>
                                ${schools.map(school => 
                                    `<option value="${school.id}" ${school.id == currentValues[k] ? 'selected' : ''}>${school.name} (ID: ${school.id})</option>`
                                ).join('')}
                            </select>
                        `;
                    } catch (e) {
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
                        `;
                    }
                } else if (k === 'branch_id') {
                    // Create dropdown for branches in edit mode
                    try {
                        const branches = await api('GET', '/api/branches');
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <select id="edit_${k}">
                                <option value="">Seleccione uma filial...</option>
                                ${branches.map(branch => 
                                    `<option value="${branch.id}" ${branch.id == currentValues[k] ? 'selected' : ''}>${branch.name} (ID: ${branch.id})</option>`
                                ).join('')}
                            </select>
                        `;
                    } catch (e) {
                        wrapper.innerHTML = `
                            <label for="edit_${k}">${label}</label>
                            <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
                        `;
                    }
                } else if (k === 'weekday') {
                    // Create dropdown for weekdays in edit mode
                    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                    wrapper.innerHTML = `
                        <label for="edit_${k}">${label}</label>
                        <select id="edit_${k}">
                            <option value="">Seleccione o dia da semana...</option>
                            ${weekdays.map((day, index) => 
                                `<option value="${index}" ${index == currentValues[k] ? 'selected' : ''}>${day}</option>`
                            ).join('')}
                        </select>
                    `;
                } else if (k === 'start_time' || k === 'end_time') {
                    // Create time input for start/end time in edit mode
                    wrapper.innerHTML = `
                        <label for="edit_${k}">${label}</label>
                        <input id="edit_${k}" type="time" value="${currentValues[k] || ''}">
                    `;
                }
            } else {
                // Regular input field
                wrapper.innerHTML = `
                    <label for="edit_${k}">${label}</label>
                    <input id="edit_${k}" type="text" value="${currentValues[k] || ''}" placeholder="Digite ${label.toLowerCase()}">
                `;
            }
            
            editForm.appendChild(wrapper);
        }
    };
    
    // Create fields and then set up event handlers
    createEditFields().then(() => {
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
    });
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
