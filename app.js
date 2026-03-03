// ===========================================
// PLÁNOVACÍ SYSTÉM - SWEET PRODUCTION
// ===========================================

class PlanningApp {
    constructor() {
        this.currentWeek = this.getCurrentWeek();
        this.currentYear = new Date().getFullYear();
        this.recipes = [];
        this.plannedItems = [];
        this.selectedRecipe = null;
        this.draggedElement = null;
        this.draggedData = null;
        
        this.init();
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    init() {
        this.loadMockData();
        this.renderBacklog();
        this.renderPlanningGrid();
        this.updateStatistics();
        this.setupEventListeners();
        this.showToast('Aplikace načtena. Data z Heliosu simulována.');
    }

    getCurrentWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.ceil(diff / oneWeek);
    }

    getWeekDates(week, year) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOweekStart = simple;
        
        if (dayOfWeek <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(ISOweekStart);
            date.setDate(ISOweekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    // ===========================================
    // DATA MANAGEMENT
    // ===========================================

    loadMockData() {
        // Mock data - výrobní recepty
        this.recipes = [
            {
                id: 'R001',
                orderId: 'OBJ-2026-001',
                name: 'Ananasový dort 1kg',
                deadline: '2026-02-17',
                locked: true,
                status: 'backlog',
                commands: [
                    { id: 'P001', type: 'pop', offsetDays: -3, duration: 2 },
                    { id: 'P002', type: 'pon', offsetDays: -2, duration: 2 },
                    { id: 'P003', type: 'pok', offsetDays: -1, duration: 1 },
                    { id: 'P004', type: 'final', offsetDays: 0, duration: 1 }
                ]
            },
            {
                id: 'R002',
                orderId: 'OBJ-2026-002',
                name: 'Jahodový dort 2kg',
                deadline: '2026-02-18',
                locked: true,
                status: 'backlog',
                commands: [
                    { id: 'P005', type: 'pop', offsetDays: -3, duration: 3 },
                    { id: 'P006', type: 'pon', offsetDays: -2, duration: 2 },
                    { id: 'P007', type: 'pok', offsetDays: -1, duration: 2 },
                    { id: 'P008', type: 'final', offsetDays: 0, duration: 1 }
                ]
            },
            {
                id: 'R003',
                orderId: 'OBJ-2026-003',
                name: 'Čokoládový dort 1.5kg',
                deadline: '2026-02-19',
                locked: false,
                status: 'backlog',
                commands: [
                    { id: 'P009', type: 'pop', offsetDays: -3, duration: 2 },
                    { id: 'P010', type: 'pon', offsetDays: -2, duration: 1 },
                    { id: 'P011', type: 'pok', offsetDays: -1, duration: 2 },
                    { id: 'P012', type: 'final', offsetDays: 0, duration: 1 }
                ]
            },
            {
                id: 'R004',
                orderId: 'OBJ-2026-004',
                name: 'Vanilkový dort 800g',
                deadline: '2026-02-20',
                locked: true,
                status: 'backlog',
                commands: [
                    { id: 'P013', type: 'pop', offsetDays: -3, duration: 2 },
                    { id: 'P014', type: 'pon', offsetDays: -2, duration: 1 },
                    { id: 'P015', type: 'pok', offsetDays: -1, duration: 1 },
                    { id: 'P016', type: 'final', offsetDays: 0, duration: 1 }
                ]
            },
            {
                id: 'R005',
                orderId: 'OBJ-2026-005',
                name: 'Malinový dort 1.2kg',
                deadline: '2026-02-21',
                locked: true,
                status: 'backlog',
                commands: [
                    { id: 'P017', type: 'pop', offsetDays: -3, duration: 2 },
                    { id: 'P018', type: 'pon', offsetDays: -2, duration: 2 },
                    { id: 'P019', type: 'pok', offsetDays: -1, duration: 1 },
                    { id: 'P020', type: 'final', offsetDays: 0, duration: 1 }
                ]
            }
        ];

        // Simulace již naplánovaných položek
        this.plannedItems = [
            {
                recipeId: 'R001',
                commandId: 'P004',
                type: 'final',
                date: '2026-02-17',
                startHour: 8,
                duration: 1
            }
        ];
    }

    loadFromHelios() {
        this.showToast('🔄 Načítání dat z Helios...');
        setTimeout(() => {
            this.loadMockData();
            this.renderBacklog();
            this.renderPlanningGrid();
            this.updateStatistics();
            this.showToast('✅ Data úspěšně načtena z Helios');
        }, 1000);
    }

    saveToHelios() {
        this.showToast('💾 Ukládání změn do Helios...');
        setTimeout(() => {
            console.log('Planned items to save:', this.plannedItems);
            this.showToast('✅ Změny úspěšně uloženy do Helios');
        }, 1000);
    }

    // ===========================================
    // RENDERING
    // ===========================================

    renderBacklog() {
        const backlogList = document.getElementById('backlogList');
        backlogList.innerHTML = '';

        const backlogRecipes = this.recipes.filter(r => r.status === 'backlog');

        if (backlogRecipes.length === 0) {
            backlogList.innerHTML = '<div style="text-align:center; padding:2rem; color:#64748b;">📭 Žádné položky v backlogu</div>';
            return;
        }

        backlogRecipes.forEach(recipe => {
            const item = this.createBacklogItem(recipe);
            backlogList.appendChild(item);
        });
    }

    createBacklogItem(recipe) {
        const div = document.createElement('div');
        div.className = 'backlog-item';
        div.draggable = true;
        div.dataset.recipeId = recipe.id;

        const commandDots = recipe.commands.map(cmd => 
            `<span class="command-dot" style="background: ${this.getTypeColor(cmd.type)};"></span>`
        ).join('');

        div.innerHTML = `
            <div class="backlog-item-header">
                <span class="backlog-item-id">${recipe.id}</span>
                <span class="backlog-badge badge-${recipe.locked ? 'locked' : 'unlocked'}">
                    ${recipe.locked ? '🔒 Uzamčeno' : '🔓 Odemčeno'}
                </span>
            </div>
            <div class="backlog-item-title">${recipe.name}</div>
            <div class="backlog-item-meta">
                <span>📦 ${recipe.orderId}</span>
                <span>📅 ${this.formatDate(recipe.deadline)}</span>
            </div>
            <div class="backlog-item-commands">
                ${commandDots}
            </div>
        `;

        // Drag events
        div.addEventListener('dragstart', (e) => this.handleDragStart(e, recipe));
        div.addEventListener('dragend', (e) => this.handleDragEnd(e));
        div.addEventListener('click', () => this.showRecipeDetail(recipe));

        return div;
    }

    renderPlanningGrid() {
        const grid = document.getElementById('planningGrid');
        const weekDates = this.getWeekDates(this.currentWeek, this.currentYear);

        // Update week title
        document.getElementById('weekTitle').textContent = `Týden ${this.currentWeek} • ${this.currentYear}`;
        document.getElementById('dateRange').textContent = 
            `${this.formatDate(weekDates[0])} - ${this.formatDate(weekDates[6])}`;

        // Clear existing day columns (keep time column)
        const dayColumns = grid.querySelectorAll('.day-column');
        dayColumns.forEach(col => col.remove());

        // Render time slots
        this.renderTimeSlots();

        // Render day columns
        weekDates.forEach((date, index) => {
            const dayColumn = this.createDayColumn(date, index);
            grid.appendChild(dayColumn);
        });

        // Render planned items
        this.renderPlannedItems();
    }

    renderTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '';

        for (let hour = 6; hour <= 22; hour++) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = `${hour}:00`;
            timeSlotsContainer.appendChild(slot);
        }
    }

