import { LightningElement, wire } from 'lwc';
import getClaimCases from '@salesforce/apex/ClaimCasesController.getClaimCases';
import createAttachment from '@salesforce/apex/ClaimCasesController.createAttachment'; // Import the Apex method
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ClaimCases extends LightningElement {
    cases;
    error;
    selectedClaimId; // Track the selected claim ID

    @wire(getClaimCases)
    wiredCases({ error, data }) {
        if (data) {
            // Add a statusClass and classString property to each case
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                statusClass: this.getStatusClass(caseRecord.Status),
                classString: this.getStatusClass(caseRecord.Status) // Initialize classString
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.cases = undefined;
        }
    }

    // Handle claim click and emit a custom event
    handleClaimClick(event) {
        const claimId = event.currentTarget.dataset.id;
        if (claimId) {
            this.selectedClaimId = claimId; // Update the selected claim ID
            this.updateClassStrings(); // Update class strings for all cases
            const selectedEvent = new CustomEvent('claimselected', {
                detail: { claimId }
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    // Method to determine the CSS class based on status
    getStatusClass(status) {
        switch (status) {
            case 'Received':
                return 'slds-box slds-m-around_x-small status-received';
            case 'Change Requested':
                return 'slds-box slds-m-around_x-small status-change-requested';
            case 'Under Review':
                return 'slds-box slds-m-around_x-small status-under-review';
            case 'Evidence Gathering':
                return 'slds-box slds-m-around_x-small status-evidence-gathering';
            case 'Decision Pending':
                return 'slds-box slds-m-around_x-small status-decision-pending';
            case 'Approved':
                return 'slds-box slds-m-around_x-small status-approved';
            case 'Denied':
                return 'slds-box slds-m-around_x-small status-denied';
            case 'New Closed':
                return 'slds-box slds-m-around_x-small status-new-closed';
            case 'Pending Review':
                return 'slds-box slds-m-around_x-small status-pending-review';
            default:
                return 'slds-box slds-m-around_x-small';
        }
    }

    // Method to update class strings for all cases
    updateClassStrings() {
        this.cases = this.cases.map(caseRecord => ({
            ...caseRecord,
            classString: this.getStatusClass(caseRecord.Status) + (this.selectedClaimId === caseRecord.Id ? ' selected-claim' : '')
        }));
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