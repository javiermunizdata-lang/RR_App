# 🔧 Refactorización Segura para GitHub Pages (Raíz)

## 📁 ESTRUCTURA FINAL (Todo en raíz)

```
rr-app/ (raíz del repo)
├── index.html              (HTML principal)
├── styles.css              (CSS)
├── config.js               (constantes)
├── state.js                (estado)
├── utils.js                (funciones auxiliares)
├── persistence.js          (Firebase + localStorage)
├── team.js                 (gestión de equipo)
├── assignment.js           (lógica de RR)
├── ui.js                   (actualizar pantalla)
├── main.js                 (entrada de la app)
└── README.md               (documentación)
```

**Ventaja:** GitHub Pages sirve automáticamente. Todo en `<script type="module">`.

---

## 📝 PASO 1: config.js

Copia esto en un archivo `config.js` en la raíz:

```javascript
// config.js
export const EARLY_TURN = {
    id: 'early',
    name: 'Early',
    start: 14,
    end: 23,
    members: [
        { id: 'fernando', name: 'Fernando' },
        { id: 'octavio', name: 'Octavio' },
        { id: 'ana-maria', name: 'Ana María' },
        { id: 'enrique', name: 'Enrique' },
        { id: 'gabrielius', name: 'Gabrielius' },
    ]
};

export const LATERS_TURN = {
    id: 'laters',
    name: 'Laters',
    start: 16,
    end: 1,
    members: [
        { id: 'mad', name: 'Mad' },
        { id: 'javier', name: 'Javier' },
        { id: 'francisco', name: 'Francisco' },
        { id: 'alvaro', name: 'Alvaro' },
        { id: 'alberto', name: 'Alberto' },
    ]
};

export const NC_EARLY_ACTIVE = { start: 20, end: 23 };
export const NC_LATERS_ACTIVE = { start: 16, end: 20 };
export const BALANCE_THRESHOLD = 0.5;
export const NC_POSITION_INDEX = 0;

export const NOTE_OPTIONS = [
    'Chase Carrier',
    'Chase A-end',
    'Chase B-end',
    'Chase Dispatch',
    'Monitoring'
];

export const LOCAL_STATE_KEY = 'ticketAssignmentState';
export const CLOUD_COLLECTION = 'rrApp';
export const CLOUD_DOC_ID = 'currentState';

export const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD5Vdg0UXbQm_9-cf3CIjvP54GSe6Suiy4',
    authDomain: 'rr-app-d00ad.firebaseapp.com',
    projectId: 'rr-app-d00ad',
    storageBucket: 'rr-app-d00ad.firebasestorage.app',
    messagingSenderId: '284805631174',
    appId: '1:284805631174:web:c70de6088135450b90dbc7',
    measurementId: 'G-HY6FT4M1D1'
};

// Crear ALL_MEMBERS y MEMBERS_BY_ID
const ALL_MEMBERS = [...EARLY_TURN.members, ...LATERS_TURN.members];
export const MEMBERS_BY_ID = ALL_MEMBERS.reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
}, {});

export { ALL_MEMBERS };
```

**¿Cómo probarlo?**
```javascript
// En DevTools console:
import('./config.js').then(cfg => console.log(cfg.EARLY_TURN));
```

---

## 📝 PASO 2: state.js

```javascript
// state.js
import { 
    LOCAL_STATE_KEY, 
    EARLY_TURN, 
    LATERS_TURN 
} from './config.js';

// Estado global
export let state = {
    tickets: [],
    rrIndex: 0,
    teamOrder: {
        early: EARLY_TURN.members.map(m => m.id),
        laters: LATERS_TURN.members.map(m => m.id)
    },
    teamConfig: {},
    breaks: {},
    logs: [],
    timestamp: null
};

// Guardar en localStorage
export function saveState() {
    try {
        localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

// Cargar de localStorage
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

// Resetear todo
export function resetState() {
    state.tickets = [];
    state.rrIndex = 0;
    state.breaks = {};
    state.logs = [];
    state.timestamp = null;
    
    state.teamOrder = {
        early: EARLY_TURN.members.map(m => m.id),
        laters: LATERS_TURN.members.map(m => m.id)
    };
    
    // Resetear config
    state.teamConfig = {};
    EARLY_TURN.members.concat(LATERS_TURN.members).forEach(member => {
        state.teamConfig[member.id] = {
            name: member.name,
            turn: EARLY_TURN.members.find(m => m.id === member.id) ? 'early' : 'laters',
            tickets: 0
        };
    });
    
    saveState();
}

// Inicializar config si no existe
export function initializeTeamConfig() {
    EARLY_TURN.members.concat(LATERS_TURN.members).forEach(member => {
        if (!state.teamConfig[member.id]) {
            state.teamConfig[member.id] = {
                name: member.name,
                turn: EARLY_TURN.members.find(m => m.id === member.id) ? 'early' : 'laters',
                tickets: 0
            };
        }
    });
}

export function getSerializableState() {
    return {
        tickets: state.tickets,
        rrIndex: state.rrIndex,
        teamOrder: state.teamOrder,
        teamConfig: state.teamConfig,
        breaks: state.breaks,
        logs: state.logs,
        timestamp: new Date().toISOString()
    };
}
```

