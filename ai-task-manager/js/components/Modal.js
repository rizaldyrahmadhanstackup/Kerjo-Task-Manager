import CONFIG from '../config.js';

class Modal {
    constructor() {
        this.container = document.getElementById('modalContainer');
        this.activeModal = null;
    }

    show(content, options = {}) {
        const {
            title = 'Modal',
            size = 'medium',
            onClose = null,
            showCloseButton = true,
            closeOnBackdrop = true
        } = options;

        this.hide();

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2 class="modal-title">${title}</h2>
            ${showCloseButton ? `
                <button class="modal-close" data-action="close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        modal.appendChild(header);
        modal.appendChild(body);
        backdrop.appendChild(modal);

        if (closeOnBackdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.hide();
                    if (onClose) onClose();
                }
            });
        }

        if (showCloseButton) {
            const closeBtn = header.querySelector('[data-action="close"]');
            closeBtn.addEventListener('click', () => {
                this.hide();
                if (onClose) onClose();
            });
        }

        this.container.appendChild(backdrop);
        this.activeModal = { backdrop, modal, onClose };

        setTimeout(() => backdrop.classList.add('fade-in'), 10);

        document.addEventListener('keydown', this.handleEscape);

        return { backdrop, modal, body };
    }

    showForm(options = {}) {
        const {
            title = 'Form',
            fields = [],
            onSubmit = null,
            submitText = 'Submit',
            cancelText = 'Cancel'
        } = options;

        const form = document.createElement('form');
        form.className = 'modal-form';

        fields.forEach(field => {
            const group = document.createElement('div');
            group.className = 'form-group';

            if (field.label) {
                const label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = field.label;
                label.htmlFor = field.name;
                group.appendChild(label);
            }

            let input;
            
            switch (field.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.className = 'form-textarea';
                    input.rows = field.rows || 4;
                    break;
                
                case 'select':
                    input = document.createElement('select');
                    input.className = 'form-select';
                    field.options?.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt.value;
                        option.textContent = opt.label;
                        if (opt.value === field.value) option.selected = true;
                        input.appendChild(option);
                    });
                    break;
                
                default:
                    input = document.createElement('input');
                    input.className = 'form-input';
                    input.type = field.type || 'text';
            }

            input.name = field.name;
            input.id = field.name;
            input.placeholder = field.placeholder || '';
            input.value = field.value || '';
            input.required = field.required || false;

            group.appendChild(input);
            form.appendChild(group);
        });

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button type="button" class="btn-secondary" data-action="cancel">${cancelText}</button>
            <button type="submit" class="btn-primary">${submitText}</button>
        `;

        form.appendChild(footer);

        const { backdrop, modal, body } = this.show(form, { title, showCloseButton: true });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            if (onSubmit) {
                onSubmit(data);
            }
            
            this.hide();
        });

        footer.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.hide();
        });

        return { backdrop, modal, body, form };
    }

    showConfirm(message, options = {}) {
        const {
            title = 'Confirm',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning',
            onConfirm = null,
            onCancel = null
        } = options;

        const content = document.createElement('div');
        content.className = 'modal-confirm';
        
        const icon = {
            warning: '⚠️',
            danger: '🗑️',
            info: 'ℹ️',
            success: '✓'
        }[type] || 'ℹ️';

        content.innerHTML = `
            <div class="confirm-icon">${icon}</div>
            <p class="confirm-message">${message}</p>
        `;

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-secondary" data-action="cancel">${cancelText}</button>
            <button class="btn-${type === 'danger' ? 'danger' : 'primary'}" data-action="confirm">${confirmText}</button>
        `;

        content.appendChild(footer);

        const { backdrop, modal } = this.show(content, { 
            title, 
            size: 'small',
            showCloseButton: false,
            closeOnBackdrop: false
        });

        footer.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            this.hide();
            if (onConfirm) onConfirm();
        });

        footer.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.hide();
            if (onCancel) onCancel();
        });

        return { backdrop, modal };
    }

    hide() {
        if (this.activeModal) {
            const { backdrop, onClose } = this.activeModal;
            backdrop.style.opacity = '0';
            
            setTimeout(() => {
                backdrop.remove();
                this.activeModal = null;
            }, CONFIG.ANIMATIONS.MODAL_TRANSITION);
        }

        document.removeEventListener('keydown', this.handleEscape);
    }

    handleEscape = (e) => {
        if (e.key === 'Escape' || e.key === CONFIG.KEYBOARD_SHORTCUTS.ESCAPE) {
            this.hide();
            if (this.activeModal?.onClose) {
                this.activeModal.onClose();
            }
        }
    }

    isOpen() {
        return this.activeModal !== null;
    }
}

const modalInstance = new Modal();
window.modalInstance = modalInstance;

export default modalInstance;
