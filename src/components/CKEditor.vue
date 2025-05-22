<script setup>
import { computed, ref, onMounted, defineProps, defineEmits } from 'vue';
import { Ckeditor, useCKEditorCloud } from '@ckeditor/ckeditor5-vue';
import CustomUploadAdapterPlugin from '@/service/CustomUploadAdapterPlugin';

const LICENSE_KEY = import.meta.env.VITE_LICENSE_KEY;
// const editorMenuBar = useTemplateRef('editorMenuBarElement');

const cloud = useCKEditorCloud({ version: '44.3.0' });

const isLayoutReady = ref(false);

const editor = computed(() => {
    if (!cloud.data.value) {
        return null;
    }

    return cloud.data.value.CKEditor.ClassicEditor;
});

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});
const emit = defineEmits(['update:modelValue']);

const config = computed(() => {
    if (!isLayoutReady.value) {
        return null;
    }

    const {
        Alignment,
        AutoImage,
        AutoLink,
        Autosave,
        BlockQuote,
        Bold,
        Bookmark,
        Code,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Heading,
        Highlight,
        HorizontalLine,
        ImageBlock,
        ImageCaption,
        ImageEditing,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUtils,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        Paragraph,
        RemoveFormat,
        SimpleUploadAdapter,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        Underline
    } = cloud.data.value.CKEditor;

    return {
        toolbar: {
            items: ['heading', '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'underline', '|', 'link', 'insertImage', 'insertTable', 'highlight', 'blockQuote', '|', 'alignment', '|', 'outdent', 'indent'],
            shouldNotGroupWhenFull: false
        },
        plugins: [
            Alignment,
            AutoImage,
            AutoLink,
            Autosave,
            BlockQuote,
            Bold,
            Bookmark,
            Code,
            Essentials,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            Heading,
            Highlight,
            HorizontalLine,
            ImageBlock,
            ImageCaption,
            ImageEditing,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUtils,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            Paragraph,
            RemoveFormat,
            SimpleUploadAdapter,
            Strikethrough,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            Underline,
            CustomUploadAdapterPlugin
        ],
        fontFamily: {
            supportAllValues: true
        },
        fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22],
            supportAllValues: true
        },
        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph'
                },
                {
                    model: 'heading1',
                    view: 'h1',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1'
                },
                {
                    model: 'heading2',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2'
                },
                {
                    model: 'heading3',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3'
                },
                {
                    model: 'heading4',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading4'
                },
                {
                    model: 'heading5',
                    view: 'h5',
                    title: 'Heading 5',
                    class: 'ck-heading_heading5'
                },
                {
                    model: 'heading6',
                    view: 'h6',
                    title: 'Heading 6',
                    class: 'ck-heading_heading6'
                }
            ]
        },
        image: {
            toolbar: ['toggleImageCaption', 'imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'resizeImage']
        },
        initialData: props.modelValue,
        licenseKey: LICENSE_KEY,
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                }
            }
        },
        menuBar: {
            isVisible: true
        },
        placeholder: 'Type or paste your content here!',
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
        }
    };
});

onMounted(() => {
    isLayoutReady.value = true;
});
const handleEditorChange = (data) => {
    emit('update:modelValue', data);
};
</script>
<template>
    <div class="main-container">
        <div class="editor-container editor-container_classic-editor">
            <div class="editor-container__editor">
                <div>
                    <ckeditor v-if="editor && config" :modelValue="modelValue" :editor="editor" :config="config" @update:modelValue="handleEditorChange" />
                </div>
            </div>
        </div>
    </div>
</template>
