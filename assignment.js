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
        
        // --- PARCHE DE RESCATE ---
        // Evaluar cuántos tickets tiene el Laters más saturado en este momento.
        const maxLatersTickets = latersMembers.length > 0 ? Math.max(...latersMembers.map(m => m.tickets || 0)) : 0;
        
        // Rescatar a cualquier integrante de Early que tenga esos tickets o menos.
        const earlyMembers = getAssignableMembers('early');
        const hungryEarlyMembers = earlyMembers.filter(m => (m.tickets || 0) <= maxLatersTickets);
        
        persons.push(...latersMembers);
        persons.push(...hungryEarlyMembers);
        
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

    let isKickoff = !balancing && pendingEarlyKickoffAfterBalance;
    // Simulate the transition for UI prediction without mutating global flags
    if (!advance && lastBalancingState && !balancing) {
        isKickoff = true;
    }

    // When balancing finishes, restart from the lowest load Early member (as per rules text)
    if (isKickoff) {
        const earlyCandidates = persons.filter(p => p.turn === 'early');
        if (earlyCandidates.length > 0) {
            // Find member with least tickets
            const minT = Math.min(...earlyCandidates.map(p => p.tickets || 0));
            person = earlyCandidates.find(p => (p.tickets || 0) === minT);

            if (advance) {
                const kickoffIndex = persons.findIndex(p => p.id === person.id);
                state.rrIndex = kickoffIndex >= 0 ? (kickoffIndex + 1) % persons.length : 0;
                pendingEarlyKickoffAfterBalance = false;
            }
        }
    }

    if (!person) {
        const currentIndex = state.rrIndex % persons.length;
        if (advance) state.rrIndex = currentIndex; // safely apply wrap if advancing
        
        const basePerson = persons[currentIndex];
        const teamTurn = basePerson.turn;

        // Balance workload within the targeted team
        const teamPersons = persons.filter(p => p.turn === teamTurn);
        const minTickets = Math.min(...teamPersons.map(p => typeof p.tickets === 'number' ? p.tickets : 0));
        const candidates = teamPersons.filter(p => (typeof p.tickets === 'number' ? p.tickets : 0) === minTickets);

        // If there's a tie, maintain natural RR sequence by finding the closest one forward
        candidates.sort((a, b) => {
            const idxA = persons.findIndex(p => p.id === a.id);
            const idxB = persons.findIndex(p => p.id === b.id);
            const distA = (idxA - currentIndex + persons.length) % persons.length;
            const distB = (idxB - currentIndex + persons.length) % persons.length;
            return distA - distB;
        });

        person = candidates[0];

        if (advance) {
            // Advance sequential pointer to give the next sub-turn to the next expected slot/team
            state.rrIndex = (currentIndex + 1) % persons.length;
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
