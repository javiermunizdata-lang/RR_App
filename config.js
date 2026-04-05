// config.js
// Madrid RR App Configuration

// ─── TURN DEFINITIONS ───────────────────────────────────────────────────────
// Turns only define schedule and display name.
// They do NOT own members — members are a shared pool (see below).

export const EARLY_TURN = {
    id: 'early',
    name: 'Early',
    start: 14,
    end: 23
};

export const LATERS_TURN = {
    id: 'laters',
    name: 'Late',
    start: 16,
    end: 1
};

// ─── NC WINDOWS ─────────────────────────────────────────────────────────────
// The time window during which the NC slot (position 0) is active per turn.
export const NC_EARLY_ACTIVE = { start: 20, end: 23 };
export const NC_LATERS_ACTIVE = { start: 16, end: 20 };

// ─── ASSIGNMENT RULES ───────────────────────────────────────────────────────
export const BALANCE_THRESHOLD = 0.5; // Laters must reach 50% of Early tickets before normal RR resumes
export const NC_POSITION_INDEX = 0;   // Position 0 in each team list is always the NC slot

// ─── NOTES OPTIONS ──────────────────────────────────────────────────────────
export const NOTE_OPTIONS = [
    'Chase Carrier',
    'Chase A-end',
    'Chase B-end',
    'Chase Dispatch',
    'Chase Provisioning',
    'Monitoring'
];

// ─── PERSISTENCE KEYS ───────────────────────────────────────────────────────
export const LOCAL_STATE_KEY = 'ticketAssignmentState';
export const CLOUD_COLLECTION = 'rrApp';
export const CLOUD_DOC_ID = 'currentState';

// ─── FIREBASE ───────────────────────────────────────────────────────────────
export const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD5Vdg0UXbQm_9-cf3CIjvP54GSe6Suiy4',
    authDomain: 'rr-app-d00ad.firebaseapp.com',
    projectId: 'rr-app-d00ad',
    storageBucket: 'rr-app-d00ad.firebasestorage.app',
    messagingSenderId: '284805631174',
    appId: '1:284805631174:web:c70de6088135450b90dbc7',
    measurementId: 'G-HY6FT4M1D1'
};

// ─── MSAL ────────────────────────────────────────────────────────────────────
export const MSAL_CONFIG = {
    auth: {
        clientId: "84f85613-5ad1-4ed1-8438-8084af59198b",
        authority: "https://login.microsoftonline.com/81401b6f-583d-4110-a2ef-da790f1958dc",
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: { cacheLocation: "localStorage" }
};

// ─── MEMBER POOL ─────────────────────────────────────────────────────────────
// All team members, shared across turns.
// defaultTurn sets the initial team placement on first load.
// Once the app runs, state.teamOrder controls actual placement (drag & drop).

export const ALL_MEMBERS = [
    { id: 'fernando', name: 'Fernando', defaultTurn: 'early' },
    { id: 'octavio', name: 'Octavio', defaultTurn: 'laters' },
    { id: 'ana-maria', name: 'Ana María', defaultTurn: 'early' },
    { id: 'enrique', name: 'Enrique', defaultTurn: 'laters' },
    { id: 'gabrielius', name: 'Gabrielius', defaultTurn: 'laters' },
    { id: 'luisa', name: 'Luisa', defaultTurn: 'early' },
    { id: 'mad', name: 'Mad', defaultTurn: 'laters' },
    { id: 'javier', name: 'Javier', defaultTurn: 'early' },
    { id: 'francisco', name: 'Francisco', defaultTurn: 'laters' },
    { id: 'alvaro', name: 'Alvaro', defaultTurn: 'early' },
    { id: 'alberto', name: 'Alberto', defaultTurn: 'laters' },
    { id: 'julian', name: 'Julian', defaultTurn: 'early' },
];

// Lookup map: member ID → member definition
export const MEMBERS_BY_ID = ALL_MEMBERS.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
}, {});

