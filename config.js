// config.js
// Madrid RR App Configuration

export const EARLY_TURN = {
    id: 'early',
    name: 'Early',
    start: 14,
    end: 23,
    members: [
        { id: 'fernando', name: 'Fernando' },
        { id: 'octavio', name: 'Octavio' },
        { id: 'ana-maria', name: 'Ana María' },
        { id: 'enrique', name: 'Enrique' },
        { id: 'gabrielius', name: 'Gabrielius' },
        { id: 'luisa', name: 'Luisa' } // Added from original index.html
    ]
};

export const LATERS_TURN = {
    id: 'laters',
    name: 'Laters',
    start: 16,
    end: 1,
    members: [
        { id: 'mad', name: 'Mad' },
        { id: 'javier', name: 'Javier' },
        { id: 'francisco', name: 'Francisco' },
        { id: 'alvaro', name: 'Alvaro' },
        { id: 'alberto', name: 'Alberto' },
        { id: 'julian', name: 'Julian' } // Added from original index.html
    ]
};

export const NC_EARLY_ACTIVE = { start: 20, end: 23 };
export const NC_LATERS_ACTIVE = { start: 16, end: 20 };
export const BALANCE_THRESHOLD = 0.5;
export const NC_POSITION_INDEX = 0;

export const NOTE_OPTIONS = [
    'Chase Carrier',
    'Chase A-end',
    'Chase B-end',
    'Chase Dispatch',
    'Monitoring'
];

export const LOCAL_STATE_KEY = 'ticketAssignmentState';
export const CLOUD_COLLECTION = 'rrApp';
export const CLOUD_DOC_ID = 'currentState';

export const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD5Vdg0UXbQm_9-cf3CIjvP54GSe6Suiy4',
    authDomain: 'rr-app-d00ad.firebaseapp.com',
    projectId: 'rr-app-d00ad',
    storageBucket: 'rr-app-d00ad.firebasestorage.app',
    messagingSenderId: '284805631174',
    appId: '1:284805631174:web:c70de6088135450b90dbc7',
    measurementId: 'G-HY6FT4M1D1'
};

// MSAL Configuration (preserving original)
export const MSAL_CONFIG = {
    auth: {
        clientId: "84f85613-5ad1-4ed1-8438-8084af59198b",
        authority: "https://login.microsoftonline.com/81401b6f-583d-4110-a2ef-da790f1958dc",
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

// Helper lists
const ALL_MEMBERS = [...EARLY_TURN.members, ...LATERS_TURN.members];
export const MEMBERS_BY_ID = ALL_MEMBERS.reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
}, {});

export { ALL_MEMBERS };
