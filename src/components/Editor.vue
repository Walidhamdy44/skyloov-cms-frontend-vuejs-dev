<script setup>
import Editor from 'primevue/editor';
import { ref } from 'vue';

const block = ref({
    type: 'text',
    content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, .'
});
</script>

<template>
    <Editor v-model="block.content">
        <template v-slot:toolbar>
            <span class="ql-formats">
                <select class="ql-font">
                    <option value="serif" selected>Serif</option>
                    <option value="monospace">Monospace</option>
                </select>
                <select class="ql-size">
                    <option value="small">Small</option>
                    <option value="normal" selected>Normal</option>
                    <option value="large">Large</option>
                    <option value="huge">Huge</option>
                </select>
            </span>
            <span class="ql-formats">
                <button class="ql-bold" aria-label="Bold"></button>
                <button class="ql-italic" aria-label="Italic"></button>
                <button class="ql-underline" aria-label="Underline"></button>
            </span>
            <span class="ql-formats">
                <select class="ql-color"></select>
                <select class="ql-background"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-script" value="sub" aria-label="Subscript"></button>
                <button class="ql-script" value="super" aria-label="Superscript"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-header" value="1" aria-label="Heading 1"></button>
                <button class="ql-header" value="2" aria-label="Heading 2"></button>
                <button class="ql-blockquote" aria-label="Blockquote"></button>
                <button class="ql-code-block" aria-label="Code block"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered" aria-label="Ordered List"></button>
                <button class="ql-list" value="bullet" aria-label="Unordered List"></button>
                <button class="ql-indent" value="-1" aria-label="Indent"></button>
                <button class="ql-indent" value="+1" aria-label="Outdent"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-direction" value="rtl" aria-label="Right to Left"></button>
                <select class="ql-align">
                    <option selected></option>
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                </select>
            </span>
            <span class="ql-formats">
                <button class="ql-link" aria-label="Insert Link"></button>
            </span>
        </template>
    </Editor>
</template>
