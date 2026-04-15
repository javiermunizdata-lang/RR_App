import { MEMBERS_BY_ID } from './config.js';

/**
 * Opens a Microsoft Teams chat with a notification for a member
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

    // New ticket header - clean format without timestamp
    let message = `NEW TICKET: ${ticketNumber.toUpperCase()}\n\n`;
    message += `Hi ${member.name}, I have assigned this ticket to you. Please check it. Thanks!\n\n`;

    // Assignments list for today
    if (memberTickets.length > 0) {
        message += `Your assignments today:\n`;
        
        memberTickets.slice(0, 10).forEach((t, i) => {
            const isNew = t.number.toUpperCase() === ticketNumber.toUpperCase();
            const mark = isNew ? '>> ' : '';
            const end = isNew ? ' <<' : '';
            message += `${i + 1}. ${mark}${t.number.toUpperCase()}${end} ${t.time}\n`;
        });

        if (memberTickets.length > 10) {
            message += `... and ${memberTickets.length - 10} more.\n`;
        }
    }

    // Microsoft Teams Deep Link format
    const encodedMsg = encodeURIComponent(message);
    const teamsUrl = `msteams:/l/chat/0/0?users=${member.email}&message=${encodedMsg}&token=${Date.now()}`;

    // Trigger the desktop app directly
    window.location.href = teamsUrl;
}