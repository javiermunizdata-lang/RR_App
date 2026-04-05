/**
 * security.js
 * Centralized security and validation logic for Madrid RR App
 */

/**
 * Sanitizes input text by removing any character that is not a letter or a number.
 * Can optionally allow spaces.
 * @param {string} text - The input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @param {boolean} allowSpaces - Whether to keep space characters
 * @returns {string} - The cleaned string
 */
export function sanitizeAlphanumeric(text, maxLength = 30, allowSpaces = true) {
    if (typeof text !== 'string') return '';
    
    // Trim initial whitespace
    let sanitized = text.trim();
    
    // Remove characters that are not letters, numbers or (optionally) spaces
    const regex = allowSpaces ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
    sanitized = sanitized.replace(regex, '');
    
    // Apply length limit
    return sanitized.substring(0, maxLength);
}

/**
 * High-level validator and sanitizer for specific ticket fields
 */
export const Security = {
    UCN: (val) => sanitizeAlphanumeric(val, 15, false).toUpperCase(),
    Customer: (val) => sanitizeAlphanumeric(val, 30, true),
    Note: (val) => sanitizeAlphanumeric(val, 30, true)
};
