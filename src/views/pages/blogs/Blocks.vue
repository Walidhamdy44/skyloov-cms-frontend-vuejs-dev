<script setup>
import { onMounted, ref } from 'vue';
import Dialog from 'primevue/dialog';
import CKEditor from '@/components/CKEditor.vue';
import { checkSession } from '@/service/session.js';

import router from '@/router';
import store from '@/store';
import PreviewDialog from '@/components/PreviewDialog.vue';

// loading
const loading = ref(true);

// errors
const errors = ref([]);
// types
// const types = ref([
//     { name: 'Text', value: 'text' },
//     { name: 'Image', value: 'image' },
//     { name: 'Video', value: 'video' },
//     { name: 'Audio', value: 'audio' },
//     { name: 'File', value: 'file' }
// ]);
const selectedTypes = ref([]);

const sourceOptions = ref([
    { name: 'All', value: 'all' },
    { name: 'Mobile', value: 'mobile' },
    { name: 'Web', value: 'web' }
]);
const selectedSources = ref([]);

// const fileInputRef = ref(null);

// blocks
const blocks = ref([]);
const blogData = ref(null);

const mediaChanged = ref(false);

// Add a ref for dialog visibility
const dialogVisible = ref(false);

// Add a state to track if a block is being added
// const isAddingBlock = ref(false);

// get the data from api
onMounted(() => {
    if (router.currentRoute.value.params.id) {
        getBlogBlocks(router.currentRoute.value.params.id);
    } else {
        // loading
        loading.value = false;
    }
    checkSession();
});
const addTextBlock = () => {
    const newBlock = {
        type: 'text',
        source: 'all',
        title_en: '',
        title_ar: '',
        content_en: '',
        content_ar: '',
        isNew: true
    };
    blocks.value.push(newBlock);
};

const addFAQBlock = () => {
    // Check if there are existing FAQs and validate them
    const hasInvalidFAQ = blocks.value.some((block) => block.type === 'accordion' && (block.title_en.trim().length < 4 || block.title_ar.trim().length < 4 || block.content_en.trim().length < 4 || block.content_ar.trim().length < 4));

    if (hasInvalidFAQ) {
        store.commit('setToastMessage', {
            severity: 'error',
            summary: 'Validation Error',
            detail: 'All FAQ fields (Question & Answer) must have at least 4 characters.',
            life: 3000
        });
        return;
    }

    // Add new FAQ block if validation passes
    const newBlock = {
        type: 'accordion',
        source: 'all',
        title_en: '',
        title_ar: '',
        content_en: '',
        content_ar: '',
        isNew: true
    };
    blocks.value.push(newBlock);
};

