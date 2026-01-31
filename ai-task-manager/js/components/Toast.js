import CONFIG from '../config.js';
import { sanitizeHTML } from '../utils/helpers.js';

class Toast {
    constructor() {
        this.toasts = new Map();
        this.maxToasts = 5;
    }

    getContainer() {
        // Selalu cari container dari DOM
        let container = document.getElementById('notification-container');
        
        // Kalau tidak ada, buat baru
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        return container;
    }

    show(message, type = 'info', duration = CONFIG.ANIMATIONS.TOAST_DURATION) {
        // Limit max toasts
        if (this.toasts.size >= this.maxToasts) {
            const oldest = this.toasts.keys().next().value;
            this.hide(oldest);
        }

        const id = `toast-${Date.now()}`;
        const toast = this.create(message, type, id);
        
        // Get container setiap kali show
        const container = this.getContainer();
        container.appendChild(toast);
        
        this.toasts.set(id, toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(id), duration);
        }

        return id;
    }

    create(message, type, id) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.id = id;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const iconSpan = document.createElement('div');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = icons[type] || icons.info;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'toast-content';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'toast-message';
        messageDiv.textContent = message;

        contentDiv.appendChild(messageDiv);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.onclick = () => this.hide(id);
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;

        toast.appendChild(iconSpan);
        toast.appendChild(contentDiv);
        toast.appendChild(closeBtn);

        return toast;
    }

    hide(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
            this.toasts.delete(id);
        }, 300);
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    warning(message) {
        return this.show(message, 'warning');
    }

    info(message) {
        return this.show(message, 'info');
    }

    clear() {
        this.toasts.forEach((_, id) => this.hide(id));
    }
}

const toastInstance = new Toast();
window.toastInstance = toastInstance;

export default toastInstance;
