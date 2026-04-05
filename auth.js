/**
 * auth.js
 * Microsoft Authentication (MSAL) integration for Madrid RR App
 */

import { MSAL_CONFIG } from './config.js';
import { setCurrentUser } from './state.js';

export async function setupAuth() {
    try {
        // MSAL is loaded from CDN in index.html as a global: msal
        if (typeof msal === 'undefined') {
            console.warn('MSAL not loaded from CDN');
            return;
        }

        const msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);
        await msalInstance.initialize();

        // Handle redirect from login (if any)
        const response = await msalInstance.handleRedirectPromise();
        
        let account = null;
        const currentAccounts = msalInstance.getAllAccounts();
        
        if (currentAccounts.length > 0) {
            account = currentAccounts[0];
        } else if (response) {
            account = response.account;
        }

        if (account) {
            // Get the name from account claims
            const name = account.name || account.username || 'User';
            setCurrentUser(name);
            console.log('Logged in as:', name);
            
            // Update UI if element exists
            const userEl = document.getElementById('current-username');
            if (userEl) userEl.textContent = name;

            return account;
        } else {
            console.log('No active session found. Running in Guest mode.');
            // Optional: trigger login if required
            // await msalInstance.loginRedirect({ scopes: ["user.read"] });
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
    }
    return null;
}
