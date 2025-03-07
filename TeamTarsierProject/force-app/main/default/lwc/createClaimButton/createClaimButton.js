import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getMostRecentAccountId from '@salesforce/apex/UserInfoController.getMostRecentAccountId';
import createCase from '@salesforce/apex/CreateClaimController.createCase';

export default class CreateClaimButton extends NavigationMixin(LightningElement) {
    showForm = false; // Whether to show the form
    isLoading = false; // Loading state
    showAdditionalFields = false; // Whether to show additional fields

    // Form fields
    claimType = '';
    reason = '';
    subject = '';
    description = '';
    veteranId; // Veteran__c lookup field

    // Additional fields based on claim type
    serviceConnectedInjury = false;
    dateOfInjury = '';
    age65OrPermanentlyDisabled = false;
    currentHealthStatus = '';
    typeOfTrainingEducation = '';
    educationTrainingInstitute = '';
    housingStatus = '';

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

    // Health Status options
    healthStatusOptions = [
        { label: 'No Service-Connected Disabilities', value: 'No Service-Connected Disabilities' },
        { label: 'Service-Connected Disability', value: 'Service-Connected Disability' },
        { label: 'Individual Unemployability', value: 'Individual Unemployability' },
        { label: 'Non-Service-Connected Disability', value: 'Non-Service-Connected Disability' }
    ];

    // Education options
    educationOptions = [
        { label: 'No Formal Education', value: 'No Formal Education' },
        { label: 'High School Diploma or GED', value: 'High School Diploma or GED' },
        { label: 'Some College Trade School', value: 'Some College Trade School' },
        { label: "Associate's Degree", value: "Associate's Degree" },
        { label: "Bachelor's Degree", value: "Bachelor's Degree" },
        { label: "Master's Degree", value: "Master's Degree" },
        { label: 'Doctorate Professional Degree', value: 'Doctorate Professional Degree' },
        { label: 'Military Training', value: 'Military Training' },
        { label: 'Vocational Technical Certification', value: 'Vocational Technical Certification' },
        { label: 'On the Job Training', value: 'On the Job Training' }
    ];

    // Housing Status options
    housingStatusOptions = [
        { label: 'Stable Housing', value: 'Stable Housing' },
        { label: 'Homeless', value: 'Homeless' },
        { label: 'At Risk of Homelessness', value: 'At Risk of Homelessness' },
        { label: 'Temporary Housing', value: 'Temporary Housing' },
        { label: 'Living with Family/Friends', value: 'Living with Family/Friends' },
        { label: 'Assisted Living Facility', value: 'Assisted Living Facility' },
        { label: 'VA-Supported Housing (HUD-VASH)', value: 'VA-Supported Housing (HUD-VASH)' },
        { label: 'Long-Term Care Facility', value: 'Long-Term Care Facility' },
        { label: 'Transitional Housing', value: 'Transitional Housing' },
        { label: 'Emergency Shelter', value: 'Emergency Shelter' }
    ];

    // Helper methods to determine which fields to show
    get isDisability() {
        return this.claimType === 'Disability';
    }

    get isPension() {
        return this.claimType === 'Pension';
    }

    get isHealthcare() {
        return this.claimType === 'Healthcare';
    }

    get isEducation() {
        return this.claimType === 'Education';
    }

    get isHousing() {
        return this.claimType === 'Housing';
    }
    
    get dontShowForm() {
        return !this.showForm;
    }


    

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
        this.showAdditionalFields = true; // Show additional fields when claim type is selected
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

    handleServiceConnectedInjuryChange(event) {
        this.serviceConnectedInjury = event.target.checked;
    }

    handleDateOfInjuryChange(event) {
        this.dateOfInjury = event.target.value;
    }

    handleAge65OrPermanentlyDisabledChange(event) {
        this.age65OrPermanentlyDisabled = event.target.checked;
    }

    handleCurrentHealthStatusChange(event) {
        this.currentHealthStatus = event.detail.value;
    }

    handleTypeOfTrainingEducationChange(event) {
        this.typeOfTrainingEducation = event.detail.value;
    }

    handleEducationTrainingInstituteChange(event) {
        this.educationTrainingInstitute = event.target.value;
    }

    handleHousingStatusChange(event) {
        this.housingStatus = event.detail.value;
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
                veteranId: this.veteranId,
                serviceConnectedInjury: this.serviceConnectedInjury,
                dateOfInjury: this.dateOfInjury,
                age65OrPermanentlyDisabled: this.age65OrPermanentlyDisabled,
                currentHealthStatus: this.currentHealthStatus,
                typeOfTrainingEducation: this.typeOfTrainingEducation,
                educationTrainingInstitute: this.educationTrainingInstitute,
                housingStatus: this.housingStatus
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
        this.showAdditionalFields = false;
        this.claimType = '';
        this.reason = '';
        this.subject = '';
        this.description = '';
        this.serviceConnectedInjury = false;
        this.dateOfInjury = '';
        this.age65OrPermanentlyDisabled = false;
        this.currentHealthStatus = '';
        this.typeOfTrainingEducation = '';
        this.educationTrainingInstitute = '';
        this.housingStatus = '';
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