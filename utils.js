// utils.js
// Utility functions for Madrid RR App

export function getCurrentTime() {
    return new Date().getHours();
}

/**
 * Get parts of time for Europe/Madrid
 */
export function getMadridTimeParts() {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const hours = parts.find(part => part.type === 'hour')?.value || '00';
    const minutes = parts.find(part => part.type === 'minute')?.value || '00';
    return { hours, minutes };
}

/**
 * Get Madrid date as DD/MM/YY
 */
export function getMadridDateShort() {
    return new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).format(new Date());
}

/**
 * Get date parts for any timezone
 */
export function getZoneDateParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(date);
    const get = (type) => Number.parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: get('hour'),
        minute: get('minute')
    };
}

/**
 * Build an EML file blob for Outlook
 */
export function buildHandoverEml(to, cc, subject, htmlBody) {
    const boundary = `----=_NextPart_${Date.now()}`;
    const dateStr = new Date().toUTCString();
    const normalize = (value) => String(value || '').replace(/\r?\n/g, '\r\n');
    const html = normalize(htmlBody);

    return [
        `To: ${to}`,
        `Cc: ${cc}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        `Date: ${dateStr}`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: 8bit',
        '',
        'GSOC Daily Handover',
        'Please view this message in HTML format.',
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        'Content-Transfer-Encoding: 8bit',
        '',
        html,
        '',
        `--${boundary}--`,
        ''
    ].join('\r\n');
}

/**
 * Date label for handover email subject
 */
export function getMadridDateForSubject(latersTurnEnd) {
    const madridNow = getZoneDateParts(new Date(), 'Europe/Madrid');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Operational day: between 00:00 and 00:59 (Madrid), keep previous day.
    let operationalDate = new Date(Date.UTC(madridNow.year, madridNow.month - 1, madridNow.day));
    if (madridNow.hour < latersTurnEnd) {
        operationalDate = new Date(operationalDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const day = String(operationalDate.getUTCDate()).padStart(2, '0');
    const month = months[operationalDate.getUTCMonth()];
    const year = String(operationalDate.getUTCFullYear());
    return `${day}/${month}/${year}`;
}

export function validateTicketNumber(ticket) {
    if (!ticket) return false;
    const pattern = /^INC\d{8}$/;
    return pattern.test(ticket.toUpperCase());
}

export function validateUCN(ucn) {
    if (!ucn) return false;
    const pattern = /^[A-Z]{6}\d{6}$/;
    return pattern.test(ucn.toUpperCase());
}

export function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function normalizeMinutes(minutes) {
    const day = 24 * 60;
    return ((minutes % day) + day) % day;
}

export function formatMinutes(minutes) {
    const normalized = normalizeMinutes(minutes);
    const h = String(Math.floor(normalized / 60)).padStart(2, '0');
    const m = String(normalized % 60).padStart(2, '0');
    return `${h}:${m}`;
}

export function isWithinWindow(nowMinutes, startMinutes, endMinutes) {
    if (startMinutes === endMinutes) return true;
    if (startMinutes < endMinutes) {
        return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

export function getZoneOffsetMinutes(fromZone, toZone) {
    const now = new Date();
    const from = getZoneDateParts(now, fromZone);
    const to = getZoneDateParts(now, toZone);
    const fromMs = Date.UTC(from.year, from.month - 1, from.day, from.hour, from.minute);
    const toMs = Date.UTC(to.year, to.month - 1, to.day, to.hour, to.minute);
    return Math.round((toMs - fromMs) / 60000);
}
