import { LightningElement, api } from 'lwc';
import canCreateAppeal from '@salesforce/apex/CreateAppealController.canCreateAppeal';
import createAppeal from '@salesforce/apex/CreateAppealController.createAppeal';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateAppealButton extends NavigationMixin(LightningElement) {
    _claimId; // Private property to store the claimId
    showButton = true;
    showForm = false;
    showSuccessMessage = false;
    message = '';
    isError = false;
    isButtonDisabled = true; // Button is disabled by default

    appealType = '';
    description = '';

    appealTypeOptions = [
        { label: 'New Evidence', value: 'New Evidence' },
        { label: 'Review Request', value: 'Review Request' },
        { label: 'Hearing Request', value: 'Hearing Request' },
        { label: 'Other', value: 'Other' }
    ];

    // Setter for claimId to react to changes
    @api
    get claimId() {
        return this._claimId;
    }

    set claimId(value) {
        this._claimId = value;
        this.checkAppealCreation(); // Re-run the check when claimId changes
    }

    // Method to check if an appeal can be created
    checkAppealCreation() {
        if (!this.claimId) {
            this.message = 'No claim selected.';
            this.isError = true;
            this.isButtonDisabled = true; // Disable the button if no claim is selected
            return;
        }

        canCreateAppeal({ claimId: this.claimId })
            .then(result => {
                this.isButtonDisabled = !result.canCreate; // Disable the button if canCreate is false
                if (!result.canCreate) {
                    this.message = result.disableReason; 
                    this.isError = true;
                } else {
                    this.message = ''; 
                    this.isError = false;
                }
            })
            .catch(error => {
                console.error('Error checking appeal creation status:', error);
                this.message = 'An error occurred while checking appeal eligibility.';
                this.isError = true;
                this.isButtonDisabled = true; 
            });
    }

    // Handle button click to show the form
    handleButtonClick() {
        if (!this.claimId) {
            this.message = 'No claim selected.';
            this.isError = true;
            return;
        }

        // Check if an appeal can be created
        canCreateAppeal({ claimId: this.claimId })
            .then(result => {
                if (!result.canCreate) {
                    this.message = result.disableReason; // Display the reason why appeal creation is not allowed
                    this.isError = true;
                } else {
                    this.showButton = false; // Hide the button
                    this.showForm = true; 
                    this.message = ''; 
                }
            })
            .catch(error => {
                console.error('Error checking appeal creation status:', error);
                this.message = 'An error occurred while checking appeal eligibility.';
                this.isError = true;
            });
    }

    // Handle appeal type change
    handleAppealTypeChange(event) {
        this.appealType = event.detail.value;
    }

    // Handle description change
    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }

    // Handle form submission
    handleSubmit() {
        if (!this.appealType || !this.description) {
            this.message = 'Please fill out all fields.';
            this.isError = true;
            return;
        }

        // Call Apex method to create the appeal
        createAppeal({
            claimId: this.claimId,
            appealType: this.appealType,
            description: this.description
        })
            .then(() => {
                this.showForm = false; 
                this.showSuccessMessage = true; 
                this.message = ''; // Clear any previous messages
                setTimeout(() => {
                    this.reloadPage();
                }, 2000); // Reset after 2 seconds
            })
            .catch(error => {
                console.error('Error creating appeal:', error);
                this.message = 'An error occurred while creating the appeal.';
                this.isError = true;
            });
    }

    // Handle form cancellation
    handleCancel() {
        this.showForm = false; 
        this.showButton = true; 
        this.message = ''; 
    }

    reloadPage() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: window.location.href 
            }
        }).then(url => {
            window.location.href = url; 
        });
    }
}