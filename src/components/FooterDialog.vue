<script setup>
import { defineProps, ref, computed, watchEffect } from 'vue';
import SelectButton from 'primevue/selectbutton';
import './blog-preview.css';

const props = defineProps({
    blogData: {
        type: Object,
        required: true
    }
});

const selectedLanguage = ref('en');
const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' }
];

const blocks = computed(() => props.blogData.blocks || []);

watchEffect(() => {
    console.log('FooterDialog blogData:', props.blogData);
    console.log('FooterDialog blocks:', blocks.value);
});
const createdBy = computed(() => {
    const details = props.blogData.created_by_details;
    return details ? `${details.first_name} ${details.last_name} (${details.email})` : 'N/A';
});

const createdAt = computed(() => {
    return props.blogData.created_at ? new Date(props.blogData.created_at).toLocaleString() : 'Unknown';
});
</script>

<template>
    <div class="footer-preview px-4 py-6">
        <!-- Language Toggle -->
        <SelectButton v-model="selectedLanguage" :options="languageOptions" optionLabel="label" optionValue="value" class="mb-4" />

        <!-- Metadata -->
        <div class="mb-6 border-b pb-4">
            <h2 class="text-2xl font-bold">
                {{ selectedLanguage === 'en' ? blogData.title_en : blogData.title_ar }}
            </h2>
            <p class="text-sm text-gray-600">Slug: {{ blogData.slug }}</p>
            <p class="text-sm text-gray-600">Created By: {{ createdBy }}</p>
            <p class="text-sm text-gray-600">Created At: {{ createdAt }}</p>
        </div>

        <!-- Content Blocks -->
        <div v-for="(block, index) in blocks" :key="index" :class="{ rtl: selectedLanguage === 'ar' }" class="mb-6">
            <template v-if="block.type === 'text'">
                <div>
                    <h3 class="text-lg font-semibold mb-2">
                        {{ selectedLanguage === 'en' ? block.title_en : block.title_ar }}
                    </h3>
                    <div class="text-gray-700" v-html="selectedLanguage === 'en' ? block.content_en : block.content_ar" />
                </div>
            </template>

            <template v-else-if="block.type === 'image'">
                <div class="flex flex-col items-center">
                    <img :src="block.media?.url" :alt="selectedLanguage === 'en' ? block.media?.alt_text_en : block.media?.alt_text_ar" class="max-w-full h-auto" />
                    <p class="text-sm text-gray-500 mt-2">
                        {{ selectedLanguage === 'en' ? block.media?.alt_text_en : block.media?.alt_text_ar }}
                    </p>
                </div>
            </template>

            <template v-else-if="block.type === 'video'">
                <video :src="block.media?.url" controls class="w-full h-auto"></video>
            </template>

            <template v-else-if="block.type === 'audio'">
                <audio :src="block.media?.url" controls class="w-full"></audio>
            </template>

            <template v-else-if="block.type === 'file'">
                <a :href="block.media?.url" target="_blank" class="text-blue-500 underline">Download File</a>
            </template>

            <template v-else-if="block.type === 'accordion'">
                <div class="mb-2">
                    <h3 class="text-lg font-semibold mb-1">
                        {{ selectedLanguage === 'en' ? block.title_en : block.title_ar }}
                    </h3>
                    <p class="text-gray-700">
                        {{ selectedLanguage === 'en' ? block.content_en : block.content_ar }}
                    </p>
                </div>
            </template>

            <template v-else>
                <p class="text-red-500">Unsupported block type: {{ block.type }}</p>
            </template>
        </div>
    </div>
</template>

<style scoped>
.rtl {
    direction: rtl;
    text-align: right;
}
</style>
