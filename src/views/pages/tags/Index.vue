<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import router from '@/router';
import store from '@/store';
import { checkSession } from '@/service/session.js';

const tags = ref(null);
const deleteTagDialog = ref(false);
const deleteTagsDialog = ref(false);
const tag = ref({});
const selectedTags = ref(null);
const dt = ref(null);
const filters = ref({});
// const totalTags = ref(0);
// const currentPage = ref(1);
const loading = ref(true);

onBeforeMount(() => {
    initFilters();
});

onMounted(() => {
    getTags();
    checkSession();
});

// const nextPage = () => {
//     if (currentPage.value < totalTags.value) {
//         currentPage.value++;
//         getTags(currentPage.value);
//     }
// };

// const prevPage = () => {
//     if (currentPage.value > 1) {
//         currentPage.value--;
//         getTags(currentPage.value);
//     }
// };

// get the tag
const getTags = () => {
    loading.value = true;
    window.axios
        .get('/tags')
        .then((response) => {
            tags.value = response.data;
            // totalTags.value = response.data.last_tag;
            // currentPage.value = response.data.current_tag;
        })
        .finally(() => {
            loading.value = false;
        });
};
const confirmDeleteTag = (editTag) => {
    tag.value = editTag;
    deleteTagDialog.value = true;
};

const deleteTag = () => {
    loading.value = true;
    window.axios.delete('/tags/delete/?id=' + tag.value.id).then((response) => {
        tags.value = tags.value.filter((val) => val.id !== tag.value.id);
        tag.value = {};
        deleteTagDialog.value = false;
        store.commit('setToastMessage', {
            severity: 'success',
            summary: 'Successful',
            detail: response.data.message,
            life: 3000
        });
    });
    deleteTagDialog.value = false;
    loading.value = false;
};

const deleteSelectedTags = () => {
    tags.value = tags.value.filter((val) => !selectedTags.value.includes(val));
    deleteTagsDialog.value = false;
    selectedTags.value = null;
    // toast.add({ severity: 'success', summary: 'Successful', detail: 'Tags Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="router.push({ name: 'create-tags' })" />
                            <!-- <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedTags || !selectedTags.length" /> -->
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="tags" v-model:selection="selectedTags" dataKey="id" :paginator="true" :rows="10" :filters="filters" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Tags</h5>
                        </div>
                    </template>

                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    <Column field="title" header="Title" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Title</span>
                            {{ slotProps.data.title_en }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="actions">
                                <Button icon="pi pi-history" class="p-button-rounded p-button-secondary mr-2" @click="router.push({ name: 'view-tags-history', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="router.push({ name: 'edit-tags', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteTag(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="deleteTagDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="tag"
                            >Are you sure you want to delete <b>{{ tag.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteTagDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteTag" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteTagsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="tag">Are you sure you want to delete the selected tags?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteTagsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedTags" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>

<style scoped>
.actions {
    display: flex;
    justify-content: end;
    align-items: center;
}

.paginator {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
}

.paginator-current {
    margin: 0 1rem;
}

.paginator-previous,
.paginator-next {
    border: none;
    background: none;
    cursor: pointer;
    outline: none;
    opacity: 0.6;
}
</style>
