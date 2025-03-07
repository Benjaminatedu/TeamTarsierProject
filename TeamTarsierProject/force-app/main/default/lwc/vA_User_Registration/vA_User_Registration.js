import { LightningElement, track} from 'lwc';
import createUser from '@salesforce/apex/VAUserCreationController.createUser';
export default class VA_User_Registration extends LightningElement {
    @track username = '';
    @track email = '';
    @track firstName = '';
    @track lastName = '';
    @track alias = '';
    @track communityNickname = '';
    @track error;
    @track successMessage;

    // Handle input changes
    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    // Handle registration
    handleRegister() {
        this.error = undefined;
        this.successMessage = undefined;

        // Call Apex method to create user
        createUser({
            username: this.username,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            alias: this.alias,
            communityNickname: this.communityNickname
        })
        .then(result => {
            this.successMessage = result;
            this.clearForm();
           
        })
        .catch(error => {
            this.error = error.body.message;
        });
    }

    // Clear form fields
    clearForm() {
        this.username = '';
        this.email = '';
        this.firstName = '';
        this.lastName = '';
        this.alias = '';
        this.communityNickname = '';
    }
}