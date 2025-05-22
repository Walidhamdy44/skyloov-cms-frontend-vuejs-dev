<script setup>
import { computed, onMounted, ref } from 'vue';
import router from '@/router';
import store from '@/store';
import { checkSession } from '@/service/session.js';

// loading
const loading = ref(true);

// errors
const errors = ref({
    title_en: '',
    title_ar: '',
    slug: '',
    slug_ar: '',
    header_image: '',
    published_at: '',
    tags: '',
    seos: {
        canonical_url_en: '',
        canonical_url_ar: ''
    }
});

// blog details
const title = ref({ en: '', ar: '' });
const slug = ref('');
const slugAr = ref('');
const headerImage = ref(null);
const headerImageRef = ref(null);
const publishedAt = ref(null);
const tags = ref([]);
const selectedTags = ref([]);
const seos = ref({
    title_en: '',
    title_ar: '',
    meta_discription: '',
    meta_discription_ar: '',
    meta_keywords: [],
    canonical_url_en: '',
    canonical_url_ar: ''
});

// Add computed properties for meta description lengths
const metaDescriptionLength = computed(() => seos.value.meta_discription.length);
const metaDescriptionArLength = computed(() => seos.value.meta_discription_ar.length);

// get the data from api
onMounted(() => {
    // check if the user is logged in
    checkSession();
    if (router.currentRoute.value.params.id) {
        // get the tags then get the blog
        window.axios
            .get('/tags')
            .then((response) => {
                tags.value = response.data;
            })
            .then(() => {
                getBlog();
            });
        loading.value = false;
    } else {
        // loading
        loading.value = false;
    }
});

const getBlog = () => {
    window.axios
        .get(`/blogs/tags?id=${router.currentRoute.value.params.id}`)
        .then((response) => {
            // set the data
            title.value.en = response.data.title_en;
            title.value.ar = response.data.title_ar;
            slug.value = response.data.slug;
            slugAr.value = response.data.slug_ar;
            publishedAt.value = new Date(response.data.published_at);
            tags.value.forEach((tag) => {
                if (response.data.tags.find((t) => t.id === tag.id)) {
                    selectedTags.value.push(tag);
                }
            });
            if (response.data.seo) {
                seos.value.title_en = response.data.seo.title_en;
                seos.value.title_ar = response.data.seo.title_ar;
                seos.value.meta_discription = response.data.seo.meta_discription;
                seos.value.meta_discription_ar = response.data.seo.meta_discription_ar;
                seos.value.meta_keywords = response.data.seo.meta_keywords.split(',');
                seos.value.canonical_url_en = response.data.seo.canonical_url_en;
                seos.value.canonical_url_ar = response.data.seo.canonical_url_ar;
            }
        })
        .catch(() => {
            // redirect to blogs
            router.push({ name: 'blogs' });
            // toast
            store.commit('setToastMessage', {
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong'
            });
        });
};

// upload heder image
const uploadHeaderImage = () => {
    if (headerImageRef.value && headerImageRef.value.files.length > 0) {
        headerImage.value = headerImageRef.value.files[0];
    }
    return;
};

