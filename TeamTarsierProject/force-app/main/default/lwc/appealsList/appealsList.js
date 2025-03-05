import { LightningElement, api } from 'lwc';
import getAllAppeals from '@salesforce/apex/AppealsController.getAllAppeals';
import uploadFile from '@salesforce/apex/AppealsController.uploadFile'; // Apex method for uploading files
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppealsList extends LightningElement {
    appeals; // List of all appeals
    error; // Error message
    isLoading = false; // Loading state

    // Load appeals when the component is connected
    @api
    connectedCallback() {
        this.loadAppeals();
    }

    // Method to load all appeals
    loadAppeals() {
        this.isLoading = true; // Show loading spinner
        getAllAppeals()
            .then(result => {
                this.appeals = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.appeals = undefined;
            })
            .finally(() => {
                this.isLoading = false; // Hide loading spinner
            });
    }

    // Handle the "Add Attachment" button click
    handleAddAttachment(event) {
        const appealId = event.target.dataset.id; // Get the Appeal Id
        const fileInput = this.template.querySelector(`input[data-id="${appealId}"]`);
        fileInput.click(); // Trigger the file input dialog
    }

    // Handle file selection
    handleFileChange(event) {
        const appealId = event.target.dataset.id; // Get the Appeal Id
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            this.uploadFile(appealId, file); // Upload the file
        }
    }

    // Upload the file using Apex
    async uploadFile(appealId, file) {
        const base64 = await this.toBase64(file); // Convert the file to base64
        try {
            // Call the Apex method to upload the file
            await uploadFile({
                parentId: appealId,
                fileName: file.name,
                base64Data: base64.split(',')[1] // Remove the data URL prefix
            });

            // Show a success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'File uploaded successfully',
                    variant: 'success',
                }),
            );

            // Refresh the appeals list to show the new file
            this.loadAppeals();
        } catch (error) {
            // Show an error toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error uploading file',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    // Convert file to base64
    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}