const getBlogBlocks = async (blog_id) => {
    // loading
    loading.value = true;

    // check errors
    if (errors.value.length > 0) {
        return;
    }

    try {
        const response = await window.axios.get(`/blogs/show?id=${blog_id}`);
        // set the data
        blocks.value = response.data.blocks.map((block) => {
            return block;
        });
        blogData.value = response.data; // Store the entire response data
        // set the selected SOURCE
        selectedSources.value = blocks.value.map((block) => {
            return sourceOptions.value.find((option) => option.value === block.source);
        });
    } catch (error) {
        // redirect to blogs
        router.push({ name: 'blogs' });

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

// const newValue = (index, key, event, oldValue) => {
//     if (key === 'alt_text_en' || key === 'alt_text_ar') {
//         // Update the media object for image blocks
//         if (blocks.value[index].type === 'image') {
//             blocks.value[index].media[key] = event.target.value;
//             // Mark the block as changed
//             blocks.value[index].changed = true;
//         }
//     } else {
//         if (event.target.children.length > 0) {
//             //convert the value to string
//             event.target.value = event.target.children;
//             if (event.target.value.length > 0) {
//                 blocks.value[index].changed = true;
//             }
//             // set the new value
//             let value = '';
//             for (let i = 0; i < event.target.value.length; i++) {
//                 value += event.target.value[i].outerHTML;
//             }
//             blocks.value[index][key] = value;
//         } else {
//             // check if the value changed or not due to oldBlocks
//             if (oldValue === event.target.value) {
//                 blocks.value[index].changed = false;
//             } else {
//                 blocks.value[index].changed = true;
//             }
//             // set the new value
//             blocks.value[index][key] = event.target.value;
//         }
//     }
// };

// const appendChanged = (index) => {
//     blocks.value[index].changed = true;
// };

// const uploadMedia = (index) => {
//     if (fileInputRef.value && fileInputRef.value.files.length > 0) {
//         blocks.value[index].media = fileInputRef.value.files[0];
//         blocks.value[index].changed = true;
//     }

//     mediaChanged.value = true;

//     return;
// };

// const addNewSection = (index) => {
//     const type = selectedTypes.value[index];
//     if (!type) {
//         // Trigger a toast error if no type is selected
//         store.commit('setToastMessage', {
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Please select a block type before adding.',
//             life: 3000
//         });
//         return;
//     }
//     const newBlock = { type: type.value, source: 'all', isNew: true };
//     // Initialize media object for image blocks
//     if (type.value === 'image') {
//         newBlock.media = {
//             alt_text_en: '',
//             alt_text_ar: '',
//             url: ''
//         };
//     }

//     blocks.value.splice(index + 1, 0, newBlock);
//     selectedTypes.value.splice(index + 1, 0, null);

//     // Set the state to indicate a block is being added
//     isAddingBlock.value = true;
// };

const removeSection = (index) => {
    blocks.value.splice(index, 1);
    selectedTypes.value.splice(index, 1);
};

// submit block
const submitBlock = (block) => {
    loading.value = true;

    // reset errors
    errors.value = [];
    if (block.type === 'accordion') {
        if (block.title_en.trim().length < 4 || block.title_ar.trim().length < 4 || block.content_en.trim().length < 4 || block.content_ar.trim().length < 4) {
            store.commit('setToastMessage', {
                severity: 'error',
                summary: 'Validation Error',
                detail: 'FAQ fields (Question & Answer) must have at least 4 characters.',
                life: 3000
            });
            loading.value = false;
            return;
        }
    }
    // Check for empty alt text in image blocks
    if (block.type === 'image' && block.media) {
        if (!block.media.alt_text_en || !block.media.alt_text_ar) {
            store.commit('setToastMessage', {
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill in both English and Arabic alt text for the image.',
                life: 3000
            });
            loading.value = false;
            return;
        }
    }
    // check errors
    if (errors.value.length > 0) {
        return;
    }

    // prepare form data
    let formData = new FormData();
    for (let key in block) {
        if (key === 'media') continue;
        if (key === 'changed') continue;
        // if (key === 'source') continue;
        if (!block[key]) continue;
        formData.append(key, block[key]);
    }
    if (selectedSources.value[blocks.value.indexOf(block)]) {
        formData.append('source', 'all');
    }

    if (block.type === 'image' && block.media) {
        formData.append('alt_text_en', block.media.alt_text_en || '');
        formData.append('alt_text_ar', block.media.alt_text_ar || '');
    }

    formData.append('blockable[id]', router.currentRoute.value.params.id);
    formData.append('blockable[type]', 'blog');

    if (block.media && mediaChanged.value && block.media instanceof File) {
        formData.append('media', block.media);
    }

    let uri = `/blocks/create/`;

    if (block.id) {
        formData.append('id', block.id);
        formData.append('_method', 'PUT');
        uri = `/blocks/update/`;
    }
    // Submit the request
    window.axios
        .post(uri, formData)
        .then(() => {
            store.commit('setToastMessage', {
                severity: 'success',
                summary: 'Success',
                detail: 'Blog updated successfully',
                life: 3000
            });
            getBlogBlocks(router.currentRoute.value.params.id); // Reload blocks
        })
        .catch((error) => {
            if (error.response?.data?.errors) {
                errors.value = error.response.data.errors.map((e) => e.message);
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: errors.value.join('<br />'),
                    life: 3000
                });
            } else {
                store.commit('setToastMessage', {
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong',
                    life: 3000
                });
            }
        })
        .finally(() => {
            loading.value = false;
        });
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
        console.log('no id');
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
                detail: 'Blog updated successfully',
                life: 3000
            });
            // remove the block
            // removeSection(index);
            // reload the content
            getBlogBlocks(router.currentRoute.value.params.id);
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

