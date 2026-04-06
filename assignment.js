// assignment.js
// Ticket assignment and Round Robin logic
// Simplified: Global lowest-tickets RR (no 50% balancing)

import { state, saveState, addLog } from './state.js';
import { EARLY_TURN, LATERS_TURN } from './config.js';
import { getAssignableMembers } from './team.js';
import { getCurrentTime, validateTicketNumber } from './utils.js';

export function getActivePersonsForAssignment() {
    const hour = getCurrentTime();
    const earlyActive = hour >= EARLY_TURN.start && hour < EARLY_TURN.end;
    const latersActive = (hour >= LATERS_TURN.start) || (hour < LATERS_TURN.end);

    const persons = [];
    if (earlyActive) persons.push(...getAssignableMembers('early'));
    if (latersActive) persons.push(...getAssignableMembers('laters'));

    return { persons };
}

export function getNextPerson(advance = true) {
    const { persons } = getActivePersonsForAssignment();
    if (persons.length === 0) return null;

    // Pick the person with the fewest tickets (global across both shifts)
    const minTickets = Math.min(...persons.map(p => p.tickets || 0));
    let candidates = persons.filter(p => (p.tickets || 0) === minTickets);

    // Tie-break: use rrIndex so the last recipient is not picked again
    if (candidates.length > 1) {
        candidates.sort((a, b) => {
            const idxA = persons.findIndex(p => p.id === a.id);
            const idxB = persons.findIndex(p => p.id === b.id);
            const distA = (idxA - state.rrIndex + persons.length) % persons.length;
            const distB = (idxB - state.rrIndex + persons.length) % persons.length;
            return distA - distB;
        });
    }

    const person = candidates[0];

    if (advance) {
        const currentIndex = persons.findIndex(p => p.id === person.id);
        state.rrIndex = (currentIndex + 1) % persons.length;
    }

    return { person };
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
        ci: false,
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

    addLog('ASSIGN_TICKET', ticket, next.person.name);
    saveState();

    return {
        success: true,
        message: `Ticket ${ticket} assigned to ${next.person.name}`,
        ticket: newTicket
    };
}
