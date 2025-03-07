import { LightningElement } from 'lwc';

export default class ClaimsAndAppeals extends LightningElement {
    selectedClaimId;

    handleClaimSelected(event) {
        this.selectedClaimId = event.detail.claimId; 
    }
}