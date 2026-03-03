// ===========================================
// PRODUCTION VIEW - READ ONLY
// ===========================================

class ProductionView {
    constructor() {
        this.selectedDate = new Date();
        this.tasks = [];
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.renderDaySelector();
        this.renderTimeline();
        this.updateCurrentTime();
        this.startAutoRefresh();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    // ===========================================
    // DATA LOADING
    // ===========================================

    loadData() {
        // In production, this would load from API/Helios
        // For now, load from localStorage or use mock data
        
        const savedData = localStorage.getItem('planning_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.tasks = data.plannedItems || [];
        } else {
            // Mock data
            this.tasks = this.generateMockTasks();
        }
    }

    generateMockTasks() {
        const today = this.dateToString(new Date());
        const tomorrow = this.dateToString(new Date(Date.now() + 86400000));
        
        return [
            {
                recipeId: 'R001',
                commandId: 'P001',
                type: 'podklad',
                recipeName: 'Ananasový dort 1kg',
                date: today,
                startHour: 8,
                duration: 2,
                status: 'completed'
            },
            {
                recipeId: 'R002',
                commandId: 'P005',
                type: 'podklad',
                recipeName: 'Jahodový dort 2kg',
                date: today,
                startHour: 10,
                duration: 3,
                status: 'in-progress'
            },
            {
                recipeId: 'R001',
                commandId: 'P002',
                type: 'tvaroh',
                recipeName: 'Ananasový dort 1kg',
                date: today,
                startHour: 14,
                duration: 2,
                status: 'pending'
            },
            {
                recipeId: 'R003',
                commandId: 'P009',
                type: 'podklad',
                recipeName: 'Čokoládový dort 1.5kg',
                date: today,
                startHour: 16,
                duration: 2,
                status: 'pending'
            },
            {
                recipeId: 'R002',
                commandId: 'P006',
                type: 'tvaroh',
                recipeName: 'Jahodový dort 2kg',
                date: tomorrow,
                startHour: 8,
                duration: 2,
                status: 'pending'
            }
        ];
    }

    // ===========================================
    // RENDERING
    // ===========================================

    renderDaySelector() {
        const selector = document.getElementById('daySelector');
        selector.innerHTML = '';

        // Generate 7 days starting from today
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const button = this.createDayButton(date);
            selector.appendChild(button);
        }
    }

    createDayButton(date) {
        const button = document.createElement('button');
        button.className = 'day-button';
        
        if (this.isSameDay(date, this.selectedDate)) {
            button.classList.add('active');
        }

        const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
        
        button.innerHTML = `
            <span class="date">${date.getDate()}.${date.getMonth() + 1}.</span>
            <span class="day-name">${dayNames[date.getDay()]}</span>
        `;

        button.addEventListener('click', () => {
            this.selectedDate = date;
            this.renderDaySelector();
            this.renderTimeline();
        });

        return button;
    }

    renderTimeline() {
        const grid = document.getElementById('timelineGrid');
        const todayTasks = this.getTasksForDate(this.selectedDate);
        
        // Update header
        const isToday = this.isSameDay(this.selectedDate, new Date());
        document.getElementById('timelineTitle').textContent = 
            isToday ? 'Dnešní úkoly' : `Úkoly na ${this.formatDate(this.selectedDate)}`;
        document.getElementById('timelineSubtitle').textContent = 
            this.formatDateLong(this.selectedDate);
        document.getElementById('taskCount').textContent = todayTasks.length;

        if (todayTasks.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1;" class="no-tasks">
                    📭 Žádné úkoly pro tento den
                </div>
            `;
            return;
        }

        grid.innerHTML = '';

        // Render timeline slots (6:00 - 22:00)
        for (let hour = 6; hour <= 22; hour++) {
            // Time column
            const timeCell = document.createElement('div');
            timeCell.className = 'timeline-time';
            timeCell.textContent = `${hour}:00`;
            grid.appendChild(timeCell);

            // Slot column
            const slotCell = document.createElement('div');
            slotCell.className = 'timeline-slot';
            slotCell.dataset.hour = hour;

            // Find tasks that belong to this hour
            todayTasks.forEach(task => {
                if (task.startHour === hour) {
                    const taskElement = this.createTaskElement(task);
                    slotCell.appendChild(taskElement);
                }
            });

            grid.appendChild(slotCell);
        }
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `timeline-item type-${task.type}`;
        
        const currentHour = new Date().getHours();
        const isToday = this.isSameDay(new Date(task.date), new Date());
        
        // Check if task is currently in progress
        if (isToday && currentHour >= task.startHour && currentHour < task.startHour + task.duration) {
            div.classList.add('current');
        }

        // Calculate height based on duration
        const height = task.duration * 80; // 80px per hour
        div.style.height = `${height - 16}px`; // -16 for padding

        const statusClass = task.status || 'pending';
        
        div.innerHTML = `
            <div class="timeline-item-header">
                <span class="timeline-item-id">${task.recipeId}</span>
                <span class="status-indicator status-${statusClass}"></span>
            </div>
            <div class="timeline-item-title">${task.recipeName || 'Výrobní úkol'}</div>
            <div class="timeline-item-meta">
                ⏰ ${task.startHour}:00 - ${task.startHour + task.duration}:00
                <br>
                📋 ${this.getTypeName(task.type)} (${task.commandId})
            </div>
        `;

        return div;
    }

    // ===========================================
    // AUTO REFRESH
    // ===========================================

    startAutoRefresh() {
        this.updateLastRefreshTime();
        
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
            this.renderTimeline();
            this.updateLastRefreshTime();
        }, 30000);
    }

    updateLastRefreshTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('cs-CZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('currentTime').textContent = `${timeString}`;
    }

    getTasksForDate(date) {
        const dateString = this.dateToString(date);
        return this.tasks.filter(task => task.date === dateString);
    }

    dateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDate(date) {
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }

    formatDateLong(date) {
        return date.toLocaleDateString('cs-CZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    getTypeName(type) {
        const names = {
            'podklad': 'Podklad',
            'tvaroh': 'Tvaroh',
            'krem': 'Krém',
            'freezer': 'Freezer'
        };
        return names[type] || type;
    }
}

// ===========================================
// FULL SCREEN TOGGLE
// ===========================================

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// ===========================================
// INITIALIZE
// ===========================================

let productionView;
document.addEventListener('DOMContentLoaded', () => {
    productionView = new ProductionView();
});
