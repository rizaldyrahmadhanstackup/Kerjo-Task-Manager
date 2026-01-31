import { generateId } from '../utils/helpers.js';
import CONFIG from '../config.js';

export default class Task {
    constructor(data = {}) {
        this.id = data.id || generateId('task');
        this.boardId = data.boardId;
        this.columnId = data.columnId;
        this.title = data.title || 'Untitled Task';
        this.description = data.description || '';
        this.priority = data.priority || CONFIG.PRIORITY_LEVELS.MEDIUM;
        this.status = data.status || 'todo';
        this.dueDate = data.dueDate || null;
        this.estimatedTime = data.estimatedTime || 0;
        this.actualTime = data.actualTime || 0;
        this.tags = data.tags || [];
        this.subtasks = data.subtasks || [];
        this.dependencies = data.dependencies || [];
        this.attachments = data.attachments || [];
        this.aiGenerated = data.aiGenerated || false;
        this.aiSuggestions = data.aiSuggestions || [];
        this.comments = data.comments || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.completedAt = data.completedAt || null;
    }

    addSubtask(title) {
        const subtask = {
            id: generateId('subtask'),
            title,
            completed: false
        };

        this.subtasks.push(subtask);
        this.updatedAt = new Date().toISOString();
        return subtask;
    }

    toggleSubtask(subtaskId) {
        const subtask = this.subtasks.find(st => st.id === subtaskId);
        if (!subtask) return false;

        subtask.completed = !subtask.completed;
        this.updatedAt = new Date().toISOString();
        return true;
    }

    deleteSubtask(subtaskId) {
        this.subtasks = this.subtasks.filter(st => st.id !== subtaskId);
        this.updatedAt = new Date().toISOString();
        return true;
    }

    getSubtaskProgress() {
        if (this.subtasks.length === 0) return 0;
        const completed = this.subtasks.filter(st => st.completed).length;
        return Math.round((completed / this.subtasks.length) * 100);
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date().toISOString();
        }
        return true;
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date().toISOString();
        return true;
    }

    addAttachment(type, url, title) {
        const attachment = {
            id: generateId('attach'),
            type,
            url,
            title: title || url,
            addedAt: new Date().toISOString()
        };

        this.attachments.push(attachment);
        this.updatedAt = new Date().toISOString();
        return attachment;
    }

    removeAttachment(attachmentId) {
        this.attachments = this.attachments.filter(att => att.id !== attachmentId);
        this.updatedAt = new Date().toISOString();
        return true;
    }

    addComment(text) {
        const comment = {
            id: generateId('comment'),
            text,
            createdAt: new Date().toISOString()
        };

        this.comments.push(comment);
        this.updatedAt = new Date().toISOString();
        return comment;
    }

    deleteComment(commentId) {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.updatedAt = new Date().toISOString();
        return true;
    }

    addAISuggestion(suggestion) {
        this.aiSuggestions.push(suggestion);
        this.updatedAt = new Date().toISOString();
    }

    clearAISuggestions() {
        this.aiSuggestions = [];
        this.updatedAt = new Date().toISOString();
    }

    markComplete() {
        this.status = 'done';
        this.completedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    markIncomplete() {
        this.status = 'todo';
        this.completedAt = null;
        this.updatedAt = new Date().toISOString();
    }

    setPriority(priority) {
        const validPriorities = Object.values(CONFIG.PRIORITY_LEVELS);
        if (!validPriorities.includes(priority)) {
            throw new Error('Invalid priority level');
        }

        this.priority = priority;
        this.updatedAt = new Date().toISOString();
    }

    isOverdue() {
        if (!this.dueDate || this.status === 'done') return false;
        return new Date(this.dueDate) < new Date();
    }

    getDaysUntilDue() {
        if (!this.dueDate) return null;
        const now = new Date();
        const due = new Date(this.dueDate);
        const diffTime = due - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    toJSON() {
        return {
            id: this.id,
            boardId: this.boardId,
            columnId: this.columnId,
            title: this.title,
            description: this.description,
            priority: this.priority,
            status: this.status,
            dueDate: this.dueDate,
            estimatedTime: this.estimatedTime,
            actualTime: this.actualTime,
            tags: this.tags,
            subtasks: this.subtasks,
            dependencies: this.dependencies,
            attachments: this.attachments,
            aiGenerated: this.aiGenerated,
            aiSuggestions: this.aiSuggestions,
            comments: this.comments,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt
        };
    }
}
