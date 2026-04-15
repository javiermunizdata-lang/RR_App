import { MEMBERS_BY_ID } from './config.js';

const FUN_MESSAGES = [
    "Ticket! ⛏️ Ticket slave, back to the mine!",
    "New ticket! ☕ Coffee? AFTER 10 tickets, slave!",
    "Ticket! 🦴 Your break? OVER. You're SLAVE now!",
    "New ticket! 👔 Manager sees you. Work MORE!",
    "Ticket! 📡 Carrier is LAZY. You do the work!",
    "New ticket! 🏢 Client is ANGRY. Fix it!",
    "Ticket! 💼 No rest for the ticket SLAVE!",
    "New ticket! ⛓️ You're CHAINED to this ticket!",
    "Ticket! ☕ Coffee earned? NO. 50 more tickets first!",
    "New ticket! 🏃‍♂️ Run! Carrier is lazy, YOU run!",
    "Ticket! 📱 Client waiting! SLAVE at work!",
    "New ticket! 👀 Manager is WATCHING. Work!",
    "Ticket! 💎 You mine tickets like coal. No coffee!",
    "New ticket! ⛏️ Ticket mine never SLEEPS!",
    "Ticket! 📊 SLAVE metrics: UP! Rest: DOWN!",
    "New ticket! 🚫 No CANCEL. No REST. Work!",
    "Ticket! 🏭 IPC SLAVES to the ticket factory!",
    "New ticket! 😴 Your break? NEVER. SLAVE life!",
    "Ticket! 💼 You can't REST until tickets DIE!",
    "New ticket! 📡 Carrier hides, CLIENT screams!",
    "Ticket! ☕ Coffee is EARNED. You're not DONE!",
    "New ticket! ⚒️ Ticket slave: FOREVER on duty!",
    "Ticket! 💰 You earn salary. Carrier LAUGHS at you!",
    "New ticket! 🎯 Ticket SLAVE hits the jackpot: MORE WORK!"
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