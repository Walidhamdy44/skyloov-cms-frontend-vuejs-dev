import { createStore } from 'vuex';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const store = createStore({
    state() {
        return {
            toastMessage: {
                severity: '',
                summary: '',
                detail: '',
                life: 3000
            },
            user: JSON.parse(localStorage.getItem('user')) || {},
            authenticated: localStorage.getItem('access_token') || false
        };
    },
    mutations: mutations,
    actions: actions,
    getters: getters
});

export default store;
