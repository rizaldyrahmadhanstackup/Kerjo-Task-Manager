const CONFIG = {
    APPNAME: 'Kerjo',                    // ← UBAH INI
    VERSION: '1.0.0',
    STORAGEKEY: 'kerjoappdata',          // ← UBAH INI
    AICACHEKEY: 'kerjoaicache',          // ← UBAH INI
    OPENAI: {
        APIURL: 'https://api.openai.com/v1/chat/completions',
        MODEL: 'gpt-3.5-turbo',
        MAXTOKENS: 1000,
        TEMPERATURE: 0.7
    },
    
    LIMITS: {
        MAX_BOARDS: 50,
        MAX_TASKS_PER_BOARD: 500,
        MAX_COLUMNS_PER_BOARD: 10,
        AI_REQUESTS_PER_MINUTE: 10,
        CACHE_DURATION_MS: 24 * 60 * 60 * 1000
    },
    
    DEFAULT_COLUMNS: [
        { id: 'col-1', title: 'To Do', color: '#6b7280' },
        { id: 'col-2', title: 'In Progress', color: '#3b82f6' },
        { id: 'col-3', title: 'Review', color: '#f59e0b' },
        { id: 'col-4', title: 'Done', color: '#10b981' }
    ],
    
    PRIORITY_LEVELS: {
        HIGH: 'High',
        MEDIUM: 'Medium',
        LOW: 'Low'
    },
    
    BOARD_TEMPLATES: {
        PERSONAL: {
            name: 'Personal Projects',
            description: 'Track your personal tasks and side projects',
            color: '#3b82f6'
        },
        WORK: {
            name: 'Work Tasks',
            description: 'Manage your professional workload',
            color: '#10b981'
        },
        LEARNING: {
            name: 'Learning Goals',
            description: 'Track courses, tutorials, and skills',
            color: '#f59e0b'
        },
        SIDE_PROJECT: {
            name: 'Side Project',
            description: 'Build something awesome',
            color: '#ef4444'
        }
    },
    
    KEYBOARD_SHORTCUTS: {
        NEW_TASK: 'n',
        SEARCH: '/',
        AI_CHAT: 'a',
        ESCAPE: 'Escape'
    },
    
    ANIMATIONS: {
        TOAST_DURATION: 3000,
        MODAL_TRANSITION: 300,
        AUTO_SAVE_DELAY: 1000
    }
};

export default CONFIG;
