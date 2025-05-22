// src/utils/session.js
import store from '@/store';
import router from '@/router';

export function checkSession() {
    const sessionEnd = localStorage.getItem('sessionEndIn');
    if (!sessionEnd || new Date().getTime() > Number(sessionEnd)) {
        // Session expired - log the user out
        store.commit('logout');
        localStorage.removeItem('access_token');
        router.push({ name: 'login' });
    }
}
