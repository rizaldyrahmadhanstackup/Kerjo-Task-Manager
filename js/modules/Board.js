import { generateId } from '../utils/helpers.js';
import CONFIG from '../config.js';

export default class Board {
    constructor(data = {}) {
        this.id = data.id || generateId('board');
        this.title = data.title || 'Untitled Board';
        this.description = data.description || '';
        this.color = data.color || '#3b82f6';
        this.columns = data.columns || this.getDefaultColumns();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    getDefaultColumns() {
        return CONFIG.DEFAULT_COLUMNS.map(col => ({
            id: generateId('col'),
            title: col.title,
            color: col.color,
            taskIds: []
        }));
    }

    addColumn(title, color = '#6b7280') {
        if (this.columns.length >= CONFIG.LIMITS.MAX_COLUMNS_PER_BOARD) {
            throw new Error(`Maximum ${CONFIG.LIMITS.MAX_COLUMNS_PER_BOARD} columns allowed`);
        }

        const column = {
            id: generateId('col'),
            title,
            color,
            taskIds: []
        };

        this.columns.push(column);
        this.updatedAt = new Date().toISOString();
        return column;
    }

    updateColumn(columnId, updates) {
        const columnIndex = this.columns.findIndex(col => col.id === columnId);
        if (columnIndex === -1) return false;

        this.columns[columnIndex] = {
            ...this.columns[columnIndex],
            ...updates
        };

        this.updatedAt = new Date().toISOString();
        return true;
    }

    deleteColumn(columnId) {
        const column = this.columns.find(col => col.id === columnId);
        if (!column) return false;

        const taskIds = [...column.taskIds];
        this.columns = this.columns.filter(col => col.id !== columnId);
        this.updatedAt = new Date().toISOString();

        return { success: true, taskIds };
    }

    getColumn(columnId) {
        return this.columns.find(col => col.id === columnId);
    }

    addTaskToColumn(columnId, taskId) {
        const column = this.getColumn(columnId);
        if (!column) return false;

        if (!column.taskIds.includes(taskId)) {
            column.taskIds.push(taskId);
            this.updatedAt = new Date().toISOString();
        }

        return true;
    }

    removeTaskFromColumn(columnId, taskId) {
        const column = this.getColumn(columnId);
        if (!column) return false;

        column.taskIds = column.taskIds.filter(id => id !== taskId);
        this.updatedAt = new Date().toISOString();
        return true;
    }

    moveTask(taskId, fromColumnId, toColumnId, newIndex = null) {
        this.removeTaskFromColumn(fromColumnId, taskId);
        
        const toColumn = this.getColumn(toColumnId);
        if (!toColumn) return false;

        if (newIndex !== null && newIndex >= 0) {
            toColumn.taskIds.splice(newIndex, 0, taskId);
        } else {
            toColumn.taskIds.push(taskId);
        }

        this.updatedAt = new Date().toISOString();
        return true;
    }

    reorderTask(columnId, taskId, newIndex) {
        const column = this.getColumn(columnId);
        if (!column) return false;

        const oldIndex = column.taskIds.indexOf(taskId);
        if (oldIndex === -1) return false;

        column.taskIds.splice(oldIndex, 1);
        column.taskIds.splice(newIndex, 0, taskId);

        this.updatedAt = new Date().toISOString();
        return true;
    }

    getTaskCount() {
        return this.columns.reduce((total, col) => total + col.taskIds.length, 0);
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            color: this.color,
            columns: this.columns,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromTemplate(templateName) {
        const template = CONFIG.BOARD_TEMPLATES[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }

        return new Board({
            title: template.name,
            description: template.description,
            color: template.color
        });
    }
}
