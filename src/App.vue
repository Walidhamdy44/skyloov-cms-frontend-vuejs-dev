<script setup>
import { onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { watch } from 'vue';
import store from './store';
import router from './router';
import { startSessionMonitoring } from './service/session';

// toast
const toast = useToast();

// watch the toast message in the state and get it from the store
watch(
    () => store.state.toastMessage,
    (value) => {
        toast.add({
            severity: value.severity,
            summary: value.summary,
            detail: value.detail,
            life: 3000
        });
    }
);

// auth middleware
if (!store.state.authenticated || !localStorage.getItem('access_token')) {
    router.push({ name: 'login' });
}

const sessionEnd = localStorage.getItem('sessionEndIn');
if (!sessionEnd || new Date().getTime() > Number(sessionEnd)) {
    // Session expired - log the user out
    store.commit('logout');
    localStorage.removeItem('access_token');
    router.push({ name: 'login' });
}

onMounted(() => {
    if (localStorage.getItem('sessionEndIn')) {
        startSessionMonitoring();
    }
});
</script>

<template>
    <Toast />
    <router-view />
</template>

<style scoped></style>
