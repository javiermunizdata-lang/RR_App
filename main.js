// main.js
// Entry point for Madrid RR App

import { state, loadState, initializeTeamConfig, resetState, addLog, saveState } from './state.js';
import { setupCloudPersistence, loadStateFromCloud, setupRealtimeSync, saveStateToCloud } from './persistence.js';
import { updateDisplay, showStatus, switchAppView, setTableFilters, clearTableFilters, toggleDisplayTimeZone, downloadHandoverEml } from './ui.js';
import { assignTicket } from './assignment.js';
import { toggleBreak, handleDragStart, handleDragOver, handleDropOnMember, handleDropOnList, moveMember } from './team.js';

// Global access for HTML event handlers
window.app = {
    // Ticket Assignment
    assignTicket: () => {
        const input = document.getElementById('ticket-number');
        const res = assignTicket(input.value.trim());
        if (res.success) {
            input.value = '';
            input.focus();
            showStatus(res.message, 'success');
            updateDisplay();
            saveStateToCloud();
        } else {
            showStatus(res.message, 'warning');
        }
    },
    
    // Team Management
    toggleBreak: (id) => {
        toggleBreak(id);
        const name = state.teamConfig[id]?.name || id;
        const status = state.breaks[id] ? 'ON' : 'OFF';
        addLog('TOGGLE_BREAK', status, name);
        updateDisplay();
        saveStateToCloud();
    },
    handleDragStart,
    handleDragOver,
    handleDropOnMember: (e, turn, index) => {
        handleDropOnMember(e, turn, index);
        updateDisplay();
        saveStateToCloud();
    },
    handleDropOnList: (e, turn) => {
        handleDropOnList(e, turn);
        updateDisplay();
        saveStateToCloud();
    },
    
    // UI Helpers
    switchAppView,
    setTableFilters,
    clearTableFilters,
    toggleDisplayTimeZone: (useNy) => toggleDisplayTimeZone(useNy),
    createHandoverEmail: downloadHandoverEml,
    
    // Ticket Editing
    updateTicketHo: (index, checked) => {
        if (!state.tickets[index]) return;
        state.tickets[index].ho = !!checked;
        addLog('EDIT_FIELD', 'ho', state.tickets[index].assignedTo);
        saveState();
        updateDisplay();
        saveStateToCloud();
    },
    updateTicketUcn: (index, value) => {
        if (!state.tickets[index]) return;
        state.tickets[index].ucn = value.trim().toUpperCase();
        addLog('EDIT_FIELD', 'ucn', state.tickets[index].assignedTo);
        saveState();
        updateDisplay();
        saveStateToCloud();
    },
    updateTicketCustomer: (index, value) => {
        if (!state.tickets[index]) return;
        state.tickets[index].customer = value.trim();
        addLog('EDIT_FIELD', 'customer', state.tickets[index].assignedTo);
        saveState();
        updateDisplay();
        saveStateToCloud();
    },
    updateTicketNote: (index, value) => {
        if (!state.tickets[index]) return;
        state.tickets[index].notes = value;
        addLog('EDIT_FIELD', 'notes', state.tickets[index].assignedTo);
        saveState();
        updateDisplay();
        saveStateToCloud();
    },
    updateTicketCustomNote: (index, value) => {
        if (!state.tickets[index]) return;
        state.tickets[index].notes = value.trim();
        addLog('EDIT_FIELD', 'custom_note', state.tickets[index].assignedTo);
        saveState();
        updateDisplay();
        saveStateToCloud();
    },
    
    // System
    resetAllData: () => {
        if (confirm('Reset all data? This will clear tickets and breaks.')) {
            resetState();
            addLog('RESET_ALL_DATA', 'All cleared', '');
            updateDisplay();
            saveStateToCloud();
            showStatus('Data reset completed', 'success');
        }
    },
    
    clearAllLogs: () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            state.actionLogs = [];
            saveState();
            updateDisplay();
            saveStateToCloud();
            showStatus('Logs cleared', 'success');
        }
    }
};

async function initApp() {
    console.log('Initializing Madrid RR App...');
    
    // Initial UI state
    showStatus('Initializating application...');
    
    // Persistence setup
    loadState();
    initializeTeamConfig();
    updateDisplay();
    
    await setupCloudPersistence();
    const cloudLoaded = await loadStateFromCloud();
    
    if (!cloudLoaded) {
        // Only seed the cloud if it's completely empty
        saveStateToCloud();
    }
    
    // Enable real-time sync with UI update
    setupRealtimeSync(() => {
        updateDisplay();
    });
    
    // Auth logic (Simulated as in original source)
    setTimeout(() => {
        const ticketInput = document.getElementById('ticket-number');
        const assignBtn = document.getElementById('btn-assign');
        if (ticketInput) ticketInput.disabled = false;
        if (assignBtn) assignBtn.disabled = false;
        showStatus('Application ready', 'success');
    }, 1000);

    // Initial display update
    updateDisplay();
    
    // Start clock
    setInterval(() => {
        updateDisplay();
    }, 15000);
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);
