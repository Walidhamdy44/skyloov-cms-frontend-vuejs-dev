<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import router from '@/router';
import store from '@/store';
import { checkSession } from '@/service/session.js';

const contacts = ref(null);
const deleteContactDialog = ref(false);
const deleteContactsDialog = ref(false);
const contact = ref({});
const selectedContacts = ref(null);
const dt = ref(null);
const filters = ref({});
const totalPages = ref(0);
const currentPage = ref(1);
const loading = ref(true);

onBeforeMount(() => {
    initFilters();
});

onMounted(() => {
    getContacts();
    checkSession();
});

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        getContacts(currentPage.value);
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        getContacts(currentPage.value);
    }
};

// get the contact
const getContacts = (page_number) => {
    loading.value = true;
    window.axios
        .get('/messages?page=' + page_number)
        .then((response) => {
            contacts.value = response.data.data;
            totalPages.value = response.data.last_page;
            currentPage.value = response.data.current_page;
        })
        .finally(() => {
            loading.value = false;
        });
};
const confirmDeleteContact = (editContact) => {
    contact.value = editContact;
    deleteContactDialog.value = true;
};

const deleteContact = () => {
    loading.value = true;
    window.axios.delete('/messages/delete?id=' + contact.value.id).then((response) => {
        contacts.value = contacts.value.filter((val) => val.id !== contact.value.id);
        contact.value = {};
        deleteContactDialog.value = false;
        store.commit('setToastMessage', {
            severity: 'success',
            summary: 'Successful',
            detail: response.data.message,
            life: 3000
        });
    });
    deleteContactDialog.value = false;
    loading.value = false;
};

const deleteSelectedContacts = () => {
    contacts.value = contacts.value.filter((val) => !selectedContacts.value.includes(val));
    deleteContactsDialog.value = false;
    selectedContacts.value = null;
    // toast.add({ severity: 'success', summary: 'Successful', detail: 'Contacts Deleted', life: 3000 });
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
                <DataTable ref="dt" :value="contacts" v-model:selection="selectedContacts" dataKey="id" :rows="10" :filters="filters" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Contacts</h5>
                        </div>
                    </template>

                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    <Column field="from" header="From" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-from"></span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="subject" header="Subject" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-subject"></span>
                            {{ slotProps.data.subject }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="actions">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-secondary mr-2" @click="router.push({ name: 'show-contacts', params: { id: slotProps.data.id } })" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteContact(slotProps.data)" />
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

                <Dialog v-model:visible="deleteContactDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="contact"
                            >Are you sure you want to delete <b>{{ contact.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteContactDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteContact" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteContactsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="contact">Are you sure you want to delete the selected contacts?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteContactsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedContacts" />
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
