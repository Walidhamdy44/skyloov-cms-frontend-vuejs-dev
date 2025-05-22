<script setup>
import { onMounted, ref } from 'vue';
// import Editor from '@/components/Editor.vue';
import router from '@/router';
import store from '@/store';
import CKEditor from '../../../components/CKEditor.vue';

// loading
const loading = ref(true);

// errors
const errors = ref({
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: ''
});

// types
const types = ref([
    { name: 'Text', value: 'text' },
    { name: 'Image', value: 'image' },
    { name: 'Video', value: 'video' },
    { name: 'Audio', value: 'audio' },
    { name: 'File', value: 'file' }
]);
const selectedTypes = ref([]);

const sourceOptions = ref([
    { name: 'All', value: 'all' },
    { name: 'Mobile', value: 'mobile' },
    { name: 'Web', value: 'web' }
]);
const selectedSources = ref([]);

const fileInputRef = ref(null);

// blocks
const blocks = ref([]);

const mediaChanged = ref(false);

// get the data from api
onMounted(() => {
    if (router.currentRoute.value.params.id) {
        getPageBlocks(router.currentRoute.value.params.id);
    } else {
        // loading
        loading.value = false;
    }
});

// get the page blocks
const getPageBlocks = async (page_id) => {
    // loading
    loading.value = true;

    // check errors
    if (errors.value.length > 0) {
        return;
    }

    try {
        const response = await window.axios.get(`/pages/show?id=${page_id}`);
        // set the data
        blocks.value = response.data.blocks;
        // set the selected SOURCE
        selectedSources.value = blocks.value.map((block) => {
            return sourceOptions.value.find((option) => option.value === block.source);
        });
    } catch (error) {
        // redirect to pages
        router.push({ name: 'pages' });

        // toast
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong'
        });
    } finally {
        loading.value = false;
    }
};

const newValue = (index, key, event, oldValue) => {
    if (event.target.children.length > 0) {
        //convert the value to string
        event.target.value = event.target.children;
        if (event.target.value.length > 0) {
            blocks.value[index].changed = true;
        }

        // set the new value
        let value = '';
        for (let i = 0; i < event.target.value.length; i++) {
            value += event.target.value[i].outerHTML;
        }
        blocks.value[index][key] = value;
    } else {
        // check if the value changed or not due to oldBlocks
        if (oldValue === event.target.value) {
            blocks.value[index].changed = false;
        } else {
            blocks.value[index].changed = true;
        }
        // set the new value
        blocks.value[index][key] = event.target.value;
    }
};

const appendChanged = (index) => {
    blocks.value[index].changed = true;
};

const uploadMedia = (index) => {
    if (fileInputRef.value && fileInputRef.value.files.length > 0) {
        blocks.value[index].media = fileInputRef.value.files[0];
        blocks.value[index].changed = true;
    }

    mediaChanged.value = true;

    return;
};

const addNewSection = (index) => {
    const type = selectedTypes.value[index];
    if (!type) {
        // Alert the user if no type is selected
        store.commit('setToastMessage', {
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a block type before adding.',
            life: 3000
        });
        return;
    }
    blocks.value.splice(index + 1, 0, { type: type.value, source: 'all' });
    selectedTypes.value.splice(index + 1, 0, null);
};

const removeSection = (index) => {
    blocks.value.splice(index, 1);
    selectedTypes.value.splice(index, 1);
};

