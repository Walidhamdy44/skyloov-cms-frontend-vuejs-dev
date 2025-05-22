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
const seos = ref({
    title_en: '',
    title_ar: '',
    meta_discription: '',
    meta_discription_ar: '',
    meta_keywords: [],
    canonical_url_en: '',
    canonical_url_ar: ''
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
    if (!seos.value.canonical_url_en) {
        errors.value.canonical_url_en = 'The canonical url en field is required.';
        hasErrors = true;
    } else if (!/^(http|https):\/\/[^ "]+$/.test(seos.value.canonical_url_en)) {
        errors.value.canonical_url_en = 'The canonical url en field is not a valid URL';
        hasErrors = true;
    }
    // if (!seos.value.canonical_url_ar) {
    //     errors.value.canonical_url_ar = 'The canonical url ar field is required.';
    //     hasErrors = true;
    // } else if (!/^(http|https):\/\/[^ "]+$/.test(seos.value.canonical_url_ar)) {
    //     errors.value.canonical_url_ar = 'The canonical url ar field is not a valid URL';
    //     hasErrors = true;
    // }

    // check errors
    if (hasErrors) {
        loading.value = false;
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: 'Please check the errors',
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
                title_en: seos.value.title_en,
                title_ar: seos.value.title_ar,
                meta_discription: seos.value.meta_discription,
                meta_discription_ar: seos.value.meta_discription_ar,
                meta_keywords: seos.value.meta_keywords.join(','),
                canonical_url_en: seos.value.canonical_url_en,
                canonical_url_ar: seos.value.canonical_url_ar
            }
        })
        .then(() => {
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Page created successfully'
            });
            router.push({ name: 'pages' });
        })
        .catch((error) => {
            if (error.response) {
                // validation errors
                for (let key in error.response.data.errors) {
                    errors.value[key] = error.response.data.errors[key].message;
                }
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please check the errors'
                });
            }
        })
        .then(() => {
            loading.value = false;
        });
};

const isFormValid = computed(() => {
    if (!title.value.en) return false;
    if (!title.value.ar) return false;
    if (!slug.value) return false;
    if (!seos.value.canonical_url_en || !/^(http|https):\/\/[^ "]+$/.test(seos.value.canonical_url_en)) return false;

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
                <h5>Create Page</h5>
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
                        <InputText id="title" type="text" v-model="slug" placeholder="it-should-be-seperated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500 error-message">{{ errors.slug }}</span>
                    </div>
                    <h6 class="col-12">SEO</h6>
                    <div class="field col-12 md:col-6">
                        <label for="meta_title_en">Meta Title English</label>
                        <InputText id="meta_title_en" type="text" v-model="seos.title_en" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="meta_title_ar">Meta Title Arabic</label>
                        <InputText id="meta_title_ar" type="text" v-model="seos.title_ar" />
                    </div>
                    <div class="field col-12">
                        <label for="meta_description">Meta Description</label>
                        <Textarea id="meta_description" type="text" v-model="seos.meta_discription" separator="," />
                    </div>
                    <div class="field col-12">
                        <label for="meta_description_ar">Meta Description Arabic</label>
                        <Textarea id="meta_description_ar" type="text" v-model="seos.meta_discription_ar" separator="," />
                    </div>
                    <div class="field col-12">
                        <label for="meta_keywords">Meta Keywords <small>seperated by ,</small></label>
                        <Chips id="meta_keywords" type="text" v-model="seos.meta_keywords" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="canonical_url_en">Canonical URL English</label>
                        <InputText id="canonical_url_en" type="text" v-model="seos.canonical_url_en" />
                        <span v-if="errors.canonical_url_en" class="text-red-500">{{ errors.canonical_url_en }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="canonical_url_ar">Canonical URL Arabic</label>
                        <InputText id="canonical_url_ar" type="text" v-model="seos.canonical_url_ar" />
                        <span v-if="errors.canonical_url_ar" class="text-red-500">{{ errors.canonical_url_ar }}</span>
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
