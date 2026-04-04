// state.js
// State management for Madrid RR App

import { LOCAL_STATE_KEY, ALL_MEMBERS } from './config.js';

// Global state
export let currentWindowUser = 'User'; // Configurable user identify

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

// Reset everything
export function resetState() {
    state.tickets = [];
    state.rrIndex = 0;
    state.breaks = {};
    state.actionLogs = [];
    state.lastModified = null;
    state.timestamp = null;
    
    state.teamOrder = {
        early: ALL_MEMBERS.filter(m => m.defaultTurn === 'early').map(m => m.id),
        laters: ALL_MEMBERS.filter(m => m.defaultTurn === 'laters').map(m => m.id)
    };
    
    // Reset config
    state.teamConfig = {};
    ALL_MEMBERS.forEach(member => {
        state.teamConfig[member.id] = {
            name: member.name,
            turn: member.defaultTurn,
            tickets: 0
        };
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

// Initialize config if it doesn't exist
export function initializeTeamConfig() {
    // 1. Initialize per-member config if missing
    ALL_MEMBERS.forEach(member => {
        if (!state.teamConfig[member.id]) {
            state.teamConfig[member.id] = {
                name: member.name,
                turn: member.defaultTurn,
                tickets: 0
            };
        }
    });

    // 2. Validate teamOrder: If it's empty or contains invalid IDs (e.g. from an old version), reset it
    const validIds = new Set(ALL_MEMBERS.map(m => m.id));
    const isOrderValid = (turn) => 
        state.teamOrder[turn] && 
        state.teamOrder[turn].length > 0 && 
        state.teamOrder[turn].every(id => validIds.has(id));

    if (!isOrderValid('early') || !isOrderValid('laters')) {
        console.warn('Invalid or old teamOrder detected. Resetting to defaults...');
        state.teamOrder = {
            early: ALL_MEMBERS.filter(m => m.defaultTurn === 'early').map(m => m.id),
            laters: ALL_MEMBERS.filter(m => m.defaultTurn === 'laters').map(m => m.id)
        };
        saveState();
    }
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
