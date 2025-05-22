<script setup>
import { ref } from 'vue';
import router from '@/router';
import store from '@/store';

// loading
const loading = ref(false);

// errors
const errors = ref({
    title_en: '',
    title_ar: '',
    slug: '',
    slug_ar: ''
});

// tag details
const title = ref({ en: '', ar: '' });
const slug = ref('');
const slugAr = ref('');

// submit
const submit = () => {
    // loading
    loading.value = true;
    let hasErrors = false;
    // reset errors
    errors.value = {
        title_en: '',
        title_ar: '',
        slug: '',
        slug_ar: ''
    };
    // check errors
    if (!title.value.en) {
        errors.value.title_en = 'Title English is required';
        hasErrors = true;
    }
    if (!title.value.ar) {
        errors.value.title_ar = 'Title Arabic is required';
        hasErrors = true;
    }
    if (!slug.value) {
        errors.value.slug = 'Slug English is required';
        hasErrors = true;
    }
    if (!slugAr.value) {
        errors.value.slug_ar = 'Slug Arabic is required';
        hasErrors = true;
    }
    if (hasErrors) {
        loading.value = false;
        return;
    }

    // prepare form data
    let formData = new FormData();
    formData.append('title_en', title.value.en);
    formData.append('title_ar', title.value.ar);
    formData.append('slug', slug.value);
    formData.append('slug_ar', slugAr.value);

    // submit
    window.axios
        .post('/tags/create/', formData)
        .then(() => {
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Tag created successfully'
            });
            router.push({ name: 'tags' });
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
        .finally(() => {
            loading.value = false;
        });
};
</script>

<template>
    <Toast />
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- tag details -->
        <div class="col-12">
            <div class="card">
                <h5>Create Tag</h5>
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
                    <div class="field col-12 md:col-6">
                        <label for="title">Slug English</label>
                        <InputText id="title" type="text" v-model="slug" placeholder="it-should-be-seperated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500">{{ errors.slug }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="slugAr">Slug Arabic</label>
                        <InputText id="slugAr" type="text" v-model="slugAr" placeholder="يجب-فصلها-بالشرطات" />
                        <span v-if="errors.slug_ar" class="text-red-500">{{ errors.slug_ar }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- submit -->
        <div class="col-12">
            <div class="card flex justify-content-end">
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <Button label="Submit" icon="pi pi-plus" @click="submit" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
