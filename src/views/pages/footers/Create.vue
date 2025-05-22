<script setup>
import { computed, ref } from 'vue';
import router from '@/router';
import store from '@/store';

// loading
const loading = ref(false);

// errors
const errors = ref({
    title_en: '',
    title_ar: '',
    slug: ''
});

// page details
const title = ref({ en: '', ar: '' });
const slug = ref('');
// const seos = ref({
//     title_en: '',
//     title_ar: '',
//     meta_discription: '',
//     meta_discription_ar: '',
//     meta_keywords: [],
//     canonical_url_en: '',
//     canonical_url_ar: ''
// });

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
    } else if (!/^footer(-|$)/.test(slug.value)) {
        errors.value.slug = 'The slug must start with "footer".';
        hasErrors = true;
    }

    // check errors
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
        .post('/pages/create/', {
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
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Footer Created successfully'
            });
            router.push({ name: 'footers' });
        })
        .catch((error) => {
            if (error.response && error.response.data.errors) {
                // validation errors
                for (let key in error.response.data.errors) {
                    errors.value[key] = error.response.data.errors[key].message;
                }
                const errorMessages = Object.values(errors.value).filter(Boolean).join('<br />');
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessages
                });
            }
        })
        .then(() => {
            loading.value = false;
        });
};

const isFormValid = computed(() => {
    // Check required fields
    if (!title.value.en) return false;
    if (!title.value.ar) return false;
    if (!slug.value || !/^footer(-|$)/.test(slug.value)) return false;

    // No errors found, form is valid
    return true;
});
</script>

<template>
    <Toast />
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- page details -->
        <div class="col-12">
            <div class="card">
                <h5>Create Footer</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="title">Title English</label>
                        <InputText id="title" type="text" v-model="title.en" />
                        <span v-if="errors.title_en" class="text-red-500 error-message">{{ errors.title_en }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="title">Title Arabic</label>
                        <InputText id="title" type="text" v-model="title.ar" />
                        <span v-if="errors.title_ar" class="text-red-500 error-message">{{ errors.title_ar }}</span>
                    </div>
                    <div class="field col-12">
                        <label for="title">Slug</label>
                        <InputText id="title" type="text" v-model="slug" placeholder="it-must-start-with-footer-seperated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500 error-message">{{ errors.slug }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- submit -->
        <div class="col-12">
            <div class="card flex justify-content-end">
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <Button label="Submit" icon="pi pi-plus" @click="submit" :disabled="!isFormValid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
