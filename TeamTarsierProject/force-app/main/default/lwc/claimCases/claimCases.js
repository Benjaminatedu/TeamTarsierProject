import { LightningElement, wire } from 'lwc';
import getClaimCases from '@salesforce/apex/ClaimCasesController.getClaimCases';

export default class ClaimCases extends LightningElement {
    cases;
    error;
    selectedClaimId;

    @wire(getClaimCases)
    wiredCases({ error, data }) {
        if (data) {
            // Add a statusClass and classString property to each case
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                statusClass: this.getStatusClass(caseRecord.Status),
                classString: this.getStatusClass(caseRecord.Status) 
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
            this.selectedClaimId = claimId; 
            this.updateClassStrings(); 
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
}