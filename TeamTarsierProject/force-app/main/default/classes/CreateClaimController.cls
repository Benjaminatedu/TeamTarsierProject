public with sharing class CreateClaimController {
    @AuraEnabled
    public static Case createCase(
        String claimType, 
        String reason, 
        String subject, 
        String description, 
        Id veteranId,
        Boolean serviceConnectedInjury,
        Date dateOfInjury,
        Boolean age65OrPermanentlyDisabled,
        String currentHealthStatus,
        String typeOfTrainingEducation,
        String educationTrainingInstitute,
        String housingStatus
    ) {
        try {
            // Validate required input
            if (String.isBlank(claimType)) {
                throw new AuraHandledException('Claim Type is required.');
            }
            if (String.isBlank(reason)) {
                throw new AuraHandledException('Reason is required.');
            }
            if (String.isBlank(subject)) {
                throw new AuraHandledException('Subject is required.');
            }
            if (String.isBlank(description)) {
                throw new AuraHandledException('Description is required.');
            }
            if (veteranId == null) {
                throw new AuraHandledException('Veteran ID is required.');
            }

            // Create a new Case record
            Case newCase = new Case();
            newCase.RecordTypeId = '0124U0000003OS9QAM'; // Replace with your Record Type ID
            newCase.Claim_Type__c = claimType;
            newCase.Reason = reason;
            newCase.Subject = subject;
            newCase.Description = description;
            newCase.Veteran__c = veteranId;
            newCase.Status = 'Received';
            newCase.Origin = 'Web';
            newCase.AccountId = veteranId;

            // Add fields based on claim type
            if (claimType == 'Disability') {
                newCase.Service_Connected_Injury__c = serviceConnectedInjury;
                newCase.Date_Of_Injury__c = dateOfInjury;
            } else if (claimType == 'Pension') {
                newCase.Age_65_or_Permanently_Disabled__c = age65OrPermanentlyDisabled;
            } else if (claimType == 'Healthcare') {
                newCase.Current_Health_Status__c = currentHealthStatus;
            } else if (claimType == 'Education') {
                newCase.Type_of_Training_Education__c = typeOfTrainingEducation;
                newCase.Education_Training_Institute__c = educationTrainingInstitute;
            } else if (claimType == 'Housing') {
                newCase.Housing_Status__c = housingStatus;
            }

            // Use Database.DMLOptions to trigger assignment rules
            Database.DMLOptions dmlOpts = new Database.DMLOptions();
            dmlOpts.assignmentRuleHeader.useDefaultRule = true; 
            newCase.setOptions(dmlOpts);

            // Insert the case
            insert newCase;

            // Return the newly created case
            return newCase;
        } catch (Exception e) {
            // Log the error for debugging
            System.debug('Error creating case: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());

            // Throw an AuraHandledException to propagate the error to the LWC
            throw new AuraHandledException('Failed to create case: ' + e.getMessage());
        }
    }
}