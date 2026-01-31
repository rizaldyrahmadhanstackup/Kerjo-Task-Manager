export const generateId = (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

export const formatRelativeDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const target = new Date(date);
    
    if (isNaN(target.getTime())) return '';
    
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    
    return formatDate(date);
};

export const isOverdue = (date) => {
    if (!date) return false;
    const now = new Date();
    const target = new Date(date);
    
    if (isNaN(target.getTime())) return false;
    
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    return targetDay < nowDay;
};

export const isToday = (date) => {
    if (!date) return false;
    const now = new Date();
    const target = new Date(date);
    
    if (isNaN(target.getTime())) return false;
    
    return now.toDateString() === target.toDateString();
};

export const isThisWeek = (date) => {
    if (!date) return false;
    const now = new Date();
    const target = new Date(date);
    
    if (isNaN(target.getTime())) return false;
    
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(nowDay);
    weekStart.setDate(nowDay.getDate() - nowDay.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return target >= weekStart && target <= weekEnd;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const sanitizeHTML = (str) => {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

export const truncate = (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
};

export const copyToClipboard = async (text) => {
    if (!text) return false;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (err) {
                textArea.remove();
                return false;
            }
        }
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

export const downloadJSON = (data, filename) => {
    if (!data || !filename) return false;
    
    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error('Failed to download:', err);
        return false;
    }
};

export const parseJSON = (str) => {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON parse error:', e);
        return null;
    }
};

export const calculateProgress = (total, completed) => {
    if (total === 0 || !total) return 0;
    if (completed > total) return 100;
    return Math.round((completed / total) * 100);
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const isDarkMode = () => {
    return document.body.classList.contains('dark-theme');
};

export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
