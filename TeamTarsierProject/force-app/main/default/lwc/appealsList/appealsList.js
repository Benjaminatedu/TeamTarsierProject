import { api, LightningElement } from 'lwc';
import getAllAppeals from '@salesforce/apex/AppealsController.getAllAppeals';

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
}