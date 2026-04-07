// state.js
// State management for Madrid RR App

import { LOCAL_STATE_KEY, ALL_MEMBERS } from './config.js';

// Global state
export let currentWindowUser = 'User'; // Configurable user identity

export let state = {
    tickets: [],
    rrIndex: 0,
    currentUser: null, // Preserving from original
    teamOrder: {
        early: ALL_MEMBERS.filter(m => m.defaultTurn === 'early').map(m => m.id),
        laters: ALL_MEMBERS.filter(m => m.defaultTurn === 'laters').map(m => m.id)
    },
    teamConfig: {},
    breaks: {},
    actionLogs: [], // Using original name for consistency with features
    fieldLocks: {}, // Preserving from original
    lastModified: null, // Preserving from original
    timestamp: null
};

// Save to localStorage
export function saveState() {
    try {
        localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify({
            tickets: state.tickets,
            rrIndex: state.rrIndex,
            teamOrder: state.teamOrder,
            teamConfig: state.teamConfig,
            breaks: state.breaks,
            actionLogs: state.actionLogs,
            lastModified: state.lastModified,
            fieldLocks: state.fieldLocks
        }));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

// Load from localStorage
export function loadState() {
    try {
        const saved = localStorage.getItem(LOCAL_STATE_KEY);
        if (saved) {
            const loaded = JSON.parse(saved);
            Object.assign(state, loaded);
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

// Reset everything EXCEPT team order (positions) and member assignments
export function resetState() {
    state.tickets = [];
    state.rrIndex = 0;
    state.breaks = {};
    state.actionLogs = [];
    state.lastModified = null;
    state.timestamp = null;
    
    // Reset ticket counters only, preserve member names, turns, and positions
    Object.keys(state.teamConfig).forEach(memberId => {
        if (state.teamConfig[memberId]) {
            state.teamConfig[memberId].tickets = 0;
        }
    });
    
    saveState();
}

/**
 * Add an action log entry
 */
export function addLog(action, details = '', target = '') {
    const log = {
        timestamp: new Date().getTime(),
        user: currentWindowUser,
        action: action,
        details: details || '',
        target: target || ''
    };
    state.actionLogs.push(log);
    if (state.actionLogs.length > 500) {
        state.actionLogs.shift();
    }
    saveState();
}

// Sanitize state to ensure ONLY valid IDs from config.js are used
export function sanitizeState() {
    const validIds = new Set(ALL_MEMBERS.map(m => m.id));
    
    // 1. Clean teamOrder
    ['early', 'laters'].forEach(turn => {
        const currentIds = state.teamOrder[turn] || [];
        state.teamOrder[turn] = currentIds.filter(id => validIds.has(id));
        
        // If the turn list is empty (e.g. after cleaning old IDs), re-fill with defaults
        if (state.teamOrder[turn].length === 0) {
            state.teamOrder[turn] = ALL_MEMBERS.filter(m => m.defaultTurn === turn).map(m => m.id);
        }
    });

    // 2. Add missing members to teamOrder if they are not there
    ALL_MEMBERS.forEach(m => {
        const alreadyInAny = state.teamOrder.early.includes(m.id) || state.teamOrder.laters.includes(m.id);
        if (!alreadyInAny) {
            state.teamOrder[m.defaultTurn].push(m.id);
        }
    });

    // 3. Sync teamConfig with current names and tickets
    const newTeamConfig = {};
    ALL_MEMBERS.forEach(m => {
        const existing = state.teamConfig[m.id] || {};
        newTeamConfig[m.id] = {
            name: m.name,
            turn: state.teamOrder.early.includes(m.id) ? 'early' : 'laters',
            tickets: Number.isInteger(existing.tickets) ? existing.tickets : 0
        };
    });
    state.teamConfig = newTeamConfig;

    saveState();
}

// Initialize config and order, ensuring ONLY valid IDs from config.js are used
export function initializeTeamConfig() {
    sanitizeState();
}



export function getSerializableState() {
    return {
        tickets: state.tickets,
        rrIndex: state.rrIndex,
        teamOrder: state.teamOrder,
        teamConfig: state.teamConfig,
        breaks: state.breaks,
        actionLogs: state.actionLogs.slice(-500),
        lastModified: new Date().getTime(),
        fieldLocks: state.fieldLocks,
        timestamp: new Date().toISOString()
    };
}
