<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import store from '@/store';

// loading
const loading = ref(true);

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

// get the data from api
onMounted(() => {
    if (router.currentRoute.value.params.id) {
        window.axios
            .get(`/tags/show?id=${router.currentRoute.value.params.id}`)
            .then((response) => {
                // set the data
                title.value.en = response.data.title_en;
                title.value.ar = response.data.title_ar;
                slug.value = response.data.slug;
                slugAr.value = response.data.slug_ar;
            })
            .catch(() => {
                // redirect to tags
                router.push({ name: 'tags' });
                // toast
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong'
                });
            });
        loading.value = false;
    } else {
        // loading
        loading.value = false;
    }
});

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

    // validate
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
    // check errors
    if (hasErrors) {
        loading.value = false;
        return;
    }

    // prepare form data
    let formData = new FormData();
    formData.append('id', router.currentRoute.value.params.id);
    formData.append('title_en', title.value.en);
    formData.append('title_ar', title.value.ar);
    formData.append('slug', slug.value);
    formData.append('slug_ar', slugAr.value);
    formData.append('_method', 'PUT');
    // submit
    window.axios
        .put(`/tags/update/`, formData)
        .then(() => {
            // toast
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Tag updated successfully'
            });
            // redirect to tags
            router.push({ name: 'tags' });
        })
        .catch((error) => {
            // check if there is errors
            if (error.response.data.errors) {
                // set errors
                for (let key in error.response.data.errors) {
                    errors.value[key] = error.response.data.errors[key].message;
                }
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: Object.values(errors.value).filter(Boolean).join('<br />')
                });
            } else {
                // toast
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong'
                });
            }
        });
    loading.value = false;
};
</script>

<template>
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
                        <InputText id="title" type="text" v-model="slug" disabled placeholder="it-should-be-seperated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500">{{ errors.slug }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="slugAr">Slug Arabic</label>
                        <InputText id="slugAr" type="text" v-model="slugAr" disabled placeholder="يجب-فصلها-بالشرطات" />
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
