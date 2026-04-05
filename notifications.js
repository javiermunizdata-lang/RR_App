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

    // Message in English - Uppercase for visibility (Deep links don't support bold)
    const message = `NEW TICKET ASSIGNMENT\n--------------------\nHi ${member.name},\nI have assigned the ticket ${ticketNumber.toUpperCase()} to you.\nPlease check it. Thanks!`;
    
    // Microsoft Teams Deep Link format - using https:// with &web=true to skip the 'Use App' splash screen
    const encodedMsg = encodeURIComponent(message);
    const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${member.email}&message=${encodedMsg}&web=true`;

    // Opening a focused 600x700 popup instead of switching to the desktop app
    // This allows the user to see the chat, send the message, and close the window without losing focus on the RR App
    window.open(
        teamsUrl, 
        'TeamsChatPopup', 
        'width=600,height=700,status=no,menubar=no,toolbar=no,location=no,resizable=yes'
    );
}