// Add a method to handle the preview action
const previewBlog = () => {
    // Toggle the dialog visibility
    dialogVisible.value = true;
};
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- Errors -->
        <div class="col-12" v-if="errors.length">
            <div class="card">
                <h5>Errors</h5>
                <div v-for="error in errors" :key="error" class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <p class="text-red-500" v-text="error"></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- MAIN BLOG CONTENT CARD (Text & FAQ Blocks) -->
        <div class="col-12">
            <div class="card main-card">
                <h5>Blog Content</h5>

                <!-- TEXT BLOCKS -->
                <div v-for="(block, index) in blocks.filter((b) => b.type === 'text')" :key="index" class="field col-12">
                    <h6>Text Block {{ index + 1 }}</h6>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-6">
                            <label>Title (English)</label>
                            <InputText v-model="block.title_en" class="input-field" />
                        </div>
                        <div class="field col-6">
                            <label>Title (Arabic)</label>
                            <InputText v-model="block.title_ar" class="input-field" />
                        </div>
                        <div class="field col-12">
                            <label>Content (English)</label>
                            <CKEditor v-model:modelValue="block.content_en" />
                        </div>
                        <div class="field col-12">
                            <label>Content (Arabic)</label>
                            <CKEditor v-model:modelValue="block.content_ar" />
                        </div>
                    </div>

                    <!-- ACTION BUTTONS FOR TEXT BLOCK -->
                    <div class="block-actions">
                        <Button icon="pi pi-trash" label="Delete Block" severity="danger" class="btn-delete" @click="deleteBlock(block, index)" v-if="blocks.filter((b) => b.type === 'text').length > 1" />
                        <Button icon="pi pi-save" label="Save Block" severity="success" class="btn-save" @click="submitBlock(block)" />
                    </div>
                </div>
                <!-- ADD TEXT BLOCK BUTTON (Only show if no text blocks exist) -->
                <div class="flex justify-content-center mt-3" v-if="blocks.filter((b) => b.type === 'text').length < 1">
                    <Button label="Add Text Block" icon="pi pi-plus" class="p-button-primary" @click="addTextBlock()" />
                </div>

                <!-- FAQ SECTION (AFTER TEXT BLOCKS, INSIDE SAME CARD) -->
                <div class="faq-section">
                    <h5>FAQ Section</h5>
                    <div v-for="(block, index) in blocks.filter((b) => b.type === 'accordion')" :key="index" class="faq-item">
                        <div class="p-fluid formgrid grid faq-container">
                            <!-- Question English -->
                            <div class="faq-item-container">
                                <div class="field">
                                    <label>Question (English)</label>
                                    <InputText v-model="block.title_en" class="faq-input" />
                                </div>
                                <div class="field">
                                    <label>Answer (English)</label>
                                    <Textarea v-model="block.content_en" rows="3" class="faq-textarea" />
                                </div>
                            </div>
                            <div class="faq-item-container">
                                <div class="field">
                                    <label>Question (Arabic)</label>
                                    <InputText v-model="block.title_ar" class="faq-input" />
                                </div>

                                <div class="field">
                                    <label>Answer (Arabic)</label>
                                    <Textarea v-model="block.content_ar" rows="3" class="faq-textarea" />
                                </div>
                            </div>
                        </div>

                        <!-- FAQ ACTION BUTTONS -->
                        <div class="faq-actions">
                            <Button icon="pi pi-trash" label="Delete FAQ" severity="danger" class="faq-delete" @click="deleteBlock(block, index)" />
                            <Button icon="pi pi-save" label="Save FAQ" severity="success" class="faq-save" @click="submitBlock(block)" />
                        </div>
                    </div>

                    <!-- ADD FAQ BUTTON (Inside Same Card) -->
                    <div class="faq-add-container">
                        <Button label="Add FAQ" icon="pi pi-plus" class="p-button-secondary ml-3" @click="addFAQBlock()" :disabled="blocks.filter((b) => b.type === 'text').length === 0" />
                    </div>
                </div>
            </div>
        </div>

        <!-- PREVIEW BLOG BUTTON -->
        <div class="col-12 flex justify-content-center mt-2">
            <Button label="Preview Blog" icon="pi pi-eye" class="p-button-success" @click="previewBlog" />
        </div>

        <!-- PREVIEW DIALOG -->
        <Dialog v-model:visible="dialogVisible" modal header="Preview Blog" :style="{ width: '100rem', height: '100rem' }">
            <PreviewDialog :blocks="blocks" :blogData="blogData" />
            <div class="flex justify-end">
                <Button label="Close" @click="dialogVisible = false" />
            </div>
        </Dialog>
    </div>
</template>
<style scoped>
/* Main Card Styling */
.main-card {
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
.faq-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
}
.faq-item-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
/* Text Input Fields */
.input-field,
.faq-input {
    width: 100%;
    border-radius: 5px;
}

/* FAQ Section Styling */
.faq-section {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
}

/* FAQ Item */
.faq-item {
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #ffffff;
}

/* Textarea Styling */
.faq-textarea {
    width: 100%;
    border-radius: 5px;
}

/* Action Buttons for Text Blocks */
.block-actions {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 10px;
}

.btn-delete {
    background: #ff4d4f;
    border: none;
    color: white;
}

.btn-save {
    background: #28a745;
    border: none;
    color: white;
}

/* FAQ Actions */
.faq-actions {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 10px;
}

.faq-delete {
    background: #ff4d4f;
    border: none;
    color: white;
}

.faq-save {
    background: #28a745;
    border: none;
    color: white;
}

/* Add FAQ Button */
.faq-add-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
}

.faq-add {
    background: #6c757d;
    color: white;
}
</style>
