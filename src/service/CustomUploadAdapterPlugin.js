import CloudinaryUploadAdapter from './CloudinaryUploadAdapter';

export default function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CloudinaryUploadAdapter(loader);
    };
}
