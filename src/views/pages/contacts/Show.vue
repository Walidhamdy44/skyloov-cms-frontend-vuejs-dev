<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import store from '@/store';
import moment from 'moment';

// loading
const loading = ref(true);

// contact details
const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');
const receivedAt = ref('');

// get the data from api
onMounted(() => {
    if (router.currentRoute.value.params.id) {
        window.axios
            .get(`/messages/show?id=${router.currentRoute.value.params.id}`)
            .then((response) => {
                // set the data
                name.value = response.data.name;
                email.value = response.data.email;
                subject.value = response.data.subject;
                message.value = response.data.message;
                receivedAt.value = formatDateTime(response.data.created_at);
            })
            .catch(() => {
                // redirect to contacts
                router.push({ name: 'contacts' });
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

// format date time
const formatDateTime = (date) => {
    return moment(date).format('Do MMMM YYYY, h:mm:ss a');
};
</script>

<template>
    <Loading v-if="loading" />
    <div class="grid" v-else>
        <!-- contact details -->
        <div class="col-12">
            <div class="card">
                <h5>Contact Details</h5>
                <div class="preview-container">
                    <div class="preview-section">
                        <div class="preview-info">
                            <p><strong>Name:</strong> {{ name }}</p>
                            <p><strong>Email:</strong> {{ email }}</p>
                            <p><strong>Subject:</strong> {{ subject }}</p>
                            <p><strong>Message:</strong> {{ message }}</p>
                            <p><strong>Received At:</strong> {{ receivedAt }}</p>
                        </div>
                    </div>
                </div>
                <div class="preview-actions flex justify-content-end">
                    <a :href="`mailto:${email}?subject=${subject}`" class="p-button p-button-success p-button-outlined mr-2">
                        <i class="pi pi-reply"></i>
                        <span class="ml-2">Reply</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
