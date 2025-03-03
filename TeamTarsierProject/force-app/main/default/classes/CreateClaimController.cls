public class CreateClaimController {
    @AuraEnabled
    public static void createCase(String claimType, String reason, String subject, String description, Id veteranId) {
        // Create a new Case record
        Case newCase = new Case();
        newCase.RecordTypeId = '0124U0000003OS9QAM';
        newCase.Claim_Type__c = claimType;
        newCase.Reason = reason;
        newCase.Subject = subject;
        newCase.Description = description;
        newCase.Veteran__c = veteranId;
        newCase.Status = 'Received';
        newCase.Origin = 'Web';
        newCase.AccountId = veteranId;

        insert newCase;
    }
}