<script setup>
import { defineProps, ref, computed } from 'vue';
import SelectButton from 'primevue/selectbutton';
import './blog-preview.css';

// Accept the blocks and blogData as props
const props = defineProps({
    blocks: {
        type: Array,
        required: true,
        default: () => []
    },
    blogData: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

// Language selection state
const selectedLanguage = ref('en');
const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' }
];

console.log(props.blocks);
// Computed property for formatted date
const formattedDate = computed(() => {
    return new Date(props.blogData.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
});

const sortedBlocks = computed(() => {
    return [...props.blocks].sort((a, b) => {
        if (a.type === 'accordion' && b.type !== 'accordion') return 1;
        if (b.type === 'accordion' && a.type !== 'accordion') return -1;
        return 0;
    });
});
</script>

<template>
    <div class="blog-preview">
        <!-- Language Toggle -->
        <SelectButton v-model="selectedLanguage" :options="languageOptions" optionLabel="label" optionValue="value" class="mb-4" />

        <!-- Blog Title and Header Section -->
        <div :class="['blog-header', { rtl: selectedLanguage === 'ar' }]" class="mb-6">
            <h1 class="blog-title text-3xl font-bold mb-2">
                {{ selectedLanguage === 'en' ? blogData.title_en : blogData.title_ar }}
            </h1>
            <img v-if="blogData.header_image" :src="blogData.header_image.url" alt="Header Image" class="header-image mb-4" />
            <p class="created-at text-gray-500 mb-4">{{ formattedDate }}</p>
        </div>

        <!-- Blog Content Blocks -->
        <div v-for="(block, index) in sortedBlocks" :key="index" :class="{ rtl: selectedLanguage === 'ar' }" class="mb-6">
            <template v-if="block.type === 'text'">
                <!-- Render Text Blocks -->
                <div>
                    <h3 class="text-xl font-semibold mb-2">
                        {{ selectedLanguage === 'en' ? block.title_en || 'Untitled (EN)' : block.title_ar || 'Untitled (AR)' }}
                    </h3>
                    <div class="content mb-2" v-html="selectedLanguage === 'en' ? block.content_en : block.content_ar" style="color: gray"></div>
                </div>
            </template>

            <template v-else-if="block.type === 'image'">
                <!-- Render Image Blocks -->
                <div class="flex flex-col items-center">
                    <img :src="block.media ? block.media.url : ''" :alt="selectedLanguage === 'en' ? block.alt_text_en : block.alt_text_ar" class="max-w-full h-auto" />
                    <p class="text-sm text-gray-500 mt-2">{{ selectedLanguage === 'en' ? block.alt_text_en : block.alt_text_ar }}</p>
                </div>
            </template>

            <template v-else-if="block.type === 'video'">
                <!-- Render Video Blocks -->
                <div class="flex justify-center">
                    <video :src="block.media ? block.media.url : ''" controls class="max-w-full"></video>
                </div>
            </template>

            <template v-else-if="block.type === 'audio'">
                <!-- Render Audio Blocks -->
                <div class="flex justify-center">
                    <audio :src="block.media ? block.media.url : ''" controls></audio>
                </div>
            </template>

            <template v-else-if="block.type === 'file'">
                <!-- Render File Blocks -->
                <div class="text-center">
                    <a :href="block.media ? block.media.url : ''" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline"> Download File </a>
                </div>
            </template>
            <template v-else-if="block.type === 'accordion'">
                <div class="faq-section">
                    <!-- Replace Accordion and AccordionTab with a simple div structure -->
                    <div class="accordion-item">
                        <h3 class="text-xl font-semibold mb-2">
                            {{ selectedLanguage === 'en' ? block.title_en : block.title_ar }}
                        </h3>
                        <p class="content mb-2">
                            {{ selectedLanguage === 'en' ? block.content_en : block.content_ar }}
                        </p>
                    </div>
                </div>
            </template>
            <template v-else>
                <!-- Handle unknown block types -->
                <p class="text-red-500">Unknown block type: {{ block.type }}</p>
            </template>
        </div>
    </div>
</template>
