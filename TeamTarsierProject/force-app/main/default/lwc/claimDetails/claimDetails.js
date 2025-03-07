import { LightningElement, api, wire } from 'lwc';
import getClaimDetails from '@salesforce/apex/ClaimCasesController.getClaimDetails';
import createAttachment from '@salesforce/apex/ClaimCasesController.createAttachment';
import uploadFile from '@salesforce/apex/AppealsController.uploadFile'; // Apex method for uploading files
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ClaimDetails extends LightningElement {
    @api selectedClaimId; // Selected claim ID passed from parent

    claim; // Claim data
    appeals = []; // List of appeals
    attachments = []; // List of attachments
    error; // Error message

    // Wire service to fetch claim details
    @wire(getClaimDetails, { claimId: '$selectedClaimId' })
    wiredClaimDetails({ error, data }) {
        if (data) {
            this.claim = data;
            this.appeals = data.appeals || [];
            this.attachments = data.attachments || [];
            this.error = undefined;
            console.log('Appeals:', this.appeals); // Debugging: Log the appeals data
        } else if (error) {
            this.claim = undefined;
            this.appeals = [];
            this.attachments = [];
            this.error = 'Error loading claim details: ' + error.body.message;
            console.error('Error:', error);
        }
    }

    // Handle the "Add File" button click
    handleAddAttachment(event) {
        console.log('Event Target:', event.currentTarget);
        console.log('Dataset:', event.currentTarget.dataset); 
        const parentId = event.currentTarget.dataset.id; 
        console.log('Parent ID:', parentId); 
        const fileInput = this.template.querySelector(`input[data-id="${parentId}"]`);
        if (fileInput) {
            fileInput.click(); 
        } else {
            console.error('File input not found for parentId:', parentId); 
        }
    }

    // Handle file selection
    handleFileChange(event) {
        const parentId = event.target.dataset.id; // Get the parent Id (could be case or appeal)
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(parentId, file);
        }
    }

    // Upload the file and create an attachment or file record using Apex
    async uploadFile(parentId, file) {
        const base64 = await this.toBase64(file);
        try {
            // Determine if the parent is a case or an appeal
            if (this.isCase(parentId)) {
                // Call the Apex method to create the attachment for cases
                await createAttachment({
                    parentId: parentId,
                    fileName: file.name,
                    base64Data: base64.split(',')[1] 
                });
            } else {
                // Call the Apex method to upload the file for appeals
                await uploadFile({
                    parentId: parentId,
                    fileName: file.name,
                    base64Data: base64.split(',')[1]
                });
            }

            // Show a success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'File uploaded successfully',
                    variant: 'success',
                }),
            );
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

    // Helper method to determine if the parent is a case
    isCase(parentId) {
        // Assuming that case IDs start with '500' and appeal IDs start with something else
        return parentId.startsWith('500');
    }
}