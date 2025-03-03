import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'; // Import NavigationMixin
import getMostRecentAccountId from '@salesforce/apex/UserInfoController.getMostRecentAccountId';
import createCase from '@salesforce/apex/CreateClaimController.createCase';

export default class CreateClaimButton extends NavigationMixin(LightningElement) { // Use NavigationMixin
    showForm = false; // Whether to show the form
    isLoading = false; // Loading state

    get dontShowForm() {
        return !this.showForm;
    }

    // Form fields
    claimType = '';
    reason = '';
    subject = '';
    description = '';
    veteranId; // Veteran__c lookup field

    // Claim Type options
    claimTypeOptions = [
        { label: 'Disability', value: 'Disability' },
        { label: 'Pension', value: 'Pension' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Education', value: 'Education' },
        { label: 'Housing', value: 'Housing' }
    ];

    // Reason options
    reasonOptions = [
        { label: 'New Problem', value: 'New Problem' },
        { label: 'Missing Documentation', value: 'Missing Documentation' },
        { label: 'Incorrect Claim Information', value: 'Incorrect Claim Information' },
        { label: 'Delayed Processing', value: 'Delayed Processing' },
        { label: 'Denied Claim Inquiry', value: 'Denied Claim Inquiry' },
        { label: 'Duplicated Claim', value: 'Duplicated Claim' },
        { label: 'Eligibility Question', value: 'Eligibility Question' },
        { label: 'Evidence Submission', value: 'Evidence Submission' },
        { label: 'Service-Connected Disability Inquiry', value: 'Service-Connected Disability Inquiry' },
        { label: 'Compensation Adjustment Request', value: 'Compensation Adjustment Request' }
    ];

    // Open the form when the button is clicked
    async handleButtonClick() {
        this.isLoading = true;
        try {
            // Fetch the most recent account ID (Veteran__c) for the current user
            this.veteranId = await getMostRecentAccountId();
            if (!this.veteranId) {
                this.showToast('Error', 'No account found for the current user.', 'error');
                return;
            }
            this.showForm = true; // Show the form
        } catch (error) {
            this.showToast('Error', 'Failed to fetch account information.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Handle form field changes
    handleClaimTypeChange(event) {
        this.claimType = event.detail.value;
    }

    handleReasonChange(event) {
        this.reason = event.detail.value;
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    // Handle form submission
    async handleSubmit() {
        if (!this.claimType || !this.reason || !this.subject || !this.description) {
            this.showToast('Error', 'Please fill out all fields.', 'error');
            return;
        }

        this.isLoading = true;
        try {
            // Call Apex method to create the case
            await createCase({
                claimType: this.claimType,
                reason: this.reason,
                subject: this.subject,
                description: this.description,
                veteranId: this.veteranId
            });

            // Show success message
            this.showToast('Success', 'Case created successfully.', 'success');

            // Reload the page
            this.reloadPage();
        } catch (error) {
            this.showToast('Error', 'Failed to create case.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Handle form cancellation
    handleCancel() {
        this.resetForm();
    }

    // Reset the form
    resetForm() {
        this.showForm = false;
        this.claimType = '';
        this.reason = '';
        this.subject = '';
        this.description = '';
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    // Reload the current page
    reloadPage() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: window.location.href // Reload the current page
            }
        }).then(url => {
            window.location.href = url; // Navigate to the same URL to reload the page
        });
    }
}