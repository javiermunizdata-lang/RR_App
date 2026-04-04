// ui.js
// DOM Manipulation and Display Updates for Madrid RR App

import { state, saveState, addLog } from './state.js';
import { getTeamMembers, toggleBreak, handleDragStart, handleDragOver, handleDropOnMember, handleDropOnList } from './team.js';
import { getMadridTimeParts, getMadridDateShort, getZoneOffsetMinutes, formatMinutes, isWithinWindow, escapeHtml, getZoneDateParts, getMadridDateForSubject, buildHandoverEml } from './utils.js';
import { getNextPerson, getEarlyTotalTickets, getLatersTotalTickets, isLatersInBalance } from './assignment.js';
import { EARLY_TURN, LATERS_TURN, BALANCE_THRESHOLD, NC_POSITION_INDEX, NOTE_OPTIONS, NC_EARLY_ACTIVE, NC_LATERS_ACTIVE } from './config.js';

let displayTimeZone = 'Europe/Madrid';
let activeAppView = 'overview';
let tableFilters = { shift: '', name: '', customer: '', ucn: '' };

export function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.background = type === 'success' ? '#d4edda' :
                                   type === 'error' ? '#f8d7da' :
                                   type === 'warning' ? '#fff3cd' : '#e7f3ff';
    }
}

export function updateDisplay() {
    recalculateTicketsInConfig();
    updateTime();
    updateNextPersonDisplay();
    updateRulesInfo();
    updateTeamDisplay();
    
    if (activeAppView === 'table' && !isEditingTableCell()) {
        updateTicketsTable();
    }
}

export function recalculateTicketsInConfig() {
    // Reset all counts
    Object.keys(state.teamConfig).forEach(id => {
        state.teamConfig[id].tickets = 0;
    });

    state.tickets.forEach(ticket => {
        // Match by name or ID (fallback for old format)
        const memberId = ticket.assignedId || Object.keys(state.teamConfig).find(id => state.teamConfig[id].name === ticket.assignedTo);
        if (memberId && state.teamConfig[memberId]) {
            state.teamConfig[memberId].tickets += 1;
        }
    });
}

function isEditingTableCell() {
    const active = document.activeElement;
    if (!active) return false;
    return active.classList.contains('table-input') || active.classList.contains('table-select');
}

export function updateTime() {
    const { hours, minutes } = getMadridTimeParts(); // Base Madrid time
    document.getElementById('current-time').textContent = `${hours}:${minutes}`;

    const offset = getZoneOffsetMinutes('Europe/Madrid', displayTimeZone);
    const nowMinutesTotal = (Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10)) + offset;
    
    // Normalize to 24h
    const currentTzMinutes = (nowMinutesTotal % 1440 + 1440) % 1440;
    
    // Calculate active shift window from Madrid to current TZ
    const getShiftStatus = (turn) => {
        const start = (turn === 'early' ? EARLY_TURN.start : LATERS_TURN.start) * 60;
        const end = (turn === 'early' ? EARLY_TURN.end : LATERS_TURN.end) * 60;
        const startTz = (start + offset % 1440 + 1440) % 1440;
        const endTz = (end + offset % 1440 + 1440) % 1440;
        return isWithinWindow(currentTzMinutes, startTz, endTz);
    };

    const activeShifts = [];
    if (getShiftStatus('early')) activeShifts.push('Early');
    if (getShiftStatus('laters')) activeShifts.push('Laters');
    
    document.getElementById('active-turn').textContent = activeShifts.length > 0 ? activeShifts.join(' + ') : 'None';
}

export function updateNextPersonDisplay() {
    const next = getNextPerson(false);
    const nameEl = document.getElementById('next-person-name');
    const roleEl = document.getElementById('next-person-role');
    const balanceInfo = document.getElementById('balance-info');

    if (!next || !next.person) {
        if (nameEl) nameEl.textContent = 'No staff';
        if (roleEl) roleEl.textContent = '';
        if (balanceInfo) balanceInfo.style.display = 'none';
        return;
    }

    if (nameEl) nameEl.textContent = next.person.name;
    if (roleEl) roleEl.textContent = `(${next.person.tickets || 0} tickets)`;

    if (next.balancing) {
        const earlyTotal = getEarlyTotalTickets();
        const latersTotal = getLatersTotalTickets();
        const threshold = earlyTotal * BALANCE_THRESHOLD;
        if (balanceInfo) {
            balanceInfo.textContent = `Balancing: ${latersTotal}/${Math.round(threshold)}`;
            balanceInfo.style.display = 'block';
        }
    } else {
        if (balanceInfo) balanceInfo.style.display = 'none';
    }
}

export function updateRulesInfo() {
    const rules = document.getElementById('rules-info-text');
    if (!rules) return;
    
    const offset = getZoneOffsetMinutes('Europe/Madrid', displayTimeZone);
    const latersStartMadrid = LATERS_TURN.start * 60;
    const latersStartTz = (latersStartMadrid + offset % 1440 + 1440) % 1440;
    const timeStr = formatMinutes(latersStartTz);
    
    rules.textContent = `Rule: from ${timeStr}, if Laters is below 50% of Early, tickets go only to Laters. Once threshold is reached, assignment restarts from the lowest-load Early member, then continues with global RR.`;
}

