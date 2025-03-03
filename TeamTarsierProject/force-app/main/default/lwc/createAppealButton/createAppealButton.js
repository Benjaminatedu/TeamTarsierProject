import { LightningElement, api } from 'lwc';
import canCreateAppeal from '@salesforce/apex/CreateAppealController.canCreateAppeal';
import createAppeal from '@salesforce/apex/CreateAppealController.createAppeal';
import { NavigationMixin } from 'lightning/navigation'; // Import NavigationMixin for page reload

export default class CreateAppealButton extends NavigationMixin(LightningElement) {
    @api claimId; // Claim ID passed from the parent component
    showButton = true; 
    showForm = false; 
    showSuccessMessage = false; 
    message = ''; 
    isError = false;

    appealType = ''; // Selected appeal type
    description = ''; // Entered description

    // Appeal type options for the combobox
    appealTypeOptions = [
        { label: 'New Evidence', value: 'New Evidence' },
        { label: 'Review Request', value: 'Review Request' },
        { label: 'Hearing Request', value: 'Hearing Request' },
        { label: 'Other', value: 'Other' }
    ];

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
                    this.showForm = true; // Show the form
                    this.message = ''; // Clear any previous messages
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
                this.showForm = false; // Hide the form
                this.showSuccessMessage = true; // Show the success message
                this.message = ''; // Clear any previous messages
                setTimeout(() => {
                    this.reloadPage();
                }, 2000); // Reset after 3 seconds
            })
            .catch(error => {
                console.error('Error creating appeal:', error);
                this.message = 'An error occurred while creating the appeal.';
                this.isError = true;
            });
    }

    // Handle form cancellation
    handleCancel() {
        this.showForm = false; // Hide the form
        this.showButton = true; // Show the button
        this.message = ''; // Clear any previous messages
    }


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