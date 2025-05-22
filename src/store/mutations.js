import router from '@/router';
import axios from 'axios';

export default {
    setToastMessage(state, payload) {
        state.toastMessage = payload;
    },

    login(state, payload) {
        // save access token in local storage
        localStorage.setItem('access_token', payload.token.access_token);
        // save user data in local storage
        localStorage.setItem('user', JSON.stringify(payload));
        // update state
        state.authenticated = true;
        state.user = payload;
    },

    logout(state) {
        // remove access token from local storage
        localStorage.removeItem('access_token');

        // remove user data from local storage
        localStorage.removeItem('user');

        // update state
        state.authenticated = false;
        state.user = {};

        // reset axios
        axios.defaults.headers.common['Authorization'] = null;
        axios.defaults.baseURL = import.meta.env.VITE_API_URL;

        // reset router
        router.push({ name: 'login' });
    }
};
