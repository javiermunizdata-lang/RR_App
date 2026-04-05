/**
 * auth.js
 * Microsoft Authentication (MSAL) integration for Madrid RR App
 */

import { MSAL_CONFIG } from './config.js';
import { setCurrentUser } from './state.js';

let msalInstance = null;

export async function setupAuth() {
    try {
        if (typeof msal === 'undefined') {
            console.warn('MSAL (Microsoft Auth) not loaded');
            return;
        }

        msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);
        await msalInstance.initialize();

        const response = await msalInstance.handleRedirectPromise();
        
        let account = null;
        const currentAccounts = msalInstance.getAllAccounts();
        
        if (currentAccounts.length > 0) {
            account = currentAccounts[0];
        } else if (response) {
            account = response.account;
        }

        if (account) {
            const name = account.name || account.username || 'User';
            setCurrentUser(name);
            updateUserUI(name, true);
            return account;
        } else {
            updateUserUI('Guest', false);
            // Attempt silent login if possible (might fail)
            try {
                const silentRes = await msalInstance.ssoSilent({ scopes: ["user.read"] });
                if (silentRes && silentRes.account) {
                    const name = silentRes.account.name || silentRes.account.username;
                    setCurrentUser(name);
                    updateUserUI(name, true);
                    return silentRes.account;
                }
            } catch(e) {
                // Silent failed, needs interaction
            }
        }
    } catch (error) {
        console.error('Auth setup error:', error);
    }
    return null;
}

export async function login() {
    if (!msalInstance) return;
    try {
        await msalInstance.loginRedirect({ scopes: ["user.read"] });
    } catch (err) {
        console.error('Login error:', err);
    }
}

function updateUserUI(name, isLoggedIn) {
    const userEl = document.getElementById('current-username');
    if (userEl) userEl.textContent = name;
    
    // Create/Hide login button if needed
    const badge = document.getElementById('user-badge');
    if (badge && !isLoggedIn && !document.getElementById('login-btn')) {
        const btn = document.createElement('button');
        btn.id = 'login-btn';
        btn.onclick = () => login();
        btn.textContent = 'Login';
        btn.style.marginLeft = '8px';
        btn.style.fontSize = '9px';
        btn.style.padding = '2px 6px';
        btn.style.cursor = 'pointer';
        badge.appendChild(btn);
    } else if (isLoggedIn) {
        const btn = document.getElementById('login-btn');
        if (btn) btn.remove();
    }
}
