import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    redirect: '/pages',
                    component: () => import('@/views/Dashboard.vue')
                },
                // pages
                {
                    path: '/pages',
                    name: 'pages',
                    component: () => import('@/views/pages/pages/Index.vue')
                },
                {
                    path: '/pages/create',
                    name: 'create-pages',
                    component: () => import('@/views/pages/pages/Create.vue')
                },
                {
                    path: '/pages/:id/edit',
                    name: 'edit-pages',
                    component: () => import('@/views/pages/pages/Edit.vue')
                },
                {
                    path: '/pages/:id/blocks',
                    name: 'manage-pages-blocks',
                    component: () => import('@/views/pages/pages/Blocks.vue')
                },
                {
                    path: '/pages/:id/history',
                    name: 'view-pages-history',
                    component: () => import('@/views/pages/pages/History.vue')
                },
                // tags
                {
                    path: '/tags',
                    name: 'tags',
                    component: () => import('@/views/pages/tags/Index.vue')
                },
                {
                    path: '/tags/create',
                    name: 'create-tags',
                    component: () => import('@/views/pages/tags/Create.vue')
                },
                {
                    path: '/tags/:id/edit',
                    name: 'edit-tags',
                    component: () => import('@/views/pages/tags/Edit.vue')
                },
                {
                    path: '/tags/:id/history',
                    name: 'view-tags-history',
                    component: () => import('@/views/pages/tags/History.vue')
                },
                // blogs
                {
                    path: '/blogs',
                    name: 'blogs',
                    component: () => import('@/views/pages/blogs/Index.vue')
                },
                {
                    path: '/blogs/create',
                    name: 'create-blogs',
                    component: () => import('@/views/pages/blogs/Create.vue')
                },
                {
                    path: '/blogs/:id/edit',
                    name: 'edit-blogs',
                    component: () => import('@/views/pages/blogs/Edit.vue')
                },
                {
                    path: '/blogs/:id/blocks',
                    name: 'manage-blogs-blocks',
                    component: () => import('@/views/pages/blogs/Blocks.vue')
                },
                {
                    path: '/blogs/:id/history',
                    name: 'view-blogs-history',
                    component: () => import('@/views/pages/blogs/History.vue')
                },
                // contact
                {
                    path: '/contacts',
                    name: 'contacts',
                    component: () => import('@/views/pages/contacts/Index.vue')
                },
                {
                    path: '/contacts/:id/show',
                    name: 'show-contacts',
                    component: () => import('@/views/pages/contacts/Show.vue')
                },
                // Footers
                {
                    path: '/footers',
                    name: 'footers',
                    component: () => import('@/views/pages/footers/Index.vue')
                },
                {
                    path: '/footers/create',
                    name: 'create-footers',
                    component: () => import('@/views/pages/footers/Create.vue')
                },
                {
                    path: '/footers/:id/edit',
                    name: 'edit-footers',
                    component: () => import('@/views/pages/footers/Edit.vue')
                },
                {
                    path: '/footers/:id/blocks',
                    name: 'manage-footers-blocks',
                    component: () => import('@/views/pages/footers/Blocks.vue')
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('sessionEndIn');
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } else {
        next();
    }
});

export default router;