const formatDate = (date) => {
    if (!date) {
        return null;
    }
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};
const isFormInvalid = computed(() => {
    return !title.value.en || !title.value.ar || !slug.value || !selectedTags.value.length || !seos.value.canonical_url_en || !seos.value.canonical_url_ar;
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
        slug_ar: '',
        header_image: '',
        published_at: '',
        tags: '',
        seos: {
            canonical_url_en: '',
            canonical_url_ar: ''
        }
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
    // if (!headerImage.value) {
    //     errors.value.header_image = 'Header Image is required';
    //     hasErrors = true;
    // } else if (!/\.(jpe?g|png|gif|svg|webm|webp)$/i.test(headerImage.value.name)) {
    //     errors.value.header_image = 'Header Image must be an image';
    //     hasErrors = true;
    // }
    if (!publishedAt.value || isNaN(Date.parse(publishedAt.value))) {
        errors.value.published_at = 'Published At is not a valid date';
        hasErrors = true;
    }
    if (!selectedTags.value.length) {
        errors.value.tags = 'Tags are required';
        hasErrors = true;
    }
    if (!seos.value.canonical_url_en) {
        errors.value.seos.canonical_url_en = 'Canonical URL English is required';
        hasErrors = true;
    } else if (!/^(http|https):\/\/[^ "]+$/.test(seos.value.canonical_url_en)) {
        errors.value.seos.canonical_url_en = 'Canonical URL English is not a valid URL';
        hasErrors = true;
    }
    if (!seos.value.canonical_url_ar) {
        errors.value.seos.canonical_url_ar = 'Canonical URL Arabic is required';
        hasErrors = true;
    } else if (!/^(http|https):\/\/[^ "]+$/.test(seos.value.canonical_url_ar)) {
        errors.value.seos.canonical_url_ar = 'Canonical URL Arabic is not a valid URL';
        hasErrors = true;
    }

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

    // prepare form data
    let formData = new FormData();
    formData.append('id', router.currentRoute.value.params.id);
    formData.append('title_en', title.value.en);
    formData.append('title_ar', title.value.ar);
    formData.append('slug', slug.value);
    formData.append('slug_ar', slugAr.value);
    formData.append('published_at', formatDate(publishedAt.value));
    if (headerImage.value) {
        formData.append('header_image', headerImage.value);
    }
    selectedTags.value.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag.id);
    });
    formData.append('seos[title_en]', seos.value.title_en);
    formData.append('seos[title_ar]', seos.value.title_ar);
    formData.append('seos[meta_discription]', seos.value.meta_discription);
    formData.append('seos[meta_discription_ar]', seos.value.meta_discription_ar);
    formData.append('seos[meta_keywords]', seos.value.meta_keywords.join(','));
    formData.append('seos[canonical_url_en]', seos.value.canonical_url_en);
    formData.append('seos[canonical_url_ar]', seos.value.canonical_url_ar);
    formData.append('_method', 'PUT');
    // submit
    window.axios
        .post(`/blogs/update/`, formData)
        .then(() => {
            // toast
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Blog updated successfully'
            });
            // redirect to blogs
            router.push({ name: 'blogs' });
        })
        .catch((error) => {
            // check if there is errors
            if (error.response.data.errors) {
                // set errors
                for (let key in error.response.data.errors) {
                    errors.value.push(error.response.data.errors[key].message);
                }
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: errors.value.join('<br />')
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
    // loading
    loading.value = false;
};
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- blog details -->
        <div class="col-12">
            <div class="card">
                <h5>Edit Blog</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="title">Title English *</label>
                        <InputText id="title" type="text" v-model="title.en" maxLength="255" />
                        <span v-if="errors.title_en" class="text-red-500">{{ errors.title_en }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="title">Title Arabic *</label>
                        <InputText id="title" type="text" v-model="title.ar" maxLength="255" />
                        <span v-if="errors.title_ar" class="text-red-500">{{ errors.title_ar }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="slug">Slug English *</label>
                        <InputText id="slug" type="text" v-model="slug" disabled placeholder="it-should-be-separated-with-dashes" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="slug_ar">Slug Arabic *</label>
                        <InputText id="slug_ar" type="text" v-model="slugAr" disabled placeholder="it-should-be-separated-with-dashes" />
                    </div>
                    <div class="field col-12">
                        <label for="title">Header Image</label>
                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            customUpload
                            :maxFileSize="10000000"
                            chooseLabel="choose image"
                            @change="uploadHeaderImage"
                            :ref="
                                (el) => {
                                    headerImageRef = el;
                                }
                            "
                            class="w-full h-full"
                        />
                        <span v-if="errors.header_image" class="text-red-500">{{ errors.header_image }}</span>
                    </div>
                    <div class="field col-12">
                        <label for="title">Published At</label>
                        <Calendar v-model="publishedAt" />
                        <span v-if="errors.published_at" class="text-red-500">{{ errors.published_at }}</span>
                    </div>
                    <div class="field col-12">
                        <label for="title">Tags *</label>
                        <MultiSelect v-model="selectedTags" :options="tags" filter optionLabel="title_en" />
                        <span v-if="errors.tags" class="text-red-500">{{ errors.tags }}</span>
                    </div>
                    <h6 class="col-12">SEO</h6>
                    <div class="field col-12 md:col-6">
                        <label for="meta_title_en">Meta Title English</label>
                        <InputText id="meta_title_en" type="text" v-model="seos.title_en" maxLength="255" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="meta_title_ar">Meta Title Arabic</label>
                        <InputText id="meta_title_ar" type="text" v-model="seos.title_ar" maxLength="255" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="meta_description">Meta Description En</label>
                        <Textarea id="meta_description" type="text" v-model="seos.meta_discription" separator="," maxLength="255" />
                        <span>{{ metaDescriptionLength }} / 255 characters</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="meta_description_ar">Meta Description Ar</label>
                        <Textarea id="meta_description_ar" type="text" v-model="seos.meta_discription_ar" separator="," maxLength="255" />
                        <span>{{ metaDescriptionArLength }} / 255 characters</span>
                    </div>
                    <div class="field col-12">
                        <label for="meta_keywords">Meta Keywords <small>seperated by ,</small></label>
                        <Chips id="meta_keywords" type="text" v-model="seos.meta_keywords" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="canonical_url_en">Canonical URL English *</label>
                        <InputText id="canonical_url_en" type="text" v-model="seos.canonical_url_en" />
                        <span v-if="errors.seos.canonical_url_en" class="text-red-500">{{ errors.seos.canonical_url_en }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="canonical_url_ar">Canonical URL Arabic *</label>
                        <InputText id="canonical_url_ar" type="text" v-model="seos.canonical_url_ar" />
                        <span v-if="errors.seos.canonical_url_ar" class="text-red-500">{{ errors.seos.canonical_url_ar }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- submit -->
        <div class="col-12">
            <div class="card flex justify-content-end">
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <Button label="Submit" icon="pi pi-plus" @click="submit" :disabled="isFormInvalid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
