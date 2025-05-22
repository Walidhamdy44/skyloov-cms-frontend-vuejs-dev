import store from '@/store';
import router from '@/router';

let sessionCheckInterval = null;

export function checkSession() {
    const sessionEnd = localStorage.getItem('sessionEndIn');
    if (!sessionEnd || new Date().getTime() > Number(sessionEnd)) {
        handleSessionExpired();
        return false;
    }
    return true;
}

export function handleSessionExpired() {
    store.commit('logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('sessionEndIn');
    stopSessionMonitoring();

    // Only redirect if not already on login page
    if (router.currentRoute.value.name !== 'login') {
        router.push({
            name: 'login',
            query: { expired: 'true' }
        });
    }
}

export function startSessionMonitoring() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    sessionCheckInterval = setInterval(() => {
        checkSession();
    }, 1000);
}

export function stopSessionMonitoring() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
}
