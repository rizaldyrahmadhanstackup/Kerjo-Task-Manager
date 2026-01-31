/**
 * Storage Module - LocalStorage Management
 * Handles all data persistence for Nexora
 */

class Storage {
    constructor() {
        this.STORAGE_KEYS = {
            BOARDS: 'nexora_boards',
            TASKS: 'nexora_tasks',
            SETTINGS: 'nexora_settings'
        };
        this.init();
    }

    init() {
        // Initialize default settings if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
            this.updateSettings({
                darkMode: true,
                language: 'en',
                openaiApiKey: '',
                notifications: true,
                autoSave: true
            });
        }

        // Migrate old data if needed
        this.migrateData();
    }

    migrateData() {
        // Check if migration is needed
        const version = localStorage.getItem('nexora_version');
        if (!version) {
            // First time setup or old version
            localStorage.setItem('nexora_version', '1.0.0');
        }
    }

    // ========================================
    // BOARDS METHODS
    // ========================================

    /**
     * Get all boards
     * @returns {Array} Array of board objects
     */
    getBoards() {
        try {
            const boards = localStorage.getItem(this.STORAGE_KEYS.BOARDS);
            return boards ? JSON.parse(boards) : [];
        } catch (error) {
            console.error('Error getting boards:', error);
            return [];
        }
    }

    /**
     * Get a single board by ID
     * @param {string} boardId - Board ID
     * @returns {Object|undefined} Board object or undefined
     */
    getBoard(boardId) {
        const boards = this.getBoards();
        return boards.find(board => board.id === boardId);
    }

    /**
     * Add a new board
     * @param {Object} board - Board object
     */
    addBoard(board) {
        try {
            const boards = this.getBoards();
            boards.push(board);
            localStorage.setItem(this.STORAGE_KEYS.BOARDS, JSON.stringify(boards));
            return true;
        } catch (error) {
            console.error('Error adding board:', error);
            return false;
        }
    }

    /**
     * Update an existing board
     * @param {string} boardId - Board ID
     * @param {Object} updates - Object with fields to update
     */
    updateBoard(boardId, updates) {
        try {
            const boards = this.getBoards();
            const index = boards.findIndex(board => board.id === boardId);
            
            if (index !== -1) {
                boards[index] = { ...boards[index], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem(this.STORAGE_KEYS.BOARDS, JSON.stringify(boards));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating board:', error);
            return false;
        }
    }

    /**
     * Delete a board
     * @param {string} boardId - Board ID
     */
    deleteBoard(boardId) {
        try {
            const boards = this.getBoards();
            const filteredBoards = boards.filter(board => board.id !== boardId);
            localStorage.setItem(this.STORAGE_KEYS.BOARDS, JSON.stringify(filteredBoards));
            return true;
        } catch (error) {
            console.error('Error deleting board:', error);
            return false;
        }
    }

    // ========================================
    // TASKS METHODS
    // ========================================

    /**
     * Get all tasks
     * @returns {Array} Array of task objects
     */
    getTasks() {
        try {
            const tasks = localStorage.getItem(this.STORAGE_KEYS.TASKS);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    }

    /**
     * Get a single task by ID
     * @param {string} taskId - Task ID
     * @returns {Object|undefined} Task object or undefined
     */
    getTask(taskId) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === taskId);
    }

    /**
     * Get tasks by board ID
     * @param {string} boardId - Board ID
     * @returns {Array} Array of tasks
     */
    getTasksByBoard(boardId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.boardId === boardId);
    }

    /**
     * Get tasks by column ID
     * @param {string} columnId - Column ID
     * @returns {Array} Array of tasks
     */
    getTasksByColumn(columnId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.columnId === columnId);
    }

    /**
     * Add a new task
     * @param {Object} task - Task object
     */
    addTask(task) {
        try {
            const tasks = this.getTasks();
            tasks.push(task);
            localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error adding task:', error);
            return false;
        }
    }

    /**
     * Update an existing task
     * @param {string} taskId - Task ID
     * @param {Object} updates - Object with fields to update
     */
    updateTask(taskId, updates) {
        try {
            const tasks = this.getTasks();
            const index = tasks.findIndex(task => task.id === taskId);
            
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }

    /**
     * Delete a task
     * @param {string} taskId - Task ID
     */
    deleteTask(taskId) {
        try {
            const tasks = this.getTasks();
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    /**
     * Delete all tasks in a board
     * @param {string} boardId - Board ID
     */
    deleteTasksByBoard(boardId) {
        try {
            const tasks = this.getTasks();
            const filteredTasks = tasks.filter(task => task.boardId !== boardId);
            localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
            return true;
        } catch (error) {
            console.error('Error deleting tasks by board:', error);
            return false;
        }
    }

    // ========================================
    // SETTINGS METHODS
    // ========================================

    /**
     * Get all settings
     * @returns {Object} Settings object
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    /**
     * Update settings
     * @param {Object} updates - Object with settings to update
     */
    updateSettings(updates) {
        try {
            const settings = this.getSettings();
            const newSettings = { ...settings, ...updates };
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
            return true;
        } catch (error) {
            console.error('Error updating settings:', error);
            return false;
        }
    }

    /**
     * Reset settings to default
     */
    resetSettings() {
        try {
            const defaultSettings = {
                darkMode: true,
                language: 'en',
                openaiApiKey: '',
                notifications: true,
                autoSave: true
            };
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
            return true;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Export all data as JSON
     * @returns {Object} All data
     */
    exportData() {
        return {
            boards: this.getBoards(),
            tasks: this.getTasks(),
            settings: this.getSettings(),
            version: '1.0.0',
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data - Data object
     */
    importData(data) {
        try {
            if (data.boards) {
                localStorage.setItem(this.STORAGE_KEYS.BOARDS, JSON.stringify(data.boards));
            }
            if (data.tasks) {
                localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
            }
            if (data.settings) {
                localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            localStorage.removeItem('nexora_version');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    /**
     * Get storage usage info
     * @returns {Object} Storage info
     */
    getStorageInfo() {
        try {
            const boards = localStorage.getItem(this.STORAGE_KEYS.BOARDS) || '[]';
            const tasks = localStorage.getItem(this.STORAGE_KEYS.TASKS) || '[]';
            const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS) || '{}';

            const boardsSize = new Blob([boards]).size;
            const tasksSize = new Blob([tasks]).size;
            const settingsSize = new Blob([settings]).size;
            const totalSize = boardsSize + tasksSize + settingsSize;

            return {
                boards: {
                    count: JSON.parse(boards).length,
                    size: this.formatBytes(boardsSize)
                },
                tasks: {
                    count: JSON.parse(tasks).length,
                    size: this.formatBytes(tasksSize)
                },
                settings: {
                    size: this.formatBytes(settingsSize)
                },
                total: {
                    size: this.formatBytes(totalSize),
                    bytes: totalSize
                }
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    /**
     * Format bytes to human readable
     * @param {number} bytes - Bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Check if storage is available
     * @returns {boolean} True if available
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Backup data to file
     * @returns {string} JSON string
     */
    createBackup() {
        const data = this.exportData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Restore data from backup
     * @param {string} jsonString - JSON string
     */
    restoreBackup(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.importData(data);
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }
}

// Export as singleton
export default new Storage();