---

## 📝 PASO 3: utils.js

```javascript
// utils.js

export function getCurrentTime() {
    return new Date().getHours();
}

export function getMadridTime() {
    return new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
}

export function getMadridTimeParts() {
    const date = new Date();
    const time = date.toLocaleString('es-ES', { 
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return time;
}

export function getMadridDateShort() {
    const date = new Date();
    return date.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
}

export function validateTicketNumber(ticket) {
    if (!ticket) return false;
    const pattern = /^INC\d{8}$/;
    return pattern.test(ticket.toUpperCase());
}

export function validateUCN(ucn) {
    if (!ucn) return false;
    const pattern = /^[A-Z]{6}\d{6}$/;
    return pattern.test(ucn.toUpperCase());
}

export function formatTime(date) {
    return date.toLocaleTimeString('es-ES');
}

export function createHandoverEmail(tickets, assignedTo) {
    const ticketList = tickets
        .filter(t => t.assignedTo === assignedTo)
        .map(t => `${t.number} (${t.ucn})`)
        .join('\n');
    
    return {
        to: '',
        cc: '',
        subject: `Handover: ${assignedTo} - ${tickets.length} tickets`,
        body: `Hello,\n\nHandover for ${assignedTo}:\n\n${ticketList}\n\nRegards`
    };
}

export function downloadAsJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```

---

## 📝 PASO 4: persistence.js

```javascript
// persistence.js
import { state, saveState, getSerializableState } from './state.js';
import { FIREBASE_CONFIG, CLOUD_COLLECTION, CLOUD_DOC_ID } from './config.js';

let firestoreDb = null;
let cloudPersistenceEnabled = false;

export function isFirebaseConfigReady() {
    return FIREBASE_CONFIG?.projectId && FIREBASE_CONFIG?.apiKey;
}

export async function setupCloudPersistence() {
    if (!isFirebaseConfigReady()) {
        console.warn('Firebase config not ready');
        return;
    }

    try {
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        firestoreDb = firebase.firestore(app);
        cloudPersistenceEnabled = true;
        console.log('Firebase persistence enabled');
    } catch (error) {
        console.error('Firebase setup failed:', error);
        cloudPersistenceEnabled = false;
    }
}

export async function saveStateToCloud(retries = 3) {
    if (!cloudPersistenceEnabled || !firestoreDb) {
        return;
    }

    for (let i = 0; i < retries; i++) {
        try {
            await firestoreDb
                .collection(CLOUD_COLLECTION)
                .doc(CLOUD_DOC_ID)
                .set(getSerializableState(), { merge: true });
            console.log('State saved to cloud');
            return;
        } catch (error) {
            console.error(`Cloud save attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

export async function loadStateFromCloud() {
    if (!cloudPersistenceEnabled || !firestoreDb) {
        return;
    }

    try {
        const doc = await firestoreDb
            .collection(CLOUD_COLLECTION)
            .doc(CLOUD_DOC_ID)
            .get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.tickets) state.tickets = data.tickets;
            if (data.rrIndex !== undefined) state.rrIndex = data.rrIndex;
            if (data.teamOrder) state.teamOrder = data.teamOrder;
            if (data.teamConfig) state.teamConfig = data.teamConfig;
            if (data.breaks) state.breaks = data.breaks;
            console.log('State loaded from cloud');
        }
    } catch (error) {
        console.error('Cloud load failed:', error);
    }
}

