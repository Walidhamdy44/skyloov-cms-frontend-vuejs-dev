<script setup>
import { computed, onMounted, ref } from 'vue';
import router from '@/router';
import store from '@/store';

// loading
const loading = ref(true);

// errors
const errors = ref({
    title_en: '',
    title_ar: '',
    slug: '',
    meta_discription: '',
    meta_discription_ar: '',
    meta_keywords: '',
    canonical_url_en: '',
    canonical_url_ar: ''
});

// page details
const title = ref({ en: '', ar: '' });
const slug = ref('');

// get the data from api
onMounted(() => {
    if (router.currentRoute.value.params.id) {
        window.axios
            .get(`/pages/show?id=${router.currentRoute.value.params.id}`)
            .then((response) => {
                // set the data
                title.value.en = response.data.title_en;
                title.value.ar = response.data.title_ar;
                slug.value = response.data.slug;
            })
            .catch(() => {
                // redirect to footers
                router.push({ name: 'footers' });
                // toast
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong'
                });
            })
            .then(() => {
                loading.value = false;
            });
    } else {
        // loading
        loading.value = false;
    }
});

// submit
const submit = () => {
    // loading
    loading.value = true;

    // reset errors
    errors.value = {};

    // check errors
    let hasErrors = false;

    // Validate required fields
    if (!title.value.en) {
        errors.value.title_en = 'The title en field is required.';
        hasErrors = true;
    }
    if (!title.value.ar) {
        errors.value.title_ar = 'The title ar field is required.';
        hasErrors = true;
    }
    if (!slug.value) {
        errors.value.slug = 'The slug field is required.';
        hasErrors = true;
    }

    // If there are validation errors, stop submission
    if (hasErrors) {
        loading.value = false;
        const errorMessages = Object.values(errors.value).filter(Boolean).join('<br />');
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: errorMessages,
            life: 3000
        });
        return;
    }

    // submit
    window.axios
        .put(`/pages/update/`, {
            id: router.currentRoute.value.params.id,
            title_en: title.value.en,
            title_ar: title.value.ar,
            slug: slug.value,
            seos: {
                title_en: title.value.en,
                title_ar: title.value.ar,
                meta_discription: title.value.en,
                meta_discription_ar: title.value.ar,
                // meta_keywords: seos.value.meta_keywords.join(','),
                canonical_url_en: 'https://www.skyloov.com/search/for-buy/property',
                canonical_url_ar: 'https://www.skyloov.com/ar/search/for-buy/property'
            }
        })
        .then(() => {
            // toast
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Footer updated successfully',
                life: 3000
            });
            // redirect to pages
            router.push({ name: 'footers' });
        })
        .catch((error) => {
            // check if there are errors
            if (error.response.data.errors) {
                // set errors
                for (let key in error.response.data.errors) {
                    errors.value[key] = error.response.data.errors[key].message;
                }
                const errorMessages = Object.values(errors.value).join('<br />');
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessages,
                    life: 3000
                });
            } else {
                // toast
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong',
                    life: 3000
                });
            }
        });

    // loading
    loading.value = false;
};

const isFormValid = computed(() => {
    // Check required fields
    if (!title.value.en) return false;
    if (!title.value.ar) return false;
    if (!slug.value || !/^footer(-|$)/.test(slug.value)) return false;
    return true;
});
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- page details -->
        <div class="col-12">
            <div class="card">
                <h5>Update Footer</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="title">Title English</label>
                        <InputText id="title" type="text" v-model="title.en" />
                        <span v-if="errors.title_en" class="text-red-500">{{ errors.title_en }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="title">Title Arabic</label>
                        <InputText id="title" type="text" v-model="title.ar" />
                        <span v-if="errors.title_ar" class="text-red-500">{{ errors.title_ar }}</span>
                    </div>
                    <div class="field col-12">
                        <label for="title">Slug</label>
                        <InputText id="title" type="text" v-model="slug" disabled placeholder="it-should-be-seperated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500">{{ errors.slug }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- submit -->
        <div class="col-12">
            <div class="card flex justify-content-end">
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <Button label="Submit" icon="pi pi-check" @click="submit" :disabled="!isFormValid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
