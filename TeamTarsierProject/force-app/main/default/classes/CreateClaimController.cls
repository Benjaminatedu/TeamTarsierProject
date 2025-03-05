public with sharing class CreateClaimController {
    @AuraEnabled
    public static Case createCase(String claimType, String reason, String subject, String description, Id veteranId) {
        try {
            // Validate input
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

            // Insert the case
            insert newCase;

            // Return the newly created case
            return newCase;
        } catch (Exception e) {
            // Throw an AuraHandledException to propagate the error to the LWC
            throw new AuraHandledException('Failed to create case: ' + e.getMessage());
        }
    }
}