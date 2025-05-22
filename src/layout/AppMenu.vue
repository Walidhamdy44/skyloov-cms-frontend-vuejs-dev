<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        // label: 'Home',
        items: [
            // { label: 'Dashboard', icon: 'mingcute:dashboard-3-fill', to: 'dashboard' },
            { label: 'Pages', icon: 'mdi:page-next', to: 'pages' },
            { label: 'Tags and Categories', icon: 'fa:tags', to: 'tags' },
            { label: 'Blogs', icon: 'fa-brands:blogger', to: 'blogs' },
            { label: 'Contacts', icon: 'fa:address-book', to: 'contacts' },
            { label: 'Footers', icon: 'fa:bars', to: 'footers' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
