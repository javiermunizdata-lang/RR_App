// persistence.js
// Firebase persistence for Madrid RR App

import { state, saveState, getSerializableState, sanitizeState } from './state.js';
import { FIREBASE_CONFIG, CLOUD_COLLECTION, CLOUD_DOC_ID } from './config.js';

let firestoreDb = null;
let cloudPersistenceEnabled = false;
let realtimeSyncListener = null;

export function isFirebaseConfigReady() {
    return FIREBASE_CONFIG?.apiKey && FIREBASE_CONFIG?.projectId;
}

export async function setupCloudPersistence() {
    if (!isFirebaseConfigReady()) {
        console.warn('Firebase config not ready');
        return;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        firestoreDb = firebase.firestore();
        cloudPersistenceEnabled = true;
        console.log('Firebase cloud persistence enabled');
    } catch (error) {
        console.error('Firebase setup failed:', error);
        cloudPersistenceEnabled = false;
    }
}

export async function saveStateToCloud(retries = 3) {
    if (!cloudPersistenceEnabled || !firestoreDb) return;

    for (let i = 0; i < retries; i++) {
        try {
            const payload = {
                ...getSerializableState(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await firestoreDb
                .collection(CLOUD_COLLECTION)
                .doc(CLOUD_DOC_ID)
                .set(payload, { merge: true });
            console.log('State saved to cloud');
            return;
        } catch (error) {
            console.error(`Cloud save attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            // Exponential backoff
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export async function loadStateFromCloud() {
    if (!cloudPersistenceEnabled || !firestoreDb) return false;

    try {
        const doc = await firestoreDb
            .collection(CLOUD_COLLECTION)
            .doc(CLOUD_DOC_ID)
            .get();
        
        if (doc.exists) {
            applyRemoteState(doc.data());
            console.log('State loaded from cloud');
            return true;
        }
    } catch (error) {
        console.error('Cloud load failed:', error);
    }
    return false;
}

export function applyRemoteState(remoteData) {
    if (!remoteData) return;
    
    // Check timestamps if provided in original
    if (remoteData.lastModified && state.lastModified && remoteData.lastModified <= state.lastModified) {
        // Local is newer or same, don't overwrite if it was a sync event
    }

    if (remoteData.tickets) state.tickets = remoteData.tickets;
    if (remoteData.rrIndex !== undefined) state.rrIndex = remoteData.rrIndex;
    if (remoteData.teamOrder) state.teamOrder = remoteData.teamOrder;
    if (remoteData.teamConfig) state.teamConfig = remoteData.teamConfig;
    if (remoteData.breaks) state.breaks = remoteData.breaks;
    if (remoteData.actionLogs) state.actionLogs = remoteData.actionLogs;
    if (remoteData.fieldLocks) state.fieldLocks = remoteData.fieldLocks;
    
    // IMPORTANT: After applying remote data, ensure IDs are unified and invalid ones are gone
    sanitizeState();
    
    state.lastModified = remoteData.lastModified || new Date().getTime();
}

export async function setupRealtimeSync(onUpdateCallback) {
    if (!cloudPersistenceEnabled || !firestoreDb) return;

    try {
        if (realtimeSyncListener) {
            realtimeSyncListener(); // Unsubscribe first
        }

        realtimeSyncListener = firestoreDb
            .collection(CLOUD_COLLECTION)
            .doc(CLOUD_DOC_ID)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const remoteData = doc.data();
                    
                    // Comparison logic from original source (recalculated tickets handled in ui)
                    if (remoteData.lastModified && (!state.lastModified || remoteData.lastModified > state.lastModified)) {
                        console.log('Real-time sync: Applying remote changes', remoteData.lastModified);
                        applyRemoteState(remoteData);
                        if (onUpdateCallback) onUpdateCallback();
                    }
                }
            }, error => {
                console.error('Real-time sync error:', error);
            });
    } catch (error) {
        console.error('Realtime setup failed:', error);
    }
}
