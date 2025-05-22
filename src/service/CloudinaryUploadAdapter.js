export default class CloudinaryUploadAdapter {
    constructor(loader) {
        // The file loader instance to use during the upload.
        this.loader = loader;
        // Cloudinary URL and preset.
        this.uploadUrl = 'https://api.cloudinary.com/v1_1/doora28z0/image/upload';
        this.uploadPreset = 'uczetjc4';
    }

    // Starts the upload process.
    upload() {
        return this.loader.file.then(
            (file) =>
                new Promise((resolve, reject) => {
                    // Prepare the form data.
                    const data = new FormData();
                    data.append('file', file);
                    data.append('upload_preset', this.uploadPreset);

                    // Send a POST request to Cloudinary.
                    fetch(this.uploadUrl, {
                        method: 'POST',
                        body: data
                    })
                        .then((response) => response.json())
                        .then((result) => {
                            // Cloudinary returns the secure_url which is used by CKEditor.
                            if (result.secure_url) {
                                resolve({
                                    default: result.secure_url
                                });
                            } else {
                                reject(result.error.message);
                            }
                        })
                        .catch((error) => {
                            reject('Upload failed: ' + error);
                        });
                })
        );
    }

    // Aborts the upload process.
    abort() {
        // This can be implemented if you need to handle aborting the upload.
    }
}
