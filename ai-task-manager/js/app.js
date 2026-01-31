import CONFIG from './config.js';
import Storage from './modules/Storage.js';
import Board from './modules/Board.js';
import Task from './modules/Task.js';
import Toast from './components/Toast.js';
import Modal from './components/Modal.js';
import { debounce, formatRelativeDate, isOverdue, isToday } from './utils/helpers.js';

class App {
    constructor() {
        this.storage = Storage;
        this.currentBoard = null;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initialized`);
        this.loadSettings();
        this.setupEventListeners();
        this.loadBoards();
        this.updateStatistics();

        const boards = this.storage.getBoards();
        if (boards.length > 0) {
            this.loadBoard(boards[0].id);
        }
    }

    loadSettings() {
        const settings = this.storage.getSettings();
        if (settings.darkMode !== undefined) {
            if (settings.darkMode) {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            }
        } else {
            document.body.classList.add('dark-theme');
            this.storage.updateSettings({ darkMode: true });
        }
        this.updateThemeIcon();
    }

    setupEventListeners() {
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('newBoardBtn')?.addEventListener('click', () => {
            this.showNewBoardModal();
        });

        document.getElementById('aiGenerateBoardBtn')?.addEventListener('click', () => {
            this.showAIGenerateBoardModal();
        });

        document.getElementById('addColumnBtn')?.addEventListener('click', () => {
            this.showAddColumnModal();
        });

        // ✅ FIXED: AI Assistant shows toast notification
        document.getElementById('aiToggle')?.addEventListener('click', () => {
            Toast.info('🤖 AI Assistant coming soon!');
        });

        document.getElementById('closeChatBtn')?.addEventListener('click', () => {
            this.toggleAIChat();
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettingsModal();
        });

        const searchInput = document.getElementById('globalSearch');
        const searchContainer = searchInput?.parentElement;

        if (searchInput) {
            let clearBtn = searchContainer?.querySelector('.search-clear-btn');
            if (!clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.className = 'search-clear-btn';
                clearBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
                searchContainer?.appendChild(clearBtn);
            }

            searchInput.addEventListener('input', debounce((e) => {
                this.searchQuery = e.target.value.trim();
                if (this.searchQuery) {
                    clearBtn.classList.add('visible');
                } else {
                    clearBtn.classList.remove('visible');
                }
                this.renderBoard();
                if (this.searchQuery) {
                    this.showSearchResultCount();
                }
            }, 300));

            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
                clearBtn.classList.remove('visible');
                this.renderBoard();
            });
        }

        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // EVENT DELEGATION FOR BOARD MENU & TASK CARDS
        document.addEventListener('click', (e) => {
            // 1. Handle board menu button click - PRIORITY PERTAMA
            const boardMenuBtn = e.target.closest('.board-menu-btn');
            if (boardMenuBtn) {
                e.stopPropagation();
                e.preventDefault();
                const boardId = boardMenuBtn.dataset.boardId;
                console.log('Board menu clicked', boardId);
                if (boardId) {
                    this.showBoardMenu(boardMenuBtn, boardId);
                }
                return;
            }

            // 2. Handle board item click (load board)
            const boardItem = e.target.closest('.board-item');
            if (boardItem && !e.target.closest('.board-menu-btn')) {
                const boardId = boardItem.querySelector('.board-menu-btn')?.dataset.boardId;
                if (boardId) {
                    this.loadBoard(boardId);
                }
                return;
            }

            // 3. Handle task menu button click
            const taskMenuBtn = e.target.closest('.task-menu-btn');
            if (taskMenuBtn) {
                e.stopPropagation();
                e.preventDefault();
                const taskCard = taskMenuBtn.closest('.task-card');
                const taskId = taskCard?.dataset.taskId;
                if (taskId) {
                    this.showTaskMenu(taskMenuBtn, taskId);
                }
                return;
            }

            // 4. Handle task card click (show detail modal)
            const taskCard = e.target.closest('.task-card');
            if (taskCard && !e.target.closest('.task-menu-btn')) {
                const taskId = taskCard.dataset.taskId;
                if (taskId) {
                    this.showTaskDetailModal(taskId);
                }
                return;
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar || !mainContent) return;
        
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
        
        if (window.innerWidth <= 1024) {
            let backdrop = document.querySelector('.sidebar-backdrop');
            
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop';
                backdrop.addEventListener('click', () => {
                    this.toggleSidebar();
                });
                document.body.appendChild(backdrop);
            }
            
            setTimeout(() => {
                backdrop.classList.toggle('active');
            }, 10);
        }
        
        if (window.innerWidth > 1024) {
            const backdrop = document.querySelector('.sidebar-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === CONFIG.KEYBOARD_SHORTCUTS.SEARCH) {
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }

        if (e.key === CONFIG.KEYBOARD_SHORTCUTS.NEW_TASK) {
            e.preventDefault();
            this.showNewTaskModal();
        }

        if (e.key === CONFIG.KEYBOARD_SHORTCUTS.AI_CHAT) {
            e.preventDefault();
            Toast.info('🤖 AI Assistant coming soon!');
        }

        if (e.key === 'Escape') {
            const searchInput = document.getElementById('globalSearch');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                this.searchQuery = '';
                searchInput.blur();
                const clearBtn = searchInput.parentElement?.querySelector('.search-clear-btn');
                clearBtn?.classList.remove('visible');
                this.renderBoard();
            }
        }
    }

    showSearchResultCount() {
        if (!this.currentBoard) return;

        let totalTasks = 0;
        let matchedTasks = 0;

        this.currentBoard.columns.forEach(column => {
            const allTasks = column.taskIds
                .map(id => this.storage.getTask(id))
                .filter(task => task !== undefined);
            totalTasks += allTasks.length;

            const filtered = this.getFilteredTasks(column.taskIds);
            matchedTasks += filtered.length;
        });

        if (this.searchQuery && matchedTasks < totalTasks) {
            Toast.info(`Found ${matchedTasks} of ${totalTasks} tasks`);

            setTimeout(() => {
                const firstMatch = document.querySelector('.search-match-found');
                if (firstMatch) {
                    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }

    loadBoards() {
        const boards = this.storage.getBoards();
        const boardList = document.getElementById('boardList');
        if (!boardList) return;

        boardList.innerHTML = '';
        boards.forEach(boardData => {
            const board = new Board(boardData);
            const item = this.createBoardListItem(board);
            boardList.appendChild(item);
        });
    }

    createBoardListItem(board) {
        const item = document.createElement('div');
        item.className = 'board-item';
        if (this.currentBoard?.id === board.id) {
            item.classList.add('active');
        }

        const taskCount = board.getTaskCount();

        item.innerHTML = `
            <div class="board-color" style="background: ${board.color}"></div>
            <div class="board-name">${board.title}</div>
            <div class="board-actions">
                <span class="board-count">${taskCount}</span>
                <button class="board-menu-btn" data-board-id="${board.id}" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        `;

        return item;
    }

    showBoardMenu(buttonElement, boardId) {
        const board = this.storage.getBoard(boardId);
        if (!board) {
            console.error('Board not found:', boardId);
            return;
        }

        console.log('Showing board menu for', boardId);

        const rect = buttonElement.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'board-context-menu';
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left - 140}px`;
        menu.style.zIndex = '10000';

        menu.innerHTML = `
            <button class="context-menu-item" data-action="edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Board
            </button>
            <button class="context-menu-item" data-action="duplicate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Duplicate Board
            </button>
            <div class="context-menu-divider"></div>
            <button class="context-menu-item danger" data-action="delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Board
            </button>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'edit') {
                this.showEditBoardModal(boardId);
            } else if (action === 'duplicate') {
                this.duplicateBoard(boardId);
            } else if (action === 'delete') {
                this.deleteBoard(boardId);
            }
            menu.remove();
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    showEditBoardModal(boardId) {
        const board = this.storage.getBoard(boardId);
        if (!board) return;

        Modal.showForm({
            title: 'Edit Board',
            fields: [
                {
                    name: 'title',
                    label: 'Board Title',
                    type: 'text',
                    value: board.title,
                    placeholder: 'Enter board title',
                    required: true
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    value: board.description,
                    placeholder: 'What is this board for?',
                    rows: 3
                },
                {
                    name: 'color',
                    label: 'Color',
                    type: 'color',
                    value: board.color
                }
            ],
            onSubmit: (data) => {
                this.storage.updateBoard(boardId, data);
                if (this.currentBoard?.id === boardId) {
                    this.currentBoard.title = data.title;
                    this.currentBoard.description = data.description;
                    this.currentBoard.color = data.color;
                    document.getElementById('boardTitle').textContent = data.title;
                    document.getElementById('boardDescription').textContent = data.description;
                }
                this.loadBoards();
                Toast.success('Board updated successfully');
            }
        });
    }

    duplicateBoard(boardId) {
        const board = this.storage.getBoard(boardId);
        if (!board) return;

        const newBoard = new Board({
            title: `${board.title} (Copy)`,
            description: board.description,
            color: board.color
        });

        newBoard.columns = board.columns.map(col => ({
            id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: col.title,
            taskIds: []
        }));

        this.storage.addBoard(newBoard.toJSON());
        this.loadBoards();
        this.loadBoard(newBoard.id);
        Toast.success('Board duplicated successfully');
    }

    deleteBoard(boardId) {
        const board = this.storage.getBoard(boardId);
        if (!board) return;

        const boards = this.storage.getBoards();
        if (boards.length === 1) {
            Toast.warning('Cannot delete the last board');
            return;
        }

        Modal.showConfirm(`Are you sure you want to delete board "${board.title}"? All tasks in this board will be deleted.`, {
            title: 'Delete Board',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                const boardObj = new Board(board);
                boardObj.columns.forEach(column => {
                    column.taskIds.forEach(taskId => {
                        this.storage.deleteTask(taskId);
                    });
                });

                this.storage.deleteBoard(boardId);

                if (this.currentBoard?.id === boardId) {
                    const remainingBoards = this.storage.getBoards();
                    if (remainingBoards.length > 0) {
                        this.loadBoard(remainingBoards[0].id);
                    } else {
                        this.currentBoard = null;
                        document.getElementById('kanbanBoard').innerHTML = '';
                        document.getElementById('emptyState')?.classList.remove('hidden');
                    }
                }

                this.loadBoards();
                this.updateStatistics();
                Toast.success('Board deleted successfully');
            }
        });
    }

    loadBoard(boardId) {
        const boardData = this.storage.getBoard(boardId);
        if (!boardData) return;

        this.currentBoard = new Board(boardData);
        document.getElementById('boardTitle').textContent = this.currentBoard.title;
        document.getElementById('boardDescription').textContent = this.currentBoard.description;

        document.querySelectorAll('.board-item').forEach(item => {
            item.classList.remove('active');
        });

        this.renderBoard();
        this.loadBoards();
    }

    renderBoard() {
        if (!this.currentBoard) return;

        const kanbanBoard = document.getElementById('kanbanBoard');
        const emptyState = document.getElementById('emptyState');
        emptyState?.classList.add('hidden');

        kanbanBoard.innerHTML = '';

        this.currentBoard.columns.forEach(column => {
            const columnEl = this.createColumnElement(column);
            kanbanBoard.appendChild(columnEl);
        });

        this.setupDragAndDrop();
    }

    createColumnElement(column) {
        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        columnEl.dataset.columnId = column.id;

        const tasks = this.getFilteredTasks(column.taskIds);

        columnEl.innerHTML = `
            <div class="column-header">
                <div class="column-title-wrapper">
                    <span class="column-title">${column.title}</span>
                    <span class="column-count">${tasks.length}</span>
                </div>
                <div class="column-actions">
                    <button class="column-action-btn" data-action="add-task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="task-list" data-column-id="${column.id}"></div>
            <button class="add-task-btn" data-column-id="${column.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Task
            </button>
        `;

        const taskList = columnEl.querySelector('.task-list');
        tasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            taskList.appendChild(taskCard);
        });

        columnEl.querySelector('[data-action="add-task"]').addEventListener('click', () => {
            this.showNewTaskModal(column.id);
        });

        columnEl.querySelector('.add-task-btn').addEventListener('click', () => {
            this.showNewTaskModal(column.id);
        });

        return columnEl;
    }

    getFilteredTasks(taskIds) {
        const tasks = taskIds
            .map(id => this.storage.getTask(id))
            .filter(task => task !== undefined)
            .map(taskData => new Task(taskData));

        return tasks.filter(task => {
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const matchTitle = task.title.toLowerCase().includes(query);
                const matchDesc = task.description.toLowerCase().includes(query);
                const matchTags = task.tags.some(tag => tag.toLowerCase().includes(query));
                if (!matchTitle && !matchDesc && !matchTags) return false;
            }

            switch (this.currentFilter) {
                case 'today':
                    return task.dueDate && isToday(task.dueDate);
                case 'week':
                    return task.dueDate !== null;
                case 'overdue':
                    return isOverdue(task.dueDate);
                default:
                    return true;
            }
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.taskId = task.id;

        const priorityClass = task.priority.toLowerCase();
        const progress = task.getSubtaskProgress();
        const dueClass = isOverdue(task.dueDate) ? 'overdue' : isToday(task.dueDate) ? 'today' : '';

        let isSearchMatch = false;
        let titleHTML = task.title;
        let descHTML = task.description;

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            const matchTitle = task.title.toLowerCase().includes(query);
            const matchDesc = task.description.toLowerCase().includes(query);
            const matchTags = task.tags.some(tag => tag.toLowerCase().includes(query));
            isSearchMatch = matchTitle || matchDesc || matchTags;

            if (isSearchMatch) {
                const regex = new RegExp(this.searchQuery, 'gi');
                titleHTML = task.title.replace(regex, '<mark>$&</mark>');
                descHTML = task.description.replace(regex, '<mark>$&</mark>');
                card.classList.add('search-match-found');
                setTimeout(() => card.classList.remove('search-match-found'), 1500);
            }
        }

        card.innerHTML = `
            <div class="task-header">
                <div class="task-priority-indicator ${priorityClass}"></div>
                <div class="task-title">${titleHTML}</div>
                <button class="task-menu-btn" data-task-id="${task.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
            ${task.description ? `<div class="task-description">${descHTML}</div>` : ''}
            ${task.tags.length > 0 ? `
                <div class="task-tags">
                    ${task.tags.map(tag => {
                        if (this.searchQuery && tag.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                            const regex = new RegExp(this.searchQuery, 'gi');
                            return `<span class="task-tag">${tag.replace(regex, '<mark>$&</mark>')}</span>`;
                        }
                        return `<span class="task-tag">${tag}</span>`;
                    }).join('')}
                </div>
            ` : ''}
            ${task.subtasks.length > 0 ? `
                <div class="task-progress">
                    <div class="task-progress-bar">
                        <div class="task-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="task-progress-text">${progress}% complete</div>
                </div>
            ` : ''}
            <div class="task-footer">
                ${task.dueDate ? `<div class="task-due-date ${dueClass}">${formatRelativeDate(task.dueDate)}</div>` : ''}
                <div class="task-meta">
                    ${task.subtasks.length > 0 ? `<span class="task-meta-item">✓ ${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length}</span>` : ''}
                    ${task.comments.length > 0 ? `<span class="task-meta-item">💬 ${task.comments.length}</span>` : ''}
                </div>
            </div>
        `;

        return card;
    }

    setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const taskLists = document.querySelectorAll('.task-list');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.dataset.taskId);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            let touchStartY = 0;
            let touchStartX = 0;
            let isDragging = false;

            card.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                isDragging = false;
            });

            card.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const touchX = e.touches[0].clientX;
                const deltaY = Math.abs(touchY - touchStartY);
                const deltaX = Math.abs(touchX - touchStartX);

                if (deltaY > 10 || deltaX > 10) {
                    isDragging = true;
                    card.classList.add('dragging');
                }
            });

            card.addEventListener('touchend', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    const touch = e.changedTouches[0];
                    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                    const targetList = elementBelow?.closest('.task-list');

                    if (targetList) {
                        const newColumnId = targetList.dataset.columnId;
                        const taskId = card.dataset.taskId;
                        this.moveTask(taskId, newColumnId);
                    }
                }
                card.classList.remove('dragging');
                isDragging = false;
            });
        });

        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const newColumnId = list.dataset.columnId;
                this.moveTask(taskId, newColumnId);
            });
        });
    }

    showTaskMenu(buttonElement, taskId) {
        const task = this.storage.getTask(taskId);
        if (!task) return;

        const rect = buttonElement.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'task-context-menu';
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left - 150}px`;
        menu.style.zIndex = '1000';

        const columns = this.currentBoard.columns;

        menu.innerHTML = `
            <div class="context-menu-section">
                <div class="context-menu-title">Move to</div>
                ${columns.map(col => `
                    <button class="context-menu-item" data-action="move" data-column-id="${col.id}">
                        ${col.title}
                    </button>
                `).join('')}
            </div>
            <div class="context-menu-divider"></div>
            <button class="context-menu-item" data-action="edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Task
            </button>
            <button class="context-menu-item danger" data-action="delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Task
            </button>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const columnId = e.target.closest('[data-column-id]')?.dataset.columnId;

            if (action === 'move' && columnId) {
                this.moveTask(taskId, columnId);
            } else if (action === 'edit') {
                this.showTaskDetailModal(taskId);
            } else if (action === 'delete') {
                this.deleteTask(taskId);
            }
            menu.remove();
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    moveTask(taskId, newColumnId) {
        const task = this.storage.getTask(taskId);
        if (!task) return;

        const oldColumnId = task.columnId;
        if (oldColumnId === newColumnId) return;

        const column = this.currentBoard.columns.find(col => col.id === newColumnId);
        let status = 'todo';
        if (column) {
            const title = column.title.toLowerCase();
            if (title.includes('done') || title.includes('complete')) {
                status = 'done';
            } else if (title.includes('review') || title.includes('testing')) {
                status = 'review';
            } else if (title.includes('progress') || title.includes('doing')) {
                status = 'inprogress';
            } else {
                status = 'todo';
            }
        }

        this.currentBoard.moveTask(taskId, oldColumnId, newColumnId);
        this.storage.updateBoard(this.currentBoard.id, this.currentBoard.toJSON());
        this.storage.updateTask(taskId, {
            columnId: newColumnId,
            status: status
        });

        this.renderBoard();
        this.updateStatistics();
        Toast.success('Task moved successfully');
    }

    deleteTask(taskId) {
        Modal.showConfirm('Are you sure you want to delete this task?', {
            title: 'Delete Task',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                const task = this.storage.getTask(taskId);
                if (!task) return;

                this.currentBoard.removeTaskFromColumn(task.columnId, taskId);
                this.storage.updateBoard(this.currentBoard.id, this.currentBoard.toJSON());
                this.storage.deleteTask(taskId);

                this.renderBoard();
                this.updateStatistics();
                Toast.success('Task deleted successfully');
            }
        });
    }

    showNewBoardModal() {
        Modal.showForm({
            title: 'Create New Board',
            fields: [
                {
                    name: 'title',
                    label: 'Board Title',
                    type: 'text',
                    placeholder: 'Enter board title',
                    required: true
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'What is this board for?',
                    rows: 3
                },
                {
                    name: 'color',
                    label: 'Color',
                    type: 'color',
                    value: '#3b82f6'
                }
            ],
            onSubmit: (data) => {
                const board = new Board(data);
                this.storage.addBoard(board.toJSON());
                this.loadBoards();
                this.loadBoard(board.id);
                Toast.success('Board created successfully');
            }
        });
    }

    showNewTaskModal(columnId = null) {
        if (!this.currentBoard) {
            Toast.warning('Please select a board first');
            return;
        }

        const targetColumnId = columnId || this.currentBoard.columns[0]?.id;

        Modal.showForm({
            title: 'Create New Task',
            fields: [
                {
                    name: 'title',
                    label: 'Task Title',
                    type: 'text',
                    placeholder: 'What needs to be done?',
                    required: true
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Add more details...',
                    rows: 4
                },
                {
                    name: 'priority',
                    label: 'Priority',
                    type: 'select',
                    value: 'Medium',
                    options: [
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' }
                    ]
                },
                {
                    name: 'dueDate',
                    label: 'Due Date',
                    type: 'date'
                }
            ],
            onSubmit: (data) => {
                const column = this.currentBoard.columns.find(col => col.id === targetColumnId);
                let status = 'todo';
                if (column) {
                    const title = column.title.toLowerCase();
                    if (title.includes('done') || title.includes('complete')) {
                        status = 'done';
                    } else if (title.includes('review') || title.includes('testing')) {
                        status = 'review';
                    } else if (title.includes('progress') || title.includes('doing')) {
                        status = 'inprogress';
                    } else {
                        status = 'todo';
                    }
                }

                const task = new Task({
                    ...data,
                    boardId: this.currentBoard.id,
                    columnId: targetColumnId,
                    status: status
                });

                this.storage.addTask(task.toJSON());
                this.currentBoard.addTaskToColumn(targetColumnId, task.id);
                this.storage.updateBoard(this.currentBoard.id, this.currentBoard.toJSON());

                this.renderBoard();
                this.updateStatistics();
                Toast.success('Task created successfully');
            }
        });
    }

    showTaskDetailModal(taskId) {
        const taskData = this.storage.getTask(taskId);
        if (!taskData) return;

        const task = new Task(taskData);

        Modal.showForm({
            title: 'Edit Task',
            fields: [
                {
                    name: 'title',
                    label: 'Task Title',
                    type: 'text',
                    value: task.title,
                    placeholder: 'What needs to be done?',
                    required: true
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    value: task.description,
                    placeholder: 'Add more details...',
                    rows: 4
                },
                {
                    name: 'priority',
                    label: 'Priority',
                    type: 'select',
                    value: task.priority,
                    options: [
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' }
                    ]
                },
                {
                    name: 'dueDate',
                    label: 'Due Date',
                    type: 'date',
                    value: task.dueDate || ''
                },
                {
                    name: 'tags',
                    label: 'Tags (comma separated)',
                    type: 'text',
                    value: task.tags.join(', '),
                    placeholder: 'e.g. urgent, bug, feature'
                }
            ],
            onSubmit: (data) => {
                const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

                this.storage.updateTask(taskId, {
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    dueDate: data.dueDate || null,
                    tags: tags,
                    updatedAt: new Date().toISOString()
                });

                this.renderBoard();
                this.updateStatistics();
                Toast.success('Task updated successfully');
            }
        });
    }

    showAddColumnModal() {
        Toast.info('Add column - Coming soon!');
    }

    showAIGenerateBoardModal() {
        Toast.info('AI board generation - Coming soon!');
    }

    showSettingsModal() {
        Toast.info('Settings modal - Coming soon!');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.filter === filter) {
                item.classList.add('active');
            }
        });
        this.renderBoard();
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            this.storage.updateSettings({ darkMode: false });
            Toast.success('Light mode enabled');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            this.storage.updateSettings({ darkMode: true });
            Toast.success('Dark mode enabled');
        }
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeBtn = document.getElementById('themeToggle');
        if (!themeBtn) return;

        const isDark = document.body.classList.contains('dark-theme');
        themeBtn.innerHTML = isDark
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>`;
    }

