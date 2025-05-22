<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import store from '@/store';
import CKEditor from '@/components/CKEditor.vue';
import FooterDialog from '@/components/FooterDialog.vue';

const loading = ref(true);
const errors = ref([]);
const blocks = ref([]);
const blogData = ref(null);
const dialogVisible = ref(false);

// Load footer blocks
onMounted(() => {
    const id = router.currentRoute.value.params.id;
    if (id) {
        getFooterBlocks(id);
    } else {
        loading.value = false;
    }
});

const getFooterBlocks = async (id) => {
    loading.value = true;
    try {
        const response = await window.axios.get(`/pages/show?id=${id}`);
        blocks.value = response.data.blocks.filter((b) => b.type === 'text');
        blogData.value = response.data;
    } catch (error) {
        router.push({ name: 'pages' });
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load footer data'
        });
    } finally {
        loading.value = false;
    }
};

const addTextBlock = () => {
    blocks.value.push({
        type: 'text',
        source: 'all',
        title_en: '',
        title_ar: '',
        content_en: '',
        content_ar: '',
        isNew: true
    });
};

const submitBlock = async (block) => {
    loading.value = true;
    errors.value = [];

    if (!block.title_en || !block.title_ar || !block.content_en || !block.content_ar) {
        errors.value.push('All fields are required.');
        loading.value = false;
        return;
    }

    const formData = new FormData();
    for (const key in block) {
        if (!['isNew', 'changed', 'media'].includes(key)) {
            formData.append(key, block[key]);
        }
    }

    formData.append('blockable[id]', router.currentRoute.value.params.id);
    formData.append('blockable[type]', 'page');

    let url = '/blocks/create/';
    if (block.id) {
        formData.append('id', block.id);
        formData.append('_method', 'PUT');
        url = '/blocks/update/';
    }

    try {
        await window.axios.post(url, formData);
        store.commit('setToastMessage', {
            severity: 'success',
            summary: 'Success',
            detail: 'Block saved successfully'
        });
        await getFooterBlocks(router.currentRoute.value.params.id);
    } catch (error) {
        let errorMessages = 'Could not save block';
        if (error.response && error.response.data && Array.isArray(error.response.data.errors)) {
            errorMessages = error.response.data.errors
                .map((e) => e.message)
                .filter(Boolean)
                .join('<br />');
        }
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: errorMessages
        });
    } finally {
        loading.value = false;
    }
};
const isBlockValid = (block) => {
    return block.title_en && block.title_ar && block.content_en && block.content_ar;
};
const deleteBlock = async (block, index) => {
    if (!block.id) {
        blocks.value.splice(index, 1);
        return;
    }

    loading.value = true;
    try {
        await window.axios.delete(`/blocks/delete/?id=${block.id}`);
        store.commit('setToastMessage', {
            severity: 'success',
            summary: 'Deleted',
            detail: 'Block deleted'
        });
        await getFooterBlocks(router.currentRoute.value.params.id);
    } catch {
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: 'Could not delete block'
        });
    } finally {
        loading.value = false;
    }
};

const previewFooter = () => {
    dialogVisible.value = true;
};
</script>

<template>
    <Loading v-if="loading" />
    <div v-else class="grid">
        <div class="col-12" v-if="errors.length">
            <div class="card">
                <h5>Errors</h5>
                <ul>
                    <li v-for="(error, i) in errors" :key="i" class="text-red-500">{{ error }}</li>
                </ul>
            </div>
        </div>

        <!-- Main Text Block Editor -->
        <div class="col-12">
            <div class="card main-card">
                <h5>Footer Content</h5>
                <div v-for="(block, index) in blocks" :key="index" class="mb-4 border-b pb-4">
                    <div class="grid">
                        <div class="field col-6">
                            <label>Title (English)</label>
                            <InputText v-model="block.title_en" style="width: 100%" />
                        </div>
                        <div class="field col-6">
                            <label>Title (Arabic)</label>
                            <InputText v-model="block.title_ar" style="width: 100%" />
                        </div>
                        <div class="field col-12">
                            <label>Content (English)</label>
                            <CKEditor v-model:modelValue="block.content_en" />
                        </div>
                        <div class="field col-12">
                            <label>Content (Arabic)</label>
                            <CKEditor v-model:modelValue="block.content_ar" />
                        </div>
                    </div>
                    <div class="flex gap-3 mt-3">
                        <Button label="Save" icon="pi pi-save" class="p-button-success" @click="submitBlock(block)" :disabled="!isBlockValid(block)" />
                        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteBlock(block, index)" v-if="blocks.length > 1" />
                    </div>
                </div>

                <div class="text-center" v-if="blocks.length < 1">
                    <Button label="Add Text Block" icon="pi pi-plus" class="p-button-primary" @click="addTextBlock" />
                </div>
            </div>
        </div>

        <!-- Preview Button -->
        <div class="col-12 text-center mt-4">
            <Button label="Preview Footer" icon="pi pi-eye" class="p-button-secondary" @click="previewFooter" />
        </div>

        <!-- Footer Preview Dialog -->
        <Dialog v-model:visible="dialogVisible" modal header="Footer Preview" :style="{ width: '90rem' }">
            <FooterDialog :blocks="blocks" :blogData="blogData" />
            <div class="text-right mt-3">
                <Button label="Close" @click="dialogVisible = false" />
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
/* Main Card Styling */
.main-card {
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
