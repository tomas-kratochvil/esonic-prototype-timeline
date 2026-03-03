// ===========================================
// CONFIGURATION APP
// ===========================================

class ConfigApp {
    constructor() {
        this.commandTypes = [];
        this.recipeTemplates = [];
        this.generalSettings = {};
        
        this.init();
    }

    init() {
        this.loadConfiguration();
        this.renderCommands();
        this.renderTemplates();
        this.loadGeneralSettings();
        
        // Color picker preview
        const colorInput = document.getElementById('newCommandColor');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                document.getElementById('colorPreview').textContent = e.target.value;
            });
        }
    }

    // ===========================================
    // COMMAND TYPES MANAGEMENT
    // ===========================================

    loadConfiguration() {
        const saved = localStorage.getItem('config_command_types');
        if (saved) {
            this.commandTypes = JSON.parse(saved);
        } else {
            // Default command types
            this.commandTypes = [
                {
                    id: 'podklad',
                    name: 'Výroba podkladu',
                    color: '#3b82f6',
                    defaultDuration: 2
                },
                {
                    id: 'tvaroh',
                    name: 'Příprava tvarohu',
                    color: '#8b5cf6',
                    defaultDuration: 2
                },
                {
                    id: 'krem',
                    name: 'Příprava krému',
                    color: '#ec4899',
                    defaultDuration: 1
                },
                {
                    id: 'freezer',
                    name: 'Zmražení a balení',
                    color: '#10b981',
                    defaultDuration: 1
                }
            ];
            this.saveConfiguration();
        }

        // Load templates
        const savedTemplates = localStorage.getItem('config_recipe_templates');
        if (savedTemplates) {
            this.recipeTemplates = JSON.parse(savedTemplates);
        } else {
            // Default templates
            this.recipeTemplates = [
                {
                    id: 'standard_cake',
                    name: 'Standardní dort',
                    description: 'Běžný dort s tvarohem a krémem',
                    commands: [
                        { typeId: 'podklad', offsetDays: -3, duration: 2 },
                        { typeId: 'tvaroh', offsetDays: -2, duration: 2 },
                        { typeId: 'krem', offsetDays: -1, duration: 1 },
                        { typeId: 'freezer', offsetDays: 0, duration: 1 }
                    ]
                },
                {
                    id: 'large_cake',
                    name: 'Velký dort (2kg+)',
                    description: 'Dort s prodlouženou přípravou',
                    commands: [
                        { typeId: 'podklad', offsetDays: -4, duration: 3 },
                        { typeId: 'tvaroh', offsetDays: -2, duration: 3 },
                        { typeId: 'krem', offsetDays: -1, duration: 2 },
                        { typeId: 'freezer', offsetDays: 0, duration: 2 }
                    ]
                }
            ];
            this.saveTemplates();
        }
    }

    saveConfiguration() {
        localStorage.setItem('config_command_types', JSON.stringify(this.commandTypes));
        this.showSavedIndicator();
    }

    saveTemplates() {
        localStorage.setItem('config_recipe_templates', JSON.stringify(this.recipeTemplates));
        this.showSavedIndicator();
    }

    renderCommands() {
        const grid = document.getElementById('commandsGrid');
        grid.innerHTML = '';

        this.commandTypes.forEach((command, index) => {
            const card = this.createCommandCard(command, index);
            grid.appendChild(card);
        });
    }

    createCommandCard(command, index) {
        const div = document.createElement('div');
        div.className = 'config-card';

        div.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <span class="card-color" style="background: ${command.color};"></span>
                    ${command.name}
                </div>
                <button class="btn-icon-small" onclick="configApp.deleteCommand(${index})" title="Smazat">
                    🗑️
                </button>
            </div>
            <div class="form-group">
                <label class="form-label">ID typu</label>
                <input type="text" class="form-input" value="${command.id}" 
                    onchange="configApp.updateCommand(${index}, 'id', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Název</label>
                <input type="text" class="form-input" value="${command.name}" 
                    onchange="configApp.updateCommand(${index}, 'name', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Barva</label>
                <div class="color-picker-wrapper">
                    <input type="color" class="color-input" value="${command.color}" 
                        onchange="configApp.updateCommand(${index}, 'color', this.value)">
                    <span>${command.color}</span>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Defaultní trvání (hodiny)</label>
                <input type="number" class="form-input" value="${command.defaultDuration}" 
                    min="1" max="24"
                    onchange="configApp.updateCommand(${index}, 'defaultDuration', parseInt(this.value))">
            </div>
        `;

        return div;
    }

    showAddCommandForm() {
        document.getElementById('addCommandForm').style.display = 'block';
    }

    hideAddCommandForm() {
        document.getElementById('addCommandForm').style.display = 'none';
        // Clear inputs
        document.getElementById('newCommandId').value = '';
        document.getElementById('newCommandName').value = '';
        document.getElementById('newCommandColor').value = '#3b82f6';
        document.getElementById('newCommandDuration').value = '2';
    }

    addCommand() {
        const id = document.getElementById('newCommandId').value.trim();
        const name = document.getElementById('newCommandName').value.trim();
        const color = document.getElementById('newCommandColor').value;
        const duration = parseInt(document.getElementById('newCommandDuration').value);

        if (!id || !name) {
            alert('Vyplňte prosím ID a název příkazu');
            return;
        }

        // Check if ID already exists
        if (this.commandTypes.find(c => c.id === id)) {
            alert('Příkaz s tímto ID již existuje');
            return;
        }

        this.commandTypes.push({ id, name, color, defaultDuration: duration });
        this.saveConfiguration();
        this.renderCommands();
        this.hideAddCommandForm();
    }

    updateCommand(index, field, value) {
        this.commandTypes[index][field] = value;
        this.saveConfiguration();
        
        // Re-render to update color display
        if (field === 'color') {
            this.renderCommands();
        }
    }

    deleteCommand(index) {
        if (!confirm('Opravdu smazat tento typ příkazu?')) return;
        
        this.commandTypes.splice(index, 1);
        this.saveConfiguration();
        this.renderCommands();
    }

    // ===========================================
    // RECIPE TEMPLATES MANAGEMENT
    // ===========================================

    renderTemplates() {
        const list = document.getElementById('templatesList');
        list.innerHTML = '';

        if (this.recipeTemplates.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    📋 Zatím žádné šablony. Vytvořte první šablonu receptu.
                </div>
            `;
            return;
        }

        this.recipeTemplates.forEach((template, index) => {
            const item = this.createTemplateItem(template, index);
            list.appendChild(item);
        });
    }

    createTemplateItem(template, index) {
        const li = document.createElement('li');
        li.className = 'recipe-template-item';

        const commandBadges = template.commands.map(cmd => {
            const commandType = this.commandTypes.find(c => c.id === cmd.typeId);
            return `
                <span class="command-badge" style="background: ${commandType?.color || '#6b7280'};">
                    ${commandType?.name || cmd.typeId} 
                    (${cmd.offsetDays} dnů, ${cmd.duration}h)
                </span>
            `;
        }).join('');

        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        ${template.name}
                        <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">
                            (${template.id})
                        </span>
                    </h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
                        ${template.description}
                    </p>
                    <div class="template-commands">
                        ${commandBadges}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon-small" onclick="configApp.editTemplate(${index})" title="Upravit">
                        ✏️
                    </button>
                    <button class="btn-icon-small" onclick="configApp.deleteTemplate(${index})" title="Smazat">
                        🗑️
                    </button>
                </div>
            </div>
        `;

        return li;
    }

    showAddTemplateForm() {
        // Simple prompt for now - in production would be a proper form
        const name = prompt('Název šablony:');
        if (!name) return;

        const id = prompt('ID šablony (např. standard_cake):');
        if (!id) return;

        const description = prompt('Popis šablony:') || '';

        this.recipeTemplates.push({
            id,
            name,
            description,
            commands: [
                { typeId: 'podklad', offsetDays: -3, duration: 2 },
                { typeId: 'freezer', offsetDays: 0, duration: 1 }
            ]
        });

        this.saveTemplates();
        this.renderTemplates();
    }

    editTemplate(index) {
        alert('Editace šablony - tato funkce bude implementována v plné verzi');
        // In production, open a detailed form to edit the template
    }

    deleteTemplate(index) {
        if (!confirm('Opravdu smazat tuto šablonu?')) return;
        
        this.recipeTemplates.splice(index, 1);
        this.saveTemplates();
        this.renderTemplates();
    }

    // ===========================================
    // GENERAL SETTINGS
    // ===========================================

    loadGeneralSettings() {
        const saved = localStorage.getItem('config_general');
        if (saved) {
            this.generalSettings = JSON.parse(saved);
        } else {
            this.generalSettings = {
                workStartHour: 6,
                workEndHour: 22,
                heliosApiUrl: '',
                refreshInterval: 30
            };
        }

        // Populate form
        document.getElementById('workStartHour').value = this.generalSettings.workStartHour;
        document.getElementById('workEndHour').value = this.generalSettings.workEndHour;
        document.getElementById('heliosApiUrl').value = this.generalSettings.heliosApiUrl || '';
        document.getElementById('refreshInterval').value = this.generalSettings.refreshInterval;
    }

    saveGeneralSettings() {
        this.generalSettings = {
            workStartHour: parseInt(document.getElementById('workStartHour').value),
            workEndHour: parseInt(document.getElementById('workEndHour').value),
            heliosApiUrl: document.getElementById('heliosApiUrl').value,
            refreshInterval: parseInt(document.getElementById('refreshInterval').value)
        };

        localStorage.setItem('config_general', JSON.stringify(this.generalSettings));
        this.showSavedIndicator();
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    showSavedIndicator() {
        const indicator = document.getElementById('savedIndicator');
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

// ===========================================
// TAB SWITCHING
// ===========================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update sections
    document.querySelectorAll('.config-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}-section`).classList.add('active');
}

// ===========================================
// INITIALIZE
// ===========================================

let configApp;
document.addEventListener('DOMContentLoaded', () => {
    configApp = new ConfigApp();
});