export function updateTeamDisplay() {
    const container = document.getElementById('team-columns');
    if (!container) return;

    let html = '';
    html += renderTurnColumn('early', 'Early Shift');
    html += renderTurnColumn('laters', 'Laters Shift');
    container.innerHTML = html;
}

function isTimeInWindow(hour, start, end) {
    if (start <= end) {
        return hour >= start && hour < end;
    } else {
        return hour >= start || hour < end;
    }
}

function renderTurnColumn(turn, title) {
    const members = getTeamMembers(turn);
    const hourMadrid = Number.parseInt(getMadridTimeParts().hours, 10);
    const shiftDef = turn === 'early' ? EARLY_TURN : LATERS_TURN;
    const isShiftActive = isTimeInWindow(hourMadrid, shiftDef.start, shiftDef.end);

    const window = turn === 'early' ? NC_EARLY_ACTIVE : NC_LATERS_ACTIVE;
    const ncIsActive = isTimeInWindow(hourMadrid, window.start, window.end);
    
    const ncLocked = isShiftActive && !ncIsActive;

    let html = `<div class="team-column" ondrop="app.handleDropOnList(event, '${turn}')" ondragover="app.handleDragOver(event)">`;
    html += `<h3>${title}</h3>`;
    html += '<div class="team-list">';

    members.forEach((member, index) => {
        const onBreak = state.breaks[member.id];
        const isNCPosition = index === NC_POSITION_INDEX;
        const ncInfo = (isNCPosition && ncLocked) ? `<span class="nc-badge" style="background:#ecf0f1;color:#7f8c8d;border:1px solid #bdc3c7;">🔒 NC Point</span>` : '';

        html += `
            <div class="team-member-item ${onBreak ? 'on-break' : ''} ${isNCPosition ? 'nc-slot' : ''} ${isNCPosition && ncLocked ? 'nc-locked' : ''}"
                 draggable="true"
                 ondragstart="app.handleDragStart(event, '${member.id}', '${turn}', ${index})"
                 ondrop="app.handleDropOnMember(event, '${turn}', ${index})"
                 ondragover="app.handleDragOver(event)">
                <span class="member-drag-handle">::</span>
                <div class="member-info">
                    <div class="member-name-row">
                        <div class="member-name">${member.name}</div>
                        ${ncInfo}
                    </div>
                    <div class="member-tickets">${member.tickets || 0} tickets</div>
                </div>
                <div class="member-controls">
                    <span class="off-label ${onBreak ? 'off' : 'on'}">${onBreak ? 'OFF' : 'ON'}</span>
                    <label class="break-switch">
                        <input type="checkbox" class="break-switch-input" ${onBreak ? '' : 'checked'} onchange="app.toggleBreak('${member.id}')">
                        <span class="break-switch-slider"></span>
                    </label>
                </div>
            </div>
        `;
    });

    html += '</div></div>';
    return html;
}

export function switchAppView(view) {
    activeAppView = view;
    ['overview', 'table', 'logs'].forEach(v => {
        const btn = document.getElementById(`view-btn-${v}`);
        const panel = document.getElementById(`${v}-view`);
        if (btn) btn.classList.toggle('active', v === view);
        if (panel) panel.classList.toggle('hidden', v !== view);
    });

    if (view === 'table') updateTicketsTable();
    if (view === 'logs') updateLogsDisplay();
}

export function setTableFilters() {
    tableFilters.shift = document.getElementById('filter-shift')?.value || '';
    tableFilters.name = (document.getElementById('filter-name')?.value || '').trim().toLowerCase();
    tableFilters.customer = (document.getElementById('filter-customer')?.value || '').trim().toLowerCase();
    tableFilters.ucn = (document.getElementById('filter-ucn')?.value || '').trim().toLowerCase();
    updateTicketsTable();
}