// submit block
const submitBlock = (block) => {
    // loading
    loading.value = true;

    let hasErrors = false;

    // reset errors
    errors.value = {
        title_en: '',
        title_ar: '',
        content_en: '',
        content_ar: ''
    };
    // Validate required fields
    if (!block.title_en) {
        errors.value.title_en = 'Title English is required';
        hasErrors = true;
    }
    if (!block.title_ar) {
        errors.value.title_ar = 'Title Arabic is required';
        hasErrors = true;
    }
    if (!block.content_en) {
        errors.value.content_en = 'Content English is required';
        hasErrors = true;
    }
    if (!block.content_ar) {
        errors.value.content_ar = 'Content Arabic is required';
        hasErrors = true;
    }

    // check errors
    if (hasErrors) {
        loading.value = false;
        return;
    }

    // prepare form data
    let formData = new FormData();
    for (let key in block) {
        if (key === 'media') continue;
        if (key === 'changed') continue;
        if (key === 'source') continue;
        if (!block[key]) continue;
        formData.append(key, block[key]);
    }
    if (selectedSources.value[blocks.value.indexOf(block)]) {
        formData.append('source', selectedSources.value[blocks.value.indexOf(block)].value);
    }
    // formData.append('source', 'all');
    formData.append('blockable[id]', router.currentRoute.value.params.id);
    formData.append('blockable[type]', 'page');
    if (block.media && mediaChanged.value && block.media instanceof File) formData.append('media', block.media);

    let uri = `/blocks/create/`;

    if (block.id) {
        formData.append('id', block.id);
        formData.append('_method', 'PUT');
        uri = `/blocks/update/`;
    }
    // submit
    window.axios
        .post(uri, formData)
        .then(() => {
            // toast
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Page updated successfully',
                life: 3000
            });
            // reload the content
            getPageBlocks(router.currentRoute.value.params.id);
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
                    detail: errors.value.join('<br />'),
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

// delete block
const deleteBlock = (block, index) => {
    // loading
    loading.value = true;

    // reset errors
    errors.value = [];

    // check errors
    if (errors.value.length > 0) {
        return;
    }

    if (!block.id) {
        removeSection(index);
        loading.value = false;
        return;
    }

    // submit
    window.axios
        .delete(`/blocks/delete/?id=${block.id}`)
        .then(() => {
            // toast
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Page updated successfully',
                life: 3000
            });
            // remove the block
            // removeSection(index);
            // reload the content
            getPageBlocks(router.currentRoute.value.params.id);
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
                    detail: errors.value.join('<br />'),
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
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- errors-->
        <!-- <div class="col-12" v-if="errors.length">
            <div class="card">
                <h5>Errors</h5>
                <div class="p-fluid formgrid grid" v-for="error in errors" :key="error">
                    <div class="field col-12">
                        <p class="text-red-500" v-text="error"></p>
                    </div>
                </div>
            </div>
        </div> -->
        <!-- blocks -->
        <div class="col-12">
            <div class="card">
                <h5>Blocks</h5>
                <div class="p-fluid formgrid grid">
                    <div v-for="(block, index) in blocks" :key="index" class="field col-12">
                        <template v-if="block.type">
                            <!-- new div for source options -->
                            <div class="p-grid">
                                <div class="p-col-9">
                                    <div class="field">
                                        <label for="source">Source</label>
                                        <Dropdown :options="sourceOptions" optionLabel="name" placeholder="Select source" v-model="selectedSources[index]" class="col-12" @change="appendChanged(index)" />
                                        <span v-if="errors.source" class="text-red-500">{{ errors.source }}</span>
                                    </div>
                                </div>
                                <div class="p-col-3">
                                    <div class="field">
                                        <label for="order">Order</label>
                                        <InputText id="order" type="number" @input="newValue(index, 'order', $event, block.order)" :value="block.order" />
                                    </div>
                                </div>
                            </div>

                            <div v-if="block.type === 'text'">
                                <div class="flex justify-content-between gap-4 flex-column md:flex-row">
                                    <div class="field w-full">
                                        <label for="title">Title English</label>
                                        <InputText id="title" type="text" @input="newValue(index, 'title_en', $event, block.title_en)" :value="block.title_en" />
                                        <span v-if="errors.title_en" class="text-red-500">{{ errors.title_en }}</span>
                                    </div>
                                    <div class="field w-full">
                                        <label for="title">Title Arabic</label>
                                        <InputText id="title" type="text" @input="newValue(index, 'title_ar', $event, block.title_ar)" :value="block.title_ar" />
                                        <span v-if="errors.title_ar" class="text-red-500">{{ errors.title_ar }}</span>
                                    </div>
                                </div>
                                <div class="flex gap-3 flex-column">
                                    <div class="h-full field">
                                        <label for="content" style="padding-bottom: 10px">Content English</label>
                                        <CKEditor v-model:modelValue="blocks[index].content_en" />
                                    </div>
                                    <div class="h-full field">
                                        <label for="content">Content Arabic</label>
                                        <CKEditor v-model:modelValue="blocks[index].content_ar" />
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="block.type === 'image'">
                                <div class="card flex justify-content-center">
                                    <Image :src="block.media ? block.media.url : ''.url" alt="Image" width="250" />
                                </div>
                            </div>
                            <div v-else-if="block.type === 'video'">
                                <div class="card flex justify-content-center">
                                    <!-- <iframe :src="block.media ? block.media.url : ''" frameborder="0" allowfullscreen></iframe> -->
                                    <video :src="block.media ? block.media.url : ''.url" controls></video>
                                </div>
                            </div>
                            <div v-else-if="block.type === 'audio'">
                                <div class="card flex justify-content-center">
                                    <audio :src="block.media ? block.media.url : ''.url" controls></audio>
                                </div>
                            </div>
                            <div v-else-if="block.type === 'file'">
                                <div class="card flex justify-content-center">
                                    <a :href="block.media ? block.media.url : ''.url" target="_blank">Download File</a>
                                </div>
                            </div>
                            <div class="flex mt-4 gap-4 justify-content-between flex-column md:flex-row">
                                <FileUpload
                                    mode="basic"
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                                    customUpload
                                    :maxFileSize="10000000"
                                    chooseLabel="choose file"
                                    @change="uploadMedia(index)"
                                    :ref="
                                        (el) => {
                                            fileInputRef = el;
                                        }
                                    "
                                    v-if="block.type !== 'text'"
                                    class="w-full h-full col-12"
                                />
                                <div class="flex flex-column gap-4 my-4 md:my-0 justify-content-between w-full">
                                    <Dropdown :options="types" optionLabel="name" placeholder="Add new block" v-model="selectedTypes[index]" class="col-12" />
                                    <div class="flex justify-content-between gap-4 flex-column md:flex-row">
                                        <Button label="Add Block" icon="pi pi-plus" @click="addNewSection(index)" class="col-12 md:col-3 p-2" v-if="!block.changed" />
                                        <Button icon="pi pi-trash" label="Delete block" severity="danger" class="col-12 md:col-3 p-2" @click="deleteBlock(block, index)" v-if="blocks.length > 1" />
                                        <Button icon="pi pi-save" label="Save block" severity="success" class="col-12 md:col-3 p-2" @click="submitBlock(block, index)" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div v-if="blocks.length <= 0" class="field col-12 flex justify-content-center gap-4">
                        <Dropdown :options="types" optionLabel="name" placeholder="Add new block" v-model="selectedTypes[0]" class="col-12 md:col-8" />
                        <Button label="Add Block" icon="pi pi-plus" @click="addNewSection(0)" class="col-12 md:col-3 p-2" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