    createDayColumn(date, dayIndex) {
        const div = document.createElement('div');
        div.className = 'day-column';
        div.dataset.date = this.dateToString(date);

        const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
        const isToday = this.isToday(date);

        const header = document.createElement('div');
        header.className = `day-header ${isToday ? 'today' : ''}`;
        header.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-date">${date.getDate()}.${date.getMonth() + 1}.</div>
        `;

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'day-slots';

        for (let hour = 6; hour <= 22; hour++) {
            const slot = document.createElement('div');
            slot.className = 'day-slot';
            slot.dataset.hour = hour;
            slot.dataset.date = this.dateToString(date);

            // Drop events
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e, this.dateToString(date), hour));

            slotsContainer.appendChild(slot);
        }

        div.appendChild(header);
        div.appendChild(slotsContainer);

        return div;
    }

    renderPlannedItems() {
        // Clear existing planned items
        document.querySelectorAll('.planned-item').forEach(item => item.remove());

        this.plannedItems.forEach(item => {
            const element = this.createPlannedItem(item);
            const dayColumn = document.querySelector(`.day-column[data-date="${item.date}"]`);
            
            if (dayColumn) {
                const slotsContainer = dayColumn.querySelector('.day-slots');
                slotsContainer.appendChild(element);
            }
        });

        this.detectConflicts();
    }

    createPlannedItem(item) {
        const recipe = this.recipes.find(r => r.id === item.recipeId);
        const command = recipe?.commands.find(c => c.id === item.commandId);

        if (!recipe || !command) return null;

        const div = document.createElement('div');
        div.className = `planned-item type-${item.type}`;
        div.draggable = true;
        div.dataset.recipeId = item.recipeId;
        div.dataset.commandId = item.commandId;

        // Position based on hour and duration
        const startHourIndex = item.startHour - 6; // 6 is first hour
        const top = startHourIndex * 60; // 60px per hour
        const height = item.duration * 60;

        div.style.top = `${top}px`;
        div.style.height = `${height}px`;

        div.innerHTML = `
            <div class="planned-item-header">
                <span class="planned-item-id">${recipe.id}</span>
                <span class="planned-item-lock">${recipe.locked ? '🔒' : ''}</span>
            </div>
            <div class="planned-item-title">${recipe.name}</div>
            <div class="planned-item-time">${item.startHour}:00 - ${item.startHour + item.duration}:00 (${this.getTypeName(item.type)})</div>
        `;

        // Drag events
        div.addEventListener('dragstart', (e) => this.handlePlannedDragStart(e, item));
        div.addEventListener('dragend', (e) => this.handleDragEnd(e));
        div.addEventListener('click', () => this.showRecipeDetail(recipe));

        return div;
    }

    // ===========================================
    // DRAG & DROP HANDLERS
    // ===========================================

    handleDragStart(e, recipe) {
        this.draggedElement = e.target;
        this.draggedData = { type: 'recipe', data: recipe };
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handlePlannedDragStart(e, item) {
        this.draggedElement = e.target;
        this.draggedData = { type: 'planned', data: item };
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.day-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e, date, hour) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (!this.draggedData) return;

        if (this.draggedData.type === 'recipe') {
            this.planRecipe(this.draggedData.data, date, hour);
        } else if (this.draggedData.type === 'planned') {
            this.movePlannedItem(this.draggedData.data, date, hour);
        }

        this.draggedData = null;
    }

    // ===========================================
    // PLANNING LOGIC
    // ===========================================

    planRecipe(recipe, targetDate, targetHour) {
        const deadline = new Date(targetDate);
        
        // Create planned items for all commands
        recipe.commands.forEach(command => {
            const commandDate = new Date(deadline);
            commandDate.setDate(deadline.getDate() + command.offsetDays);

            const plannedItem = {
                recipeId: recipe.id,
                commandId: command.id,
                type: command.type,
                date: this.dateToString(commandDate),
                startHour: targetHour,
                duration: command.duration
            };

            // Remove if already exists
            this.plannedItems = this.plannedItems.filter(
                item => !(item.recipeId === recipe.id && item.commandId === command.id)
            );

            this.plannedItems.push(plannedItem);
        });

        // Update recipe status
        recipe.status = 'planned';

        // Re-render
        this.renderBacklog();
        this.renderPlanningGrid();
        this.updateStatistics();

        this.showToast(`✅ Recept ${recipe.id} naplánován`);
    }

    movePlannedItem(item, newDate, newHour) {
        const recipe = this.recipes.find(r => r.id === item.recipeId);
        
        if (!recipe) return;

        const itemIndex = this.plannedItems.findIndex(
            p => p.recipeId === item.recipeId && p.commandId === item.commandId
        );

        if (itemIndex === -1) return;

        const oldDate = new Date(item.date);
        const newDateObj = new Date(newDate);
        const daysDiff = Math.round((newDateObj - oldDate) / (1000 * 60 * 60 * 24));
        const hoursDiff = newHour - item.startHour;

        // Update the moved item
        this.plannedItems[itemIndex].date = newDate;
        this.plannedItems[itemIndex].startHour = newHour;

        // If locked, move all related commands
        if (recipe.locked) {
            this.plannedItems.forEach(planned => {
                if (planned.recipeId === item.recipeId && planned.commandId !== item.commandId) {
                    const plannedDate = new Date(planned.date);
                    plannedDate.setDate(plannedDate.getDate() + daysDiff);
                    planned.date = this.dateToString(plannedDate);
                    planned.startHour = planned.startHour + hoursDiff;
                }
            });
        }

        // Re-render
        this.renderPlanningGrid();
        this.updateStatistics();

        this.showToast(`✅ Položka přesunuta`);
    }

    detectConflicts() {
        const conflicts = [];

        this.plannedItems.forEach((item, index) => {
            this.plannedItems.forEach((other, otherIndex) => {
                if (index >= otherIndex) return;
                if (item.date !== other.date) return;

                const item1End = item.startHour + item.duration;
                const item2End = other.startHour + other.duration;

                const hasConflict = (
                    (item.startHour >= other.startHour && item.startHour < item2End) ||
                    (other.startHour >= item.startHour && other.startHour < item1End)
                );

                if (hasConflict) {
                    conflicts.push({ item, other });
                }
            });
        });

        // Mark conflicts visually
        document.querySelectorAll('.planned-item').forEach(element => {
            element.classList.remove('conflict');
        });

        conflicts.forEach(conflict => {
            const element1 = document.querySelector(
                `.planned-item[data-recipe-id="${conflict.item.recipeId}"][data-command-id="${conflict.item.commandId}"]`
            );
            const element2 = document.querySelector(
                `.planned-item[data-recipe-id="${conflict.other.recipeId}"][data-command-id="${conflict.other.commandId}"]`
            );

            if (element1) element1.classList.add('conflict');
            if (element2) element2.classList.add('conflict');
        });

        return conflicts.length;
    }

    // ===========================================
    // MODAL & DETAIL
    // ===========================================

    showRecipeDetail(recipe) {
        this.selectedRecipe = recipe;
        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const lockToggle = document.getElementById('lockToggle');

        modalTitle.textContent = `Detail receptu ${recipe.id}`;
        lockToggle.checked = recipe.locked;

        const plannedCommands = this.plannedItems.filter(item => item.recipeId === recipe.id);

        modalBody.innerHTML = `
            <ul class="detail-list">
                <li class="detail-item">
                    <span class="detail-label">ID receptu:</span>
                    <span class="detail-value">${recipe.id}</span>
                </li>
                <li class="detail-item">
                    <span class="detail-label">Objednávka:</span>
                    <span class="detail-value">${recipe.orderId}</span>
                </li>
                <li class="detail-item">
                    <span class="detail-label">Název:</span>
                    <span class="detail-value">${recipe.name}</span>
                </li>
                <li class="detail-item">
                    <span class="detail-label">Termín:</span>
                    <span class="detail-value">${this.formatDate(recipe.deadline)}</span>
                </li>
                <li class="detail-item">
                    <span class="detail-label">Stav:</span>
                    <span class="detail-value">${recipe.status === 'backlog' ? '📦 Backlog' : '✅ Naplánováno'}</span>
                </li>
            </ul>

            <h4 style="margin: 1.5rem 0 0.5rem 0;">Výrobní příkazy (${recipe.commands.length})</h4>
            <div class="command-list">
                ${recipe.commands.map(cmd => {
                    const planned = plannedCommands.find(p => p.commandId === cmd.id);
                    return `
                        <div class="command-item type-${cmd.type}">
                            <div class="command-header">
                                <span>${cmd.id} - ${this.getTypeName(cmd.type)}</span>
                                <span>${cmd.duration}h</span>
                            </div>
                            <div class="command-time">
                                ${planned ? 
                                    `✅ Naplánováno: ${this.formatDate(planned.date)} ${planned.startHour}:00` : 
                                    `⏳ Offset: ${cmd.offsetDays} dnů`
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('detailModal').classList.remove('active');
        this.selectedRecipe = null;
    }

    toggleLock() {
        if (!this.selectedRecipe) return;

        this.selectedRecipe.locked = document.getElementById('lockToggle').checked;
        this.renderBacklog();
        this.showToast(`🔒 Recept ${this.selectedRecipe.locked ? 'uzamčen' : 'odemčen'}`);
    }

    deleteRecipe() {
        if (!this.selectedRecipe) return;

        if (!confirm(`Opravdu smazat recept ${this.selectedRecipe.id}?`)) return;

        // Remove from planned items
        this.plannedItems = this.plannedItems.filter(item => item.recipeId !== this.selectedRecipe.id);

        // Remove from recipes
        this.recipes = this.recipes.filter(r => r.id !== this.selectedRecipe.id);

        this.closeModal();
        this.renderBacklog();
        this.renderPlanningGrid();
        this.updateStatistics();

        this.showToast(`🗑️ Recept smazán`);
    }

    saveChanges() {
        this.closeModal();
        this.saveToHelios();
    }

    // ===========================================
    // NAVIGATION
    // ===========================================

    previousWeek() {
        this.currentWeek--;
        if (this.currentWeek < 1) {
            this.currentWeek = 52;
            this.currentYear--;
        }
        this.renderPlanningGrid();
    }

    nextWeek() {
        this.currentWeek++;
        if (this.currentWeek > 52) {
            this.currentWeek = 1;
            this.currentYear++;
        }
        this.renderPlanningGrid();
    }

    goToToday() {
        this.currentWeek = this.getCurrentWeek();
        this.currentYear = new Date().getFullYear();
        this.renderPlanningGrid();
    }

    // ===========================================
    // STATISTICS
    // ===========================================

    updateStatistics() {
        const planned = this.recipes.filter(r => r.status === 'planned').length;
        const backlog = this.recipes.filter(r => r.status === 'backlog').length;
        const conflicts = this.detectConflicts();

        // Calculate capacity (simplified)
        const totalCapacity = 7 * 16 * 60; // 7 days * 16 hours * 60 minutes
        const usedCapacity = this.plannedItems.reduce((sum, item) => sum + (item.duration * 60), 0);
        const capacityPercent = Math.round((usedCapacity / totalCapacity) * 100);

        document.getElementById('statPlanned').textContent = planned;
        document.getElementById('statBacklog').textContent = backlog;
        document.getElementById('statConflicts').textContent = conflicts;
        document.getElementById('statCapacity').textContent = `${capacityPercent}%`;
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================

    setupEventListeners() {
        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterBacklog(e.target.value);
        });

        // Status filter
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterBacklog(null, e.target.value);
        });

        // Close modal on outside click
        document.getElementById('detailModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') {
                this.closeModal();
            }
        });
    }

    filterBacklog(searchText, status) {
        // TODO: Implement filtering
        console.log('Filter:', searchText, status);
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    dateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}.${month}.`;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    getTypeName(type) {
        const names = {
            'pop': 'POP',
            'pon': 'PON',
            'pok': 'POK',
            'final': 'FINAL'
        };
        return names[type] || type;
    }

    getTypeColor(type) {
        const colors = {
            'pop': '#3b82f6',
            'pon': '#8b5cf6',
            'pok': '#ec4899',
            'final': '#10b981'
        };
        return colors[type] || '#6b7280';
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ===========================================
// INITIALIZE APP
// ===========================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PlanningApp();
});