export async function setupRealtimeSync() {
    if (!cloudPersistenceEnabled || !firestoreDb) {
        return;
    }

    try {
        firestoreDb
            .collection(CLOUD_COLLECTION)
            .doc(CLOUD_DOC_ID)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.tickets) state.tickets = data.tickets;
                    if (data.teamOrder) state.teamOrder = data.teamOrder;
                    console.log('State synced from cloud');
                }
            }, error => {
                console.error('Realtime sync error:', error);
            });
    } catch (error) {
        console.error('Realtime setup failed:', error);
    }
}
```

---

## 📝 PASO 5: team.js

```javascript
// team.js
import { state, saveState } from './state.js';
import { EARLY_TURN, LATERS_TURN, MEMBERS_BY_ID, NC_POSITION_INDEX, NC_EARLY_ACTIVE, NC_LATERS_ACTIVE } from './config.js';

export function getTeamMembers(turn) {
    const orderedIds = state.teamOrder[turn] || [];
    return orderedIds
        .map(memberId => {
            const baseMember = MEMBERS_BY_ID[memberId];
            if (!baseMember) return null;
            const config = state.teamConfig[memberId] || {};
            return {
                ...baseMember,
                ...config,
                tickets: config.tickets || 0
            };
        })
        .filter(Boolean);
}

export function getMemberLocation(memberId) {
    for (const turn of ['early', 'laters']) {
        const index = (state.teamOrder[turn] || []).indexOf(memberId);
        if (index !== -1) return { turn, index };
    }
    return null;
}

export function handleDragStart(e, memberId, sourceTurn, sourceIndex) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('memberId', memberId);
    e.dataTransfer.setData('sourceTurn', sourceTurn);
    e.dataTransfer.setData('sourceIndex', String(sourceIndex));
}

export function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

export function moveMember(memberId, sourceTurn, sourceIndex, targetTurn, targetIndex) {
    if (!memberId || !targetTurn) return;

    let actualSourceTurn = sourceTurn;
    let actualSourceIndex = Number.isInteger(sourceIndex) ? sourceIndex : -1;
    
    if (!actualSourceTurn || actualSourceIndex < 0) {
        const location = getMemberLocation(memberId);
        if (!location) return;
        actualSourceTurn = location.turn;
        actualSourceIndex = location.index;
    }

    const sourceList = state.teamOrder[actualSourceTurn];
    const targetList = state.teamOrder[targetTurn];
    if (!sourceList || !targetList) return;
    if (!sourceList.includes(memberId)) return;

    const verifiedSourceIndex = sourceList.indexOf(memberId);
    sourceList.splice(verifiedSourceIndex, 1);

    let insertIndex = Number.isInteger(targetIndex) ? targetIndex : targetList.length;
    if (actualSourceTurn === targetTurn && verifiedSourceIndex < insertIndex) {
        insertIndex -= 1;
    }
    insertIndex = Math.max(0, Math.min(insertIndex, targetList.length));

    targetList.splice(insertIndex, 0, memberId);
    
    if (state.teamConfig[memberId]) {
        state.teamConfig[memberId].turn = targetTurn;
    }

    state.rrIndex = 0;
    saveState();
}

export function handleDropOnMember(e, targetTurn, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceTurn = e.dataTransfer.getData('sourceTurn');
    const sourceIndex = Number.parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    moveMember(memberId, sourceTurn, sourceIndex, targetTurn, targetIndex);
}

export function handleDropOnList(e, targetTurn) {
    e.preventDefault();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceTurn = e.dataTransfer.getData('sourceTurn');
    const sourceIndex = Number.parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    moveMember(memberId, sourceTurn, sourceIndex, targetTurn, null);
}

export function isNCTimeActive(turn, hour = getCurrentTime()) {
    const window = turn === 'early' ? NC_EARLY_ACTIVE : NC_LATERS_ACTIVE;
    return hour >= window.start && hour < window.end;
}

export function toggleBreak(memberId) {
    if (!state.breaks[memberId]) {
        state.breaks[memberId] = true;
    } else {
        delete state.breaks[memberId];
    }
    saveState();
}

export function isOnBreak(memberId) {
    return !!state.breaks[memberId];
}

