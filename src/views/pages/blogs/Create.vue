<script setup>
import { onMounted, ref, computed } from 'vue';
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
        title_en_seos: '',
        title_ar_seos: '',
        meta_discription_en_seos: '',
        meta_discription_ar_seos: '',
        meta_keywords_seos: '',
        canonical_url_en_seos: '',
        canonical_url_ar_seos: ''
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

// scheduling settings
const isScheduled = ref(false);
const scheduleTime = ref('00:00:00');

// Add a computed property for meta description length
const metaDescriptionLength = computed(() => seos.value.meta_discription.length);
const metaDescriptionArLength = computed(() => seos.value.meta_discription_ar.length);

// upload heder image
const uploadHeaderImage = () => {
    if (headerImageRef.value && headerImageRef.value.files.length > 0) {
        headerImage.value = headerImageRef.value.files[0];
    }
    return;
};

onMounted(() => {
    // get tags
    window.axios.get('/tags').then((response) => {
        tags.value = response.data;
    });
    // loading
    loading.value = false;
    checkSession();
});

const formatDate = (date) => {
    if (!date) {
        return null;
    }
    // Ensure month and day are two digits
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
};

// Computed property to check if the form is valid
const isFormInvalid = computed(() => {
    return (
        !title.value.en ||
        !title.value.ar ||
        !slug.value ||
        !headerImage.value ||
        !selectedTags.value.length ||
        !seos.value.canonical_url_en ||
        !seos.value.canonical_url_ar ||
        (isScheduled.value && (!publishedAt.value || isNaN(Date.parse(publishedAt.value))))
    );
});

// submit
const submit = () => {
    // loading
    loading.value = true;

    // Set publishedAt based on isScheduled or if no date is selected
    if (!isScheduled.value || !publishedAt.value) {
        const today = new Date();
        publishedAt.value = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    // Format publishedAt with date and time
    const formattedDate = formatDate(publishedAt.value);
    const formattedTime = scheduleTime.value || '00:00:00';
    const formattedPublishedAt = `${formattedDate} ${formattedTime}`; // Use the selected time

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
            title_en_seos: '',
            title_ar_seos: '',
            meta_discription_en_seos: '',
            meta_discription_ar_seos: '',
            meta_keywords_seos: '',
            canonical_url_en_seos: '',
            canonical_url_ar_seos: ''
        }
    };

    // Validate publishedAt is not before today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the day
    if (publishedAt.value < today) {
        errors.value.published_at = 'Published date cannot be in the past';
        hasErrors = true;
    }

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
        errors.value.slug = 'Slug is required';
        hasErrors = true;
    } else if (!/^[a-zA-Z0-9-_]+$/.test(slug.value)) {
        errors.value.slug = 'Slug must only contain letters, numbers, dashes, and underscores';
        hasErrors = true;
    }
    if (!slugAr.value) {
        errors.value.slugAr = 'Slug Ar is required';
        hasErrors = true;
    } else if (!/^[\u0600-\u06FFa-zA-Z0-9-_]+$/.test(slugAr.value)) {
        errors.value.slugAr = 'Slug Ar must only contain Arabic letters, English letters, numbers, dashes, and underscores';
        hasErrors = true;
    }
    if (!headerImage.value) {
        errors.value.header_image = 'Header Image is required';
        hasErrors = true;
    } else if (!/\.(jpe?g|png|gif|svg|webm|webp)$/i.test(headerImage.value.name)) {
        errors.value.header_image = 'Header Image must be an image';
        hasErrors = true;
    }
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
    formData.append('title_en', title.value.en);
    formData.append('title_ar', title.value.ar);
    formData.append('slug', slug.value);
    formData.append('slug_ar', slugAr.value);
    formData.append('header_image', headerImage.value);
    formData.append('published_at', formattedPublishedAt);
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

    // submit
    window.axios
        .post('/blogs/create/', formData)
        .then(() => {
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Blog created successfully'
            });
            router.push({ name: 'blogs' });
        })
        .catch((error) => {
            console.log(error);
            if (error.response) {
                // validation errors
                for (let key in error.response.data.errors) {
                    errors.value[key] = error.response.data.errors[key].message;
                }
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data ? error.response.data.errors[0].message : 'Please check the errors',
                    life: 3000
                });
            }
        });
    // loading
    loading.value = false;
};
</script>

<template>
    <Toast />
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- blog details -->
        <div class="col-12">
            <div class="card">
                <h5>Create Blog</h5>
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
                        <InputText id="slug" type="text" v-model="slug" placeholder="it-should-be-separated-with-dashes" />
                        <span v-if="errors.slug" class="text-red-500">{{ errors.slug }}</span>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="slugAr">Slug Arabic *</label>
                        <InputText id="slugAr" type="text" v-model="slugAr" placeholder="يجب-فصلها-بالشرطات" />
                        <span v-if="errors.slugAr" class="text-red-500">{{ errors.slugAr }}</span>
                    </div>
                    <div class="field col-12">
                        <label for="title">Header Image *</label>
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
                        <label for="title">Tags *</label>
                        <MultiSelect v-model="selectedTags" :options="tags" optionLabel="title_en" filter />
                        <span v-if="errors.tags" class="text-red-500">{{ errors.tags }}</span>
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

                    <!-- Scheduling Settings -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Scheduling Settings</h5>
                            <div class="p-fluid formgrid grid align-items-center">
                                <div class="field col-12 md:col-2 flex align-items-center gap-2">
                                    <label for="schedule_toggle">Schedule Blog</label>
                                    <InputSwitch v-model="isScheduled" />
                                </div>
                                <div class="field col-12 md:col-5" v-if="isScheduled">
                                    <label for="schedule_date">Schedule Date</label>
                                    <Calendar v-model="publishedAt" />
                                    <span v-if="errors.published_at" class="text-red-500">{{ errors.published_at }}</span>
                                </div>
                                <div class="field col-12 md:col-5" v-if="isScheduled">
                                    <label for="schedule_time">Start Time</label>
                                    <InputText id="schedule_time" type="time" v-model="scheduleTime" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- submit -->
        <div class="col-12">
            <div class="card flex justify-content-end">
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <Button label="Submit" icon="pi pi-plus" @click="submit" :disabled="loading || isFormInvalid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
