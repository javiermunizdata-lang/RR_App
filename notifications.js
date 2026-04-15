import { MEMBERS_BY_ID } from './config.js';

const FUN_MESSAGES = [
    "New ticket! 🎫 Only for you, STAR! Check it. Thanks!",
    "Ticket alert! 🚨 PRO level assignment! Check it. You're AMAZING! Thanks!",
    "Ticket! 🎯 Bullseye! This goes to the BEST. Check it. Thanks!",
    "New ticket! 🎉 YOU'RE on fire! Check it. Thanks!",
    "Ticket! 🎊 VIP treatment - for YOU! Check it. Thanks!",
    "New ticket! 🌟 Only the BEST deserve this! Check it. Thanks!",
    "Ticket! 🎳 STRIKE! You're a champion! Check it. Thanks!",
    "New ticket! ☕ Your coffee break - WITH a ticket! Check it. Thanks!",
    "Plot twist! 🎬 YOU make this happen! Check the ticket. Thanks!",
    "New ticket! 🔥 You're on FIRE today! Check it. Thanks!",
    "Ticket! 🚀 TO THE MOON! You're AMAZING! Check it. Thanks!",
    "New ticket! 🌟 STAR material here! Check it. Thanks!",
    "Ticket! 🎡 FUN ride ahead! You got this! Check it. Thanks!",
    "New ticket! 🎪 The show must go on - WITH YOU! Check it. Thanks!",
    "Ticket! 🎢 Ready for the BEST ride? Check it. Thanks!",
    "New ticket! 🎯 RIGHT on TARGET - YOU! Check it. Thanks!",
    "Ticket! 🔔 RING RING - It's your time to SHINE! Check it. Thanks!",
    "New ticket! 📋 This goes to the PRO! Check it. Thanks!",
    "Ticket! ⚡ Electric! Only for the BEST! Check it. Thanks!",
    "New ticket! 🚦 GREEN LIGHT - GO PRO! Check it. Thanks!",
    "Ticket! 🎲 You're THE ONE! Roll with it. Check it. Thanks!",
    "New ticket! 🌈 Bright and EARLY - YOU'RE AMAZING! Check it. Thanks!",
    "Ticket! 🎵 You're a ROCKSTAR! Check it. Thanks!",
    "New ticket! 🎉 Only for the BEST - that's YOU! Check it. Thanks!"
];

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

    // Select a random fun message
    const randomMsg = FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];

    // New ticket header - clean format without timestamp
    let message = `NEW TICKET: ${ticketNumber.toUpperCase()}\n\n`;
    message += `Hi ${member.name}, ${randomMsg}\n\n`;

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