export function getAssignableMembers(turn) {
    const members = getTeamMembers(turn);
    const ncIsActive = isNCTimeActive(turn);
    return members.filter((member, index) => {
        if (isOnBreak(member.id)) return false;
        if (index === NC_POSITION_INDEX && !ncIsActive) return false;
        return true;
    });
}

import { getCurrentTime } from './utils.js';
```

---

## 📝 PASO 6: assignment.js

```javascript
// assignment.js
import { state, saveState } from './state.js';
import { 
    EARLY_TURN, 
    LATERS_TURN, 
    BALANCE_THRESHOLD,
    NC_POSITION_INDEX 
} from './config.js';
import { getTeamMembers, getAssignableMembers, isOnBreak } from './team.js';
import { getCurrentTime, validateTicketNumber } from './utils.js';

let lastBalancingState = false;
let pendingEarlyKickoffAfterBalance = false;

export function getEarlyTotalTickets() {
    return getTeamMembers('early').reduce((sum, m) => sum + (m.tickets || 0), 0);
}

export function getLatersTotalTickets() {
    return getTeamMembers('laters').reduce((sum, m) => sum + (m.tickets || 0), 0);
}

export function isLatersInBalance() {
    const earlyTotal = getEarlyTotalTickets();
    const latersTotal = getLatersTotalTickets();
    const threshold = earlyTotal * BALANCE_THRESHOLD;
    return latersTotal < threshold;
}

export function getActivePersonsForAssignment() {
    const hour = getCurrentTime();
    const earlyActive = hour >= EARLY_TURN.start && hour < EARLY_TURN.end;
    const latersActive = (hour >= LATERS_TURN.start) || (hour < LATERS_TURN.end);

    if (latersActive && isLatersInBalance()) {
        const persons = [];
        const latersMembers = getAssignableMembers('laters');
        persons.push(...latersMembers);
        return { persons, balancing: true };
    }

    const persons = [];
    if (earlyActive) {
        const earlyMembers = getAssignableMembers('early');
        persons.push(...earlyMembers);
    }
    if (latersActive) {
        const latersMembers = getAssignableMembers('laters');
        persons.push(...latersMembers);
    }
    
    return { persons, balancing: false };
}

export function getNextPerson(advance = true) {
    const { persons, balancing } = getActivePersonsForAssignment();
    if (persons.length === 0) return null;

    if (advance) {
        if (lastBalancingState && !balancing) {
            pendingEarlyKickoffAfterBalance = true;
        }
        lastBalancingState = balancing;
    }

    let person = null;

    if (!balancing && pendingEarlyKickoffAfterBalance) {
        const earlyCandidates = persons.filter(p => p.turn === 'early');
        if (earlyCandidates.length > 0) {
            const minEarlyTickets = Math.min(...earlyCandidates.map(p => p.tickets || 0));
            person = earlyCandidates.find(p => (p.tickets || 0) === minEarlyTickets) || earlyCandidates[0];

            if (advance) {
                const kickoffIndex = persons.findIndex(p => p.id === person.id);
                state.rrIndex = kickoffIndex >= 0 ? (kickoffIndex + 1) % persons.length : 0;
                pendingEarlyKickoffAfterBalance = false;
            }
        }
    }

    if (!person) {
        state.rrIndex = state.rrIndex % persons.length;
        person = persons[state.rrIndex];
        if (advance) {
            state.rrIndex = (state.rrIndex + 1) % persons.length;
        }
    }

    return { person, balancing };
}

export function assignTicket(ticketNumber, ucn = '', customer = '', notes = '', ho = false) {
    const ticket = ticketNumber.toUpperCase();
    
    if (!validateTicketNumber(ticket)) {
        return { success: false, message: 'Invalid ticket format' };
    }

    const next = getNextPerson();
    if (!next || !next.person) {
        return { success: false, message: 'No staff available' };
    }

    const newTicket = {
        id: Date.now(),
        number: ticket,
        ucn: ucn.toUpperCase(),
        customer: customer,
        notes: notes,
        ho: ho,
        assignedTo: next.person.name,
        assignedId: next.person.id,
        time: new Date().toLocaleTimeString('es-ES'),
        turn: next.person.turn === 'early' ? 'Early' : 'Laters'
    };

    state.tickets.unshift(newTicket);
    
    // Actualizar contador de tickets
    if (state.teamConfig[next.person.id]) {
        state.teamConfig[next.person.id].tickets = (state.teamConfig[next.person.id].tickets || 0) + 1;
    }

    saveState();
    
    return { 
        success: true, 
        message: `Ticket assigned to ${next.person.name}`,
        ticket: newTicket,
        balancing: next.balancing
    };
}
```

---

## 📝 PASO 7: ui.js

```javascript
// ui.js
import { state } from './state.js';
import { getTeamMembers } from './team.js';
import { getMadridTimeParts } from './utils.js';

