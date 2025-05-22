<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import router from '@/router';
import store from '@/store';
import { checkSession } from '@/service/session.js';

const pages = ref(null);
const deletePageDialog = ref(false);
const deletePagesDialog = ref(false);
const page = ref({});
const selectedPages = ref(null);
const dt = ref(null);
const filters = ref({});
const totalPages = ref(0);
const currentPage = ref(1);
const loading = ref(true);

onBeforeMount(() => {
    initFilters();
});

onMounted(() => {
    getPages(currentPage.value);
    checkSession();
});

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        pages.value = getPaginatedData();
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        pages.value = getPaginatedData();
    }
};

// get the page
const allPagesData = ref([]);
const itemsPerPage = 10;

const getPages = () => {
    loading.value = true;
    window.axios
        .get('/pages?per_page=100') // Get all pages at once
        .then((response) => {
            // Store all non-footer pages sorted by newest first
            allPagesData.value = response.data.data.filter((page) => !page.slug.startsWith('footer')).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Calculate total pages based on filtered data
            totalPages.value = Math.ceil(allPagesData.value.length / itemsPerPage);
            currentPage.value = 1;

            // Get first page of data
            pages.value = getPaginatedData();
        })
        .finally(() => {
            loading.value = false;
        });
};

const getPaginatedData = () => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return allPagesData.value.slice(start, end);
};

const confirmDeletePage = (editPage) => {
    page.value = editPage;
    deletePageDialog.value = true;
};

const deletePage = () => {
    loading.value = true;
    window.axios
        .delete('/pages/delete/?id=' + page.value.id)
        .then((response) => {
            pages.value = pages.value.filter((val) => val.id !== page.value.id);
            page.value = {};
            deletePageDialog.value = false;
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Successful',
                detail: response.data.message,
                life: 3000
            });
        })
        .then(() => {
            deletePageDialog.value = false;
            loading.value = false;
        });
};

const deleteSelectedPages = () => {
    pages.value = pages.value.filter((val) => !selectedPages.value.includes(val));
    deletePagesDialog.value = false;
    selectedPages.value = null;
    // toast.add({ severity: 'success', summary: 'Successful', detail: 'Pages Deleted', life: 3000 });
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
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="router.push({ name: 'create-pages' })" />
                            <!-- <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedPages || !selectedPages.length" /> -->
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="pages"
                    v-model:selection="selectedPages"
                    dataKey="id"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pages"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Pages</h5>
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
                                <Button icon="pi pi-history" class="p-button-rounded p-button-secondary mr-2" @click="router.push({ name: 'view-pages-history', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-folder" class="p-button-rounded p-button-info mr-2" @click="router.push({ name: 'manage-pages-blocks', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="router.push({ name: 'edit-pages', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeletePage(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <div class="paginator">
                    <Button label="Link" link class="paginator-previous" @click="prevPage" :disabled="currentPage === 1">
                        <icon icon="mingcute:left-fill" />
                    </Button>
                    <span class="paginator-current"> {{ currentPage }} </span>
                    <Button label="Link" link class="paginator-next" @click="nextPage" :disabled="currentPage === totalPages">
                        <icon icon="mingcute:right-fill" />
                    </Button>
                </div>

                <Dialog v-model:visible="deletePageDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="page"
                            >Are you sure you want to delete <b>{{ page.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deletePageDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePage" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deletePagesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="page">Are you sure you want to delete the selected pages?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deletePagesDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedPages" />
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
