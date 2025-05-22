<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
import store from '@/store';
import router from '@/router';
import axios from 'axios';

const loading = ref(false);

const toast = useToast();
const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');

const logoUrl = computed(() => {
    return `../layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

onMounted(() => {
    const route = useRoute();
    if (route.query.expired === 'true') {
        toast.add({
            severity: 'warn',
            summary: 'Session Expired',
            detail: 'Your session has expired. Please log in again.',
            life: 5000
        });
    }
});

const login = () => {
    loading.value = true;

    if (email.value === '' || password.value === '') {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Email and password are required',
            life: 3000
        });

        loading.value = false;
    } else {
        axios
            .post(
                '/user/login/',
                {
                    client_id: import.meta.env.VITE_CLIENT_ID,
                    client_secret: import.meta.env.VITE_CLIENT_SECRET,
                    username: email.value,
                    password: password.value,
                    grant_type: 'password'
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    }
                }
            )
            .then((response) => {
                let allowedRoles = ['blog_manager', 'call_center', 'call_center_manager', 'customer_support_team', 'data_entry', 'data_entry_manager'];
                // check if any of allowedRoles array matches any of the response.data.roles array
                if (response.data.roles.some((role) => allowedRoles.includes(role))) {
                    store.commit('login', response.data);
                    const sessionExpiry = new Date().getTime() + 60 * 3 * 60 * 1000; // 3 hours
                    // Set it in localStorage
                    localStorage.setItem('sessionEndIn', sessionExpiry);
                    // Import and start session monitoring
                    import('@/service/session').then(({ startSessionMonitoring }) => {
                        startSessionMonitoring();
                    });
                    router.push({ name: 'pages' });
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Permission denied',
                        detail: 'You are not allowed to login',
                        life: 3000
                    });
                }
            })
            .catch((error) => {
                if (error.response) {
                    for (let key in error.response.data.errors) {
                        toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.response.data.errors[key].message,
                            life: 3000
                        });
                    }
                }
            })
            .finally(() => {
                loading.value = false;
            });
    }
};
</script>

<template>
    <Loading v-if="loading" />
    <Toast />
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Skyloov logo" class="mb-5 w-10rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" :feedback="false"></Password>

                        <!-- <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a>
                        </div> -->
                        <Button label="Sign In" class="w-full p-3 mt-3 text-xl" @click="login"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