export function clearTableFilters() {
    ['filter-shift', 'filter-name', 'filter-customer', 'filter-ucn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    tableFilters = { shift: '', name: '', customer: '', ucn: '' };
    updateTicketsTable();
}

export function updateTicketsTable() {
    const tbody = document.getElementById('tickets-table-body');
    if (!tbody) return;

    updateFilterAutocompleteOptions();

    if (state.tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No tickets yet</td></tr>';
        return;
    }

    const filtered = state.tickets
        .map((ticket, index) => ({ ticket, index }))
        .filter(({ ticket }) => {
            const shiftMatch = !tableFilters.shift || (ticket.turn || '') === tableFilters.shift;
            const nameMatch = !tableFilters.name || (ticket.assignedTo || '').toLowerCase() === tableFilters.name;
            const customerMatch = !tableFilters.customer || (ticket.customer || '').toLowerCase() === tableFilters.customer;
            const ucnMatch = !tableFilters.ucn || (ticket.ucn || '').toLowerCase() === tableFilters.ucn;
            return shiftMatch && nameMatch && customerMatch && ucnMatch;
        });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No rows match current filters</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(({ ticket, index }) => {
        const noteValue = ticket.notes || '';
        const isCustom = noteValue === '__custom__' || (noteValue && !NOTE_OPTIONS.includes(noteValue));
        
        return `
            <tr>
                <td><input type="checkbox" ${ticket.ho === false ? '' : 'checked'} onchange="app.updateTicketHo(${index}, this.checked)"></td>
                <td>${escapeHtml(ticket.turn)}</td>
                <td>${escapeHtml(ticket.assignedTo)}</td>
                <td><strong>${escapeHtml(ticket.number)}</strong></td>
                <td><input type="text" class="table-input" value="${escapeHtml(ticket.ucn)}" onchange="app.updateTicketUcn(${index}, this.value)"></td>
                <td><input type="text" class="table-input" value="${escapeHtml(ticket.customer)}" onchange="app.updateTicketCustomer(${index}, this.value)"></td>
                <td class="notes-cell">
                    <select class="table-select" onchange="app.updateTicketNote(${index}, this.value)">
                        <option value="">Select note...</option>
                        ${NOTE_OPTIONS.map(opt => `<option value="${opt}" ${noteValue === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        <option value="__custom__" ${isCustom ? 'selected' : ''}>Custom...</option>
                    </select>
                    ${isCustom ? `<input type="text" class="table-input" placeholder="Type custom note..." value="${noteValue === '__custom__' ? '' : escapeHtml(noteValue)}" onchange="app.updateTicketCustomNote(${index}, this.value)">` : ''}
                </td>
                <td>${escapeHtml(formatTicketTime(ticket))}</td>
            </tr>
        `;
    }).join('');
}

function formatTicketTime(ticket) {
    if (ticket.createdAtMs) {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: displayTimeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(ticket.createdAtMs));
    }
    return ticket.time || '-';
}

function updateFilterAutocompleteOptions() {
    const setOptions = (id, values, label) => {
        const el = document.getElementById(id);
        if (!el) return;
        const current = el.value;
        const unique = Array.from(new Set(values.map(v => (v || '').trim()).filter(Boolean))).sort();
        el.innerHTML = `<option value="">${label}</option>` + unique.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
        el.value = current;
    };
    setOptions('filter-name', state.tickets.map(t => t.assignedTo), 'All names');
    setOptions('filter-customer', state.tickets.map(t => t.customer), 'All customers');
    setOptions('filter-ucn', state.tickets.map(t => t.ucn), 'All UCN');
}

export function updateLogsDisplay() {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    if (state.actionLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No logs yet</td></tr>';
        return;
    }

    tbody.innerHTML = [...state.actionLogs].reverse().map(log => {
        const date = new Date(log.timestamp);
        return `
            <tr>
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>${escapeHtml(log.user)}</td>
                <td><strong>${escapeHtml(log.action)}</strong></td>
                <td>${escapeHtml(log.details)}</td>
                <td>${escapeHtml(log.target)}</td>
            </tr>
        `;
    }).join('');
}

export function toggleDisplayTimeZone(useNewYork) {
    displayTimeZone = useNewYork ? 'America/New_York' : 'Europe/Madrid';
    updateDisplay();
}

export async function downloadHandoverEml() {
    const dateLabel = getMadridDateForSubject(LATERS_TURN.end);
    const subject = `HANDOVER: Madrid T1 Night ${dateLabel}`;
    
    const handoverTickets = state.tickets.filter(t => t.ho !== false);
    const rowsHtml = handoverTickets.map(t => `
        <tr>
            <td style="border:1px solid #ccc;padding:8px;">${escapeHtml(t.number)}</td>
            <td style="border:1px solid #ccc;padding:8px;">${escapeHtml(t.ucn)}</td>
            <td style="border:1px solid #ccc;padding:8px;">${escapeHtml(t.customer)}</td>
            <td style="border:1px solid #ccc;padding:8px;">${escapeHtml(t.notes)}</td>
        </tr>
    `).join('') || '<tr><td colspan="4">-</td></tr>';

    const htmlBody = `
        <div style="font-family:Arial;font-size:13px;">
            <h2 style="color:#7030A0;">GSOC Daily Handover - ${dateLabel}</h2>
            <table style="border-collapse:collapse;width:100%;border:1px solid #000;">
                <tr style="background:#7030A0;color:white;"><th>Ticket</th><th>UCN</th><th>Customer</th><th>Notes</th></tr>
                ${rowsHtml}
            </table>
        </div>
    `;

    const eml = buildHandoverEml('gsocdailyhandover@ipc.com', 'gsoc@ipc.com', subject, htmlBody);
    const blob = new Blob([eml], { type: 'message/rfc822;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HANDOVER_Madrid_${dateLabel.replaceAll('/', '-')}.eml`;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('Handover EML generated', 'success');
}
