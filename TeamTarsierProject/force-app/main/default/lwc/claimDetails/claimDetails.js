import { LightningElement, api, wire } from 'lwc';
import getClaimDetails from '@salesforce/apex/ClaimCasesController.getClaimDetails';
import createAttachment from '@salesforce/apex/ClaimCasesController.createAttachment';
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
        } else if (error) {
            this.claim = undefined;
            this.appeals = [];
            this.attachments = [];
            this.error = 'Error loading claim details: ' + error.body.message;
            console.error('Error:', error);
        }
    }



    // Handle the "Add Attachment" button click
        handleAddAttachment(event) {
            const caseId = event.target.dataset.id;
            const fileInput = this.template.querySelector(`input[data-id="${caseId}"]`);
            fileInput.click();
        }
    
        // Handle file selection
        handleFileChange(event) {
            const caseId = event.target.dataset.id;
            const file = event.target.files[0];
            if (file) {
                this.uploadFile(caseId, file);
            }
        }
    
        // Upload the file and create an attachment using Apex
        async uploadFile(caseId, file) {
            const base64 = await this.toBase64(file);
            try {
                // Call the Apex method to create the attachment
                await createAttachment({
                    parentId: caseId,
                    fileName: file.name,
                    base64Data: base64.split(',')[1] // Remove the data URL prefix
                });
    
                // Show a success toast
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Attachment uploaded successfully',
                        variant: 'success',
                    }),
                );
            } catch (error) {
                // Show an error toast
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error uploading attachment',
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