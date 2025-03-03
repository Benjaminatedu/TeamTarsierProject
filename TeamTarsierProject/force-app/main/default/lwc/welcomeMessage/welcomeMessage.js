import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';

export default class welcomeMessage extends LightningElement {
    userFirstName;

    @wire(getRecord, { recordId: USER_ID, fields: [FIRST_NAME_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userFirstName = data.fields.FirstName.value;
        } else if (error) {
            console.error('Error fetching user data', error);
        }
    }
}