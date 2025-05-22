<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router';
import store from '@/store';
import { checkSession } from '@/service/session.js';

const blogs = ref(null);
const deleteBlogDialog = ref(false);
const deleteBlogsDialog = ref(false);
const blog = ref({});
const selectedBlogs = ref(null);
const dt = ref(null);
const totalPages = ref(0);
const currentPage = ref(1);
const loading = ref(true);
const search = ref('');

onMounted(() => {
    getBlogs(currentPage.value);
    checkSession();
});
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        getBlogs(currentPage.value);
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        getBlogs(currentPage.value);
    }
};

// get the blogs
const getBlogs = (page_number) => {
    loading.value = true;
    window.axios
        .get('/blogs/?page=' + page_number)
        .then((response) => {
            blogs.value = response.data.data;
            totalPages.value = response.data.last_page;
            currentPage.value = response.data.current_page;
        })
        .finally(() => {
            loading.value = false;
        });
};

const searchBlogs = () => {
    loading.value = true;
    window.axios
        .get('/blogs/?search=' + search.value)
        .then((response) => {
            if (response.data.data.length === 0) {
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No blogs found'
                });
            } else {
                blogs.value = response.data.data;
                totalPages.value = response.data.last_page;
                currentPage.value = response.data.current_page;
            }
        })
        .catch((error) => {
            console.log(error.response.data);
            store.commit('setToastMessage', {
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.errors[0].message
            });
        })
        .finally(() => {
            loading.value = false;
        });
};

const headerImagePath = (slotProps) => {
    return slotProps.data.header_image ? slotProps.data.header_image.url : '';
};

const confirmDeleteBlog = (editBlog) => {
    blog.value = editBlog;
    deleteBlogDialog.value = true;
};

const deleteBlog = () => {
    loading.value = true;
    window.axios.delete('/blogs/delete/?id=' + blog.value.id).then((response) => {
        blogs.value = blogs.value.filter((val) => val.id !== blog.value.id);
        blog.value = {};
        deleteBlogDialog.value = false;
        store.commit('setToastMessage', {
            severity: 'success',
            summary: 'Successful',
            detail: response.data.message,
            life: 3000
        });
    });
    deleteBlogDialog.value = false;
    loading.value = false;
};

const deleteSelectedBlogs = () => {
    blogs.value = blogs.value.filter((val) => !selectedBlogs.value.includes(val));
    deleteBlogsDialog.value = false;
    selectedBlogs.value = null;
    // toast.add({ severity: 'success', summary: 'Successful', detail: 'Blogs Deleted', life: 3000 });
};

// Function to format the date
const formatDateTime = (dateString) => {
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
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="router.push({ name: 'create-blogs' })" />
                            <!-- <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedBlogs || !selectedBlogs.length" /> -->
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="blogs" v-model:selection="selectedBlogs" dataKey="id" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Blogs</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText placeholder="Search..." v-model="search" class="mr-2" />
                                <Button icon="pi pi-search" class="p-button-rounded p-button-outlined p-ml-2" @click="searchBlogs()" />
                            </span>
                        </div>
                    </template>

                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    <Column field="image" header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="headerImagePath(slotProps)" alt="image" class="image" style="width: 100px" />
                        </template>
                    </Column>

                    <Column field="title" header="Title" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Title</span>
                            {{ slotProps.data.title_en }}
                        </template>
                    </Column>

                    <Column field="status" header="Status" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="{ 'status-published': slotProps.data.is_published, 'status-draft': !slotProps.data.is_published }">
                                {{ slotProps.data.is_published ? 'Published' : 'Draft' }}
                            </span>
                        </template>
                    </Column>

                    <Column field="updated_at" header="Last Updated" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Last Updated</span>
                            {{ formatDateTime(slotProps.data.updated_at) }}
                        </template>
                    </Column>

                    <Column field="published_at" header="Publishing Date" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Publishing Date</span>
                            <span>
                                {{ slotProps.data.is_published ? formatDateTime(slotProps.data.published_at) : '---' }}
                            </span>
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="actions">
                                <Button icon="pi pi-history" class="p-button-rounded p-button-secondary mr-2" @click="router.push({ name: 'view-blogs-history', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-folder" class="p-button-rounded p-button-info mr-2" @click="router.push({ name: 'manage-blogs-blocks', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="router.push({ name: 'edit-blogs', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mr-2" @click="confirmDeleteBlog(slotProps.data)" />
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

                <Dialog v-model:visible="deleteBlogDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="blog"
                            >Are you sure you want to delete <b>{{ blog.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteBlogDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteBlog" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteBlogsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="blog">Are you sure you want to delete the selected blogs?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteBlogsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedBlogs" />
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

.status-published {
    background-color: green;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
}

.status-draft {
    background-color: red;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
}
</style>