export function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status status-${type}`;
    }
}

export function updateDisplay() {
    updateTime();
    updateOverviewTab();
    updateTicketsTable();
}

export function updateTime() {
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = getMadridTimeParts();
    }
}

export function updateOverviewTab() {
    // Renderizar Team Management
    updateTeamDisplay();
    updateNextPersonDisplay();
}

export function updateTeamDisplay() {
    const earlyContainer = document.getElementById('early-team');
    const latersContainer = document.getElementById('laters-team');
    
    if (earlyContainer) {
        earlyContainer.innerHTML = renderTeamList('early');
    }
    if (latersContainer) {
        latersContainer.innerHTML = renderTeamList('laters');
    }
}

function renderTeamList(turn) {
    const members = getTeamMembers(turn);
    return members.map((member, index) => {
        const onBreak = state.breaks[member.id];
        return `
            <div class="team-member-item ${onBreak ? 'on-break' : ''}" 
                 draggable="true" 
                 ondragstart="handleDragStart(event, '${member.id}', '${turn}', ${index})">
                <span class="drag-handle">⋮⋮</span>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-tickets">${member.tickets || 0} tickets</div>
                </div>
                <div class="member-controls">
                    <input type="checkbox" 
                           ${onBreak ? 'checked' : ''} 
                           onchange="toggleBreak('${member.id}')">
                </div>
            </div>
        `;
    }).join('');
}

export function updateNextPersonDisplay() {
    const { getNextPerson } = await import('./assignment.js');
    const next = getNextPerson(false);
    
    const nextNameEl = document.getElementById('next-person-name');
    const nextRoleEl = document.getElementById('next-person-role');
    
    if (next && next.person) {
        if (nextNameEl) nextNameEl.textContent = next.person.name;
        if (nextRoleEl) nextRoleEl.textContent = `${next.person.tickets || 0} tickets`;
    }
}

export function updateTicketsTable() {
    const tbody = document.querySelector('#tickets-table tbody');
    if (!tbody) return;

    if (state.tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No tickets yet</td></tr>';
        return;
    }

    tbody.innerHTML = state.tickets.map(ticket => `
        <tr>
            <td>${ticket.turn}</td>
            <td>${ticket.assignedTo}</td>
            <td><strong>${ticket.number}</strong></td>
            <td>${ticket.ucn}</td>
            <td>${ticket.time}</td>
            <td><small>${ticket.customer || '-'}</small></td>
        </tr>
    `).join('');
}

export function switchAppView(viewName) {
    const tabs = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = document.getElementById(`${viewName}-tab`);
    if (activeTab) activeTab.classList.add('active');
    
    const activeBtn = document.querySelector(`[data-tab="${viewName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}
```

---

## 📝 PASO 8: main.js

```javascript
// main.js
import { state, loadState, initializeTeamConfig, resetState } from './state.js';
import { setupCloudPersistence, loadStateFromCloud, setupRealtimeSync, saveStateToCloud } from './persistence.js';
import { updateDisplay, showStatus, switchAppView } from './ui.js';
import { assignTicket, getNextPerson } from './assignment.js';
import { moveMember, toggleBreak, handleDropOnMember, handleDropOnList, handleDragStart } from './team.js';

// Variables globales para HTML
window.app = {
    assignTicket,
    moveMember,
    toggleBreak,
    handleDragStart,
    handleDropOnMember,
    handleDropOnList,
    switchAppView,
    resetAllData
};

async function initApp() {
    console.log('Initializing RR App...');
    
    // Cargar estado local
    loadState();
    initializeTeamConfig();
    
    // Configurar Firebase
    await setupCloudPersistence();
    await loadStateFromCloud();
    setupRealtimeSync();
    
    // Actualizar UI
    updateDisplay();
    setupEventListeners();
    
    console.log('App initialized');
}

function setupEventListeners() {
    // Asignar ticket
    document.getElementById('btn-assign')?.addEventListener('click', handleAssignClick);
    document.getElementById('ticket-number')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAssignClick();
    });
    
    // Tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.tab;
            switchAppView(view);
            updateDisplay();
        });
    });
    
    // Actualizar cada segundo
    setInterval(updateDisplay, 1000);
    
    // Guardar en cloud cada 5 segundos
    setInterval(async () => {
        await saveStateToCloud();
    }, 5000);
}

