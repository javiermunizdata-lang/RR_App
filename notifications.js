import { MEMBERS_BY_ID } from './config.js';

/**
 * Opens a Microsoft Teams chat with a cumulative message for a member
 * @param {string} memberId - ID of the member assigned to the ticket
 * @param {string} ticketNumber - The current ticket number (INC...)
 * @param {Array} memberTickets - List of all tickets assigned to this member today
 */
export function openTeamsNotification(memberId, ticketNumber, memberTickets = []) {
    const member = MEMBERS_BY_ID[memberId];
    
    if (!member || !member.email) {
        console.warn(`Cannot notify ${memberId}: member not found or email missing.`);
        return;
    }

    // Header with current ticket
    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let message = `NEW TICKET ASSIGNMENT: ${ticketNumber.toUpperCase()} (${now})\n`;
    message += `--------------------------------------------------\n`;
    message += `Hi ${member.name}, here is your assignment status:\n\n`;

    // History list (limit to last 10 for message length safety)
    const history = memberTickets.slice(0, 10);
    history.forEach((t, i) => {
        const isNew = t.number.toUpperCase() === ticketNumber.toUpperCase();
        message += `${i + 1}. ${t.number.toUpperCase()} - ${t.time}${isNew ? ' (NEW)' : ''}\n`;
    });

    if (memberTickets.length > 10) {
        message += `... and ${memberTickets.length - 10} more in your history.\n`;
    }

    message += `--------------------------------------------------\n`;
    message += `Please check them. Thanks!`;

    // Microsoft Teams Deep Link format - Switching back to msteams:/ for direct desktop triggering
    const encodedMsg = encodeURIComponent(message);
    const teamsUrl = `msteams:/l/chat/0/0?users=${member.email}&message=${encodedMsg}&token=${Date.now()}`;

    // Trigger the desktop app directly
    window.location.href = teamsUrl;
}