    toggleAIChat() {
        document.getElementById('aiChatPanel')?.classList.toggle('hidden');
    }

    updateStatistics() {
        const tasks = this.storage.getTasks();

        const getTaskStatus = (task) => {
            if (task.status) return task.status;

            let board = this.currentBoard;
            if (!board && task.boardId) {
                const boardData = this.storage.getBoard(task.boardId);
                if (boardData) board = new Board(boardData);
            }

            if (board) {
                const column = board.columns.find(col => col.id === task.columnId);
                if (column) {
                    const title = column.title.toLowerCase();
                    if (title.includes('done') || title.includes('complete')) return 'done';
                    if (title.includes('review') || title.includes('testing')) return 'review';
                    if (title.includes('progress') || title.includes('doing')) return 'inprogress';
                    return 'todo';
                }
            }
            return 'todo';
        };

        const completed = tasks.filter(t => getTaskStatus(t) === 'done').length;
        const inProgress = tasks.filter(t => {
            const status = getTaskStatus(t);
            return status === 'inprogress' || status === 'review';
        }).length;

        document.getElementById('statTotal').textContent = tasks.length;
        document.getElementById('statCompleted').textContent = completed;
        document.getElementById('statInProgress').textContent = inProgress;

        const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = progress;

        const overdue = tasks.filter(t => isOverdue(t.dueDate)).length;
        const today = tasks.filter(t => isToday(t.dueDate)).length;

        document.getElementById('countAll').textContent = tasks.length;
        document.getElementById('countToday').textContent = today;
        document.getElementById('countOverdue').textContent = overdue;

        const weekCount = tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            return dueDate >= today && dueDate <= nextWeek;
        }).length;

        const weekElement = document.getElementById('countWeek');
        if (weekElement) {
            weekElement.textContent = weekCount;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;
