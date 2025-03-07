import { LightningElement, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/User.LastName';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import STREET_FIELD from '@salesforce/schema/User.Street';
import CITY_FIELD from '@salesforce/schema/User.City';
import STATE_FIELD from '@salesforce/schema/User.State';
import POSTAL_CODE_FIELD from '@salesforce/schema/User.PostalCode';
import COUNTRY_FIELD from '@salesforce/schema/User.Country';
import PHONE_FIELD from '@salesforce/schema/User.Phone';
import getMostRecentAccount from '@salesforce/apex/UserInfoController.getMostRecentAccount';
import updateUser from '@salesforce/apex/UserInfoController.updateUser';
import updateAccount from '@salesforce/apex/UserInfoController.updateAccount';

export default class UserProfile extends LightningElement {
    // User Information
    @track firstName;
    @track lastName;
    @track email;
    @track street;
    @track city;
    @track state;
    @track postalCode;
    @track country;
    @track phoneNumber;

    // Account Information
    @track accountId;
    @track accountName;
    @track accountPhone;
    @track accountDateOfBirth;
    @track accountMilitaryBranch;
    @track accountDisabilityRating;

    // Military Service Information (from lookup)
    @track dischargeStatus;
    @track serviceEndDate;
    @track serviceStartDate;

    // Edit Mode
    @track isEditMode = false;

    // Fetch User Information
    @wire(getRecord, {
        recordId: USER_ID,
        fields: [
            FIRST_NAME_FIELD,
            LAST_NAME_FIELD,
            EMAIL_FIELD,
            STREET_FIELD,
            CITY_FIELD,
            STATE_FIELD,
            POSTAL_CODE_FIELD,
            COUNTRY_FIELD,
            PHONE_FIELD
        ]
    })
    wiredUser({ error, data }) {
        if (data) {
            this.firstName = data.fields.FirstName.value ?? '';
            this.lastName = data.fields.LastName.value ?? '';
            this.email = data.fields.Email.value ?? '';
            this.street = data.fields.Street.value ?? '';
            this.city = data.fields.City.value ?? '';
            this.state = data.fields.State.value ?? '';
            this.postalCode = data.fields.PostalCode.value ?? '';
            this.country = data.fields.Country.value ?? '';
            this.phoneNumber = data.fields.Phone.value ?? '';
        } else if (error) {
            console.error('Error fetching user data', error);
        }
    }

    // Fetch Account Information
    @wire(getMostRecentAccount)
    wiredAccount({ error, data }) {
        if (data) {
            this.accountId = data.Id ?? '';
            this.accountName = data.Name ?? '';
            this.accountPhone = data.Phone ?? '';
            this.accountDateOfBirth = data.DateOfBirth ?? '';
            this.accountMilitaryBranch = data.MilitaryBranch ?? '';
            this.accountDisabilityRating = data.CurrentDisabilityRating ?? '';
            this.dischargeStatus = data.DischargeStatus ?? '';
            this.serviceEndDate = data.ServiceEndDate ?? '';
            this.serviceStartDate = data.ServiceStartDate ?? '';
        } else if (error) {
            console.error('Error fetching account data', error);
        } else {
            console.log('No account data found');
        }
    }

    // Toggle Edit Mode
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
    }

    // Handle Input Changes
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        if (field.startsWith('account')) {
            this[field] = value;
        } else {
            this[field] = value;
        }
    }

    // Save Changes
    async saveChanges() {
        try {
            // Update User
            await updateUser({
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                street: this.street,
                city: this.city,
                state: this.state,
                postalCode: this.postalCode,
                country: this.country,
                phoneNumber: this.phoneNumber
            });

            // Refresh Data
            await Promise.all([
                refreshApex(this.wiredUser)
            ]);

            // Exit Edit Mode
            this.isEditMode = false;
        } catch (error) {
            console.error('Error saving changes:', error);
            // Display error message to the user
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'An error occurred while saving changes. Please try again.',
                variant: 'error',
            });
            this.dispatchEvent(toastEvent);
        }
    }
}