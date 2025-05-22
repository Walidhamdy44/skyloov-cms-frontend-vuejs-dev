<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import store from '@/store';
import Dialog from 'primevue/dialog';
import Avatar from 'primevue/avatar';
import '@/layout/Layout.scss';
const visible = ref(false);

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const userData = store.state.user;
const session = localStorage.getItem('sessionEndIn');
const logout = () => {
    session && localStorage.removeItem('sessionEndIn');
    store.commit('logout');
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="'/layout/images/logo-dark.svg'" alt="logo" style="height: 100%; width: auto" />
            <!-- <span>CMS</span> -->
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <div>
                <Button label="Show" @click="visible = true"> <i class="pi pi-user"></i> </Button>
                <Dialog v-model:visible="visible" modal header="User Profile" :style="{ width: '30rem' }">
                    <div class="user-profile-card">
                        <div class="profile-header">
                            <Avatar :image="userData.image || 'https://www.gravatar.com/avatar?d=mp'" size="xlarge" shape="circle" />
                            <h3>{{ userData.first_name }} {{ userData.last_name }}</h3>
                            <p>@{{ userData.username }}</p>
                        </div>

                        <div class="profile-details">
                            <p><strong>Email:</strong> {{ userData.email }}</p>
                            <p><strong>Phone:</strong> {{ userData.phone_number_country_code }} {{ userData.phone_number }}</p>
                            <p><strong>Verified:</strong> {{ userData.is_verified ? 'Yes' : 'No' }}</p>
                            <p><strong>Last Login:</strong> {{ userData.last_login }}</p>
                        </div>

                        <div class="flex justify-end gap-2 mt-4">
                            <Button type="button" label="Close" severity="secondary" @click="visible = false"></Button>
                        </div>
                    </div>
                </Dialog>
            </div>

            <Button severity="danger" text rounded aria-label="Cancel" class="p-link layout-topbar-button" @click="logout()">
                <i class="pi pi-sign-out"></i>
                <span>Logout</span>
            </Button>
        </div>
    </div>
</template>
