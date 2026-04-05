/**
 * notifications.js
 * Handles Microsoft Teams notifications via deep links
 */

import { MEMBERS_BY_ID } from './config.js';

/**
 * Opens a Microsoft Teams chat with a pre-filled message for a member
 * @param {string} memberId - ID of the member assigned to the ticket
 * @param {string} ticketNumber - The ticket number (INC...)
 */
export function openTeamsNotification(memberId, ticketNumber) {
    const member = MEMBERS_BY_ID[memberId];
    
    if (!member || !member.email) {
        console.warn(`Cannot notify ${memberId}: member not found or email missing.`);
        return;
    }

    // Message in English - Using line breaks and uppercase for visibility (Deep links don't support bold)
    const message = `\n\nNEW TICKET ASSIGMENT\n--------------------\nHi ${member.name},\nI have assigned the ticket ${ticketNumber.toUpperCase()} to you.\nPlease check it. Thanks!`;
    
    // Microsoft Teams Deep Link format - using msteams:/ protocol to bypass browser prompts
    const encodedMsg = encodeURIComponent(message);
    const teamsUrl = `msteams:/l/chat/0/0?users=${member.email}&message=${encodedMsg}`;

    // Direct location assignment triggers the desktop app protocol without opening a blank tab
    window.location.href = teamsUrl;
}
