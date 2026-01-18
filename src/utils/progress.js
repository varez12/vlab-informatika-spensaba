// ============================================================
// V-LAB PROGRESS TRACKING UTILITY
// Menyimpan progress siswa di localStorage
// ============================================================

const STORAGE_KEY = 'vlab_progress';

/**
 * Get all progress data from localStorage
 */
export const getProgress = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

/**
 * Save progress data to localStorage
 */
export const saveProgress = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save progress:', e);
    }
};

/**
 * Get progress for a specific module
 */
export const getModuleProgress = (moduleId) => {
    const progress = getProgress();
    return progress[moduleId] || {};
};

/**
 * Update progress for a specific module
 */
export const updateModuleProgress = (moduleId, updates) => {
    const progress = getProgress();
    progress[moduleId] = {
        ...progress[moduleId],
        ...updates,
        lastUpdated: new Date().toISOString()
    };
    saveProgress(progress);
    return progress[moduleId];
};

/**
 * Mark a function/feature as completed
 */
export const markCompleted = (moduleId, featureId) => {
    const moduleProgress = getModuleProgress(moduleId);
    const completed = moduleProgress.completed || [];

    if (!completed.includes(featureId)) {
        completed.push(featureId);
        updateModuleProgress(moduleId, { completed });
    }

    return completed;
};

/**
 * Check if a function/feature is completed
 */
export const isCompleted = (moduleId, featureId) => {
    const moduleProgress = getModuleProgress(moduleId);
    const completed = moduleProgress.completed || [];
    return completed.includes(featureId);
};

/**
 * Get completion count for a module
 */
export const getCompletionCount = (moduleId) => {
    const moduleProgress = getModuleProgress(moduleId);
    return (moduleProgress.completed || []).length;
};

/**
 * Increment simulation run count
 */
export const incrementSimulationCount = (moduleId) => {
    const moduleProgress = getModuleProgress(moduleId);
    const count = (moduleProgress.simulationsRun || 0) + 1;
    updateModuleProgress(moduleId, { simulationsRun: count });
    return count;
};

/**
 * Save user preferences for a module
 */
export const savePreferences = (moduleId, prefs) => {
    updateModuleProgress(moduleId, { preferences: prefs });
};

/**
 * Get user preferences for a module
 */
export const getPreferences = (moduleId) => {
    const moduleProgress = getModuleProgress(moduleId);
    return moduleProgress.preferences || {};
};

// ============================================================
// MODULE NAVIGATION HELPERS
// ============================================================

export const moduleGroups = {
    'excel-formula': {
        title: 'Excel Formula',
        modules: [
            { path: '/excel', name: 'Lookup & Reference', features: ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'] },
            { path: '/excel-basic', name: 'Formula Dasar', features: ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'] },
            { path: '/excel-text', name: 'Fungsi Teks', features: ['LEFT', 'RIGHT', 'MID', 'LEN', 'UPPER', 'LOWER'] },
            { path: '/excel-chart', name: 'Grafik & Chart' },
            { path: '/excel-sort', name: 'Sort & Filter' }
        ]
    },
    'number-conversion': {
        title: 'Konversi Bilangan',
        modules: [
            { path: '/biner', name: 'Biner (Base 2)' },
            { path: '/oktal', name: 'Oktal (Base 8)' },
            { path: '/heksadesimal', name: 'Heksadesimal (Base 16)' }
        ]
    },
    'word-processing': {
        title: 'Pengolah Kata',
        modules: [
            { path: '/mailmerge', name: 'Mail Merge' },
            { path: '/word-paragraph', name: 'Format Paragraf' },
            { path: '/word-layout', name: 'Page Layout' },
            { path: '/word-tabulator', name: 'Tabulator' }
        ]
    },
    'system': {
        title: 'Sistem Komputer',
        modules: [
            { path: '/hardware', name: 'Hardware 3D' },
            { path: '/gerbang-logika', name: 'Gerbang Logika' },
            { path: '/pemrosesan-data', name: 'CPU Simulation' },
            { path: '/pengalamatan-memori', name: 'Memory Addressing' },
            { path: '/explorer', name: 'File Explorer' }
        ]
    },
    'programming': {
        title: 'Pemrograman',
        modules: [
            { path: '/blockly', name: 'Blockly IoT' },
            { path: '/blockly-maze', name: 'Blockly Game' }
        ]
    }
};

/**
 * Find the group and module info for a given path
 */
export const findModuleInfo = (path) => {
    for (const [groupId, group] of Object.entries(moduleGroups)) {
        const moduleIndex = group.modules.findIndex(m => m.path === path);
        if (moduleIndex !== -1) {
            return {
                groupId,
                groupTitle: group.title,
                module: group.modules[moduleIndex],
                moduleIndex,
                totalModules: group.modules.length,
                prevModule: moduleIndex > 0 ? group.modules[moduleIndex - 1] : null,
                nextModule: moduleIndex < group.modules.length - 1 ? group.modules[moduleIndex + 1] : null
            };
        }
    }
    return null;
};

/**
 * Get breadcrumb items for a path
 */
export const getBreadcrumb = (path, currentTab = null) => {
    const info = findModuleInfo(path);
    if (!info) return [{ label: 'Home', path: '/' }];

    const crumbs = [
        { label: 'Home', path: '/' },
        { label: info.groupTitle, path: null },
        { label: info.module.name, path: path }
    ];

    if (currentTab) {
        crumbs.push({ label: currentTab, path: null });
    }

    return crumbs;
};
