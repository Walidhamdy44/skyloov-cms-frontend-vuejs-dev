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

const fetchHistory = async (blogId) => {
    loading.value = true;
    try {
        const response = await window.axios.get(`/blogs/show?id=${blogId}`);
        const blogData = response.data;

        // Helper to get full name from details
        const getFullName = (details) => {
            return details?.first_name && details?.last_name ? `${details.first_name} ${details.last_name}` : 'Skyloov Admin';
        };

        const createdBy = blogData.created_by;
        const updatedBy = blogData.updated_by ?? createdBy;

        const createdByName = getFullName(blogData.created_by_details);
        const updatedByName = getFullName(blogData.updated_by_details);

        const blogHistory = {
            type: 'blog',
            title: blogData.title_en || 'Blog History',
            events: [
                {
                    action: 'Created blog',
                    by: createdBy,
                    name: createdByName,
                    at: blogData.created_at
                },
                {
                    action: 'Updated blog',
                    by: updatedBy,
                    name: updatedByName,
                    at: blogData.updated_at
                }
            ]
        };

        if (blogData.is_published && blogData.published_at) {
            blogHistory.events.push({
                action: 'Published blog',
                by: createdBy,
                name: createdByName,
                at: blogData.published_at
            });
        }

        // Block history entries
        const blockHistories =
            blogData.blocks?.map((block) => {
                const blockCreatedBy = block.created_by || 'Skyloov Admin';
                const blockUpdatedBy = block.updated_by || blockCreatedBy;

                const blockTitle = block.title_en || `Block #${block.id} (${block.type})`;

                const events = [
                    {
                        action: 'Created block',
                        by: blockCreatedBy,
                        name: blockCreatedBy,
                        at: block.created_at
                    }
                ];

                if (block.updated_at && block.updated_at !== block.created_at) {
                    events.push({
                        action: 'Updated block',
                        by: blockUpdatedBy,
                        name: blockUpdatedBy,
                        at: block.updated_at
                    });
                }

                return {
                    type: 'block',
                    title: blockTitle,
                    events
                };
            }) || [];

        histories.value = [blogHistory, ...blockHistories];
    } catch (error) {
        console.error('Error fetching blog data:', error);
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

const formatUser = (userId, event) => {
    return userId === event.by ? 'You' : event.name || event.by;
};
</script>

<template>
    <div class="history-container">
        <h2>Activity</h2>

        <!-- Blog History -->
        <div v-if="histories.length" class="history-card">
            <h3 class="block-title">{{ histories[0].title }}</h3>
            <div v-for="(event, i) in histories[0].events" :key="i" class="history-box">
                <p>
                    <span :style="{ color: userId === event.by ? 'blue' : 'inherit', fontWeight: userId === event.by ? 'bold' : 'normal', padding: '0 5px' }">
                        {{ formatUser(userId, event) }}
                    </span>
                    <strong> {{ event.action }} at</strong> {{ formatDateTime(event.at) }}
                </p>
            </div>
        </div>

        <!-- Divider & Block Section -->
        <div v-if="histories.length > 1">
            <hr class="divider" />
            <h3 class="section-title">Blocks History</h3>

            <div v-for="(historyGroup, index) in histories.slice(1)" :key="index" class="history-card">
                <h4 class="block-title">{{ historyGroup.title }}</h4>
                <div v-for="(event, i) in historyGroup.events" :key="i" class="history-box">
                    <p>
                        <span :style="{ color: userId === event.by ? 'blue' : 'inherit' }">
                            {{ formatUser(userId, event) }}
                        </span>
                        <strong> {{ event.action }} at</strong> {{ formatDateTime(event.at) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
