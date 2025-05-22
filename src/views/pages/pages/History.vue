<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import store from '@/store';

const route = useRoute();
const histories = ref([]);
const loading = ref(true);

const userId = store.state.user.id;

onMounted(() => {
    fetchHistory(route.params.id);
});

const getFullName = (details) => {
    return details?.first_name && details?.last_name ? `${details.first_name} ${details.last_name}` : 'Skyloov Admin';
};

const fetchHistory = async (pageId) => {
    loading.value = true;
    try {
        const response = await window.axios.get(`/pages/show?id=${pageId}`);
        const pageData = response.data;

        const createdBy = getFullName(pageData.created_by_details);
        const updatedBy = getFullName(pageData.updated_by_details);

        histories.value = [
            {
                created_at: pageData.created_at,
                updated_at: pageData.updated_at,
                created_by: {
                    id: pageData.created_by,
                    name: createdBy
                },
                updated_by: {
                    id: pageData.updated_by ?? pageData.created_by,
                    name: updatedBy
                },
                published_at: pageData.published_at,
                is_published: pageData.is_published
            }
        ];
    } catch (error) {
        console.error('Error fetching page data:', error);
    } finally {
        loading.value = false;
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return '---';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
};

const formatUser = (eventUser) => {
    return userId === eventUser.id ? 'You' : eventUser.name || 'Skyloov Admin';
};
</script>

<template>
    <div class="history-container">
        <h2>Activity</h2>
        <div v-for="(history, index) in histories" :key="index" class="history-card">
            <!-- Created Section -->
            <div class="history-box">
                <p>
                    <span :style="{ color: userId === history.created_by.id ? 'blue' : 'inherit' }">
                        {{ formatUser(history.created_by) }}
                    </span>
                    <strong> Created page at</strong> {{ formatDateTime(history.created_at) }}
                </p>
            </div>

            <!-- Published Section -->
            <div v-if="history.is_published" class="history-box">
                <p>
                    <span :style="{ color: userId === history.created_by.id ? 'blue' : 'inherit' }">
                        {{ formatUser(history.created_by) }}
                    </span>
                    <strong> Published page at</strong> {{ formatDateTime(history.published_at) }}
                </p>
            </div>

            <!-- Updated Section -->
            <div class="history-box">
                <p>
                    <span :style="{ color: userId === history.updated_by.id ? 'blue' : 'inherit' }">
                        {{ formatUser(history.updated_by) }}
                    </span>
                    <strong> Updated page at</strong> {{ formatDateTime(history.updated_at) }}
                </p>
            </div>
        </div>
    </div>
</template>
