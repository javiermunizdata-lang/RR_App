// assignment.js
// Ticket assignment and Round Robin logic

import { state, saveState, addLog } from './state.js';
import { 
    EARLY_TURN, 
    LATERS_TURN, 
    BALANCE_THRESHOLD 
} from './config.js';
import { getTeamMembers, getAssignableMembers } from './team.js';
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

    // When balancing finishes, restart from the lowest load Early member (as per rules text)
    if (!balancing && pendingEarlyKickoffAfterBalance) {
        const earlyCandidates = persons.filter(p => p.turn === 'early');
        if (earlyCandidates.length > 0) {
            // Find member with least tickets
            person = earlyCandidates.reduce((min, p) => (p.tickets < min.tickets ? p : min), earlyCandidates[0]);

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
        return { success: false, message: 'Invalid ticket format (INCxxxxxxxx)' };
    }

    const next = getNextPerson();
    if (!next || !next.person) {
        return { success: false, message: 'No staff available for assignment' };
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
        createdAtMs: Date.now(),
        turn: next.person.turn === 'early' ? 'Early' : 'Laters'
    };

    state.tickets.unshift(newTicket);
    
    // Update ticket counter in config
    if (state.teamConfig[next.person.id]) {
        state.teamConfig[next.person.id].tickets = (state.teamConfig[next.person.id].tickets || 0) + 1;
    }

    const balanceMsg = next.balancing ? ' (Laters balancing)' : '';
    addLog('ASSIGN_TICKET', ticket, next.person.name);
    saveState();
    
    return { 
        success: true, 
        message: `Ticket ${ticket} assigned to ${next.person.name}${balanceMsg}`,
        ticket: newTicket,
        balancing: next.balancing
    };
}