function handleAssignClick() {
    const ticketNumber = document.getElementById('ticket-number').value;
    const ucn = document.getElementById('ticket-ucn').value;
    const customer = document.getElementById('ticket-customer')?.value || '';
    const notes = document.getElementById('ticket-notes')?.value || '';
    
    const result = assignTicket(ticketNumber, ucn, customer, notes);
    
    if (result.success) {
        showStatus(`✅ ${result.message}`, 'success');
        document.getElementById('ticket-number').value = '';
        document.getElementById('ticket-ucn').value = '';
        document.getElementById('ticket-customer').value = '';
        document.getElementById('ticket-notes').value = '';
        document.getElementById('ticket-number').focus();
        updateDisplay();
        saveStateToCloud();
    } else {
        showStatus(`❌ ${result.message}`, 'error');
    }
}

function resetAllData() {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos?')) {
        resetState();
        updateDisplay();
        showStatus('✅ Data reset', 'success');
        saveStateToCloud();
    }
}

// Iniciar cuando DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
```

---

## 📝 PASO 9: index.html (actualizado)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Madrid RR App</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-main">
                <h1>🎫 Madrid RR App</h1>
                <div class="time-info">
                    <span id="current-time">--:--:--</span>
                </div>
            </div>
        </header>

        <div class="tabs">
            <button class="tab-button active" data-tab="overview">Overview</button>
            <button class="tab-button" data-tab="tickets">Tickets Table</button>
        </div>

        <div id="overview-tab" class="tab-pane active">
            <div class="assignment-section">
                <h2>Assign Ticket</h2>
                <input type="text" id="ticket-number" placeholder="INC00000000" maxlength="11">
                <input type="text" id="ticket-ucn" placeholder="ZZZZZZ000000" maxlength="12">
                <input type="text" id="ticket-customer" placeholder="Customer (optional)">
                <textarea id="ticket-notes" placeholder="Notes (optional)"></textarea>
                <button id="btn-assign" class="btn-primary">Assign Ticket</button>
                <div id="status-message" class="status status-info">Ready</div>
            </div>

            <div class="next-assignment">
                <h3>Next: <span id="next-person-name">---</span></h3>
                <small id="next-person-role"></small>
            </div>

            <div class="team-management">
                <h2>Team Management</h2>
                <div class="team-columns">
                    <div class="team-column">
                        <h3>🌅 Early (14:00-23:00)</h3>
                        <div id="early-team" class="team-list" 
                             ondrop="app.handleDropOnList(event, 'early')" 
                             ondragover="event.preventDefault()">
                        </div>
                    </div>
                    <div class="team-column">
                        <h3>🌙 Laters (16:00-01:00)</h3>
                        <div id="laters-team" class="team-list" 
                             ondrop="app.handleDropOnList(event, 'laters')" 
                             ondragover="event.preventDefault()">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="tickets-tab" class="tab-pane">
            <table id="tickets-table">
                <thead>
                    <tr>
                        <th>Shift</th>
                        <th>Assigned To</th>
                        <th>Ticket</th>
                        <th>UCN</th>
                        <th>Time</th>
                        <th>Customer</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    <script type="module" src="main.js"></script>
</body>
</html>
```

---

## ✅ ORDEN DE EJECUCIÓN SEGURA

1. Crea `config.js` en la raíz
2. Crea `state.js`
3. Crea `utils.js`
4. Crea `persistence.js`
5. Crea `team.js`
6. Crea `assignment.js`
7. Crea `ui.js`
8. Crea `main.js`
9. Actualiza `index.html`
10. Prueba en navegador
11. Commit a GitHub

---

## 🧪 PRUEBA RÁPIDA

```javascript
// En DevTools console:
import('./config.js').then(cfg => {
    console.log('✅ config.js loaded');
    console.log('Members:', cfg.ALL_MEMBERS.map(m => m.name));
});
```

---

Todo está listo para copiar/pegar. ¿Empezamos? 👇
