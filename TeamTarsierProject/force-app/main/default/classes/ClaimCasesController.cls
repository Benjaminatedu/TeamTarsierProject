public with sharing class ClaimCasesController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getClaimCases() {
        try {
            // Query the most recent account owned by the current user
            List<Account> mostRecentAccounts = [SELECT Id 
                                               FROM Account 
                                               WHERE Veteran_del__c = :UserInfo.getUserId() 
                                               ORDER BY CreatedDate DESC 
                                               LIMIT 1];

            // If no accounts are found, return an empty list
            if (mostRecentAccounts.isEmpty()) {
                return new List<Case>();
            }

            // Query cases associated with the most recent account
            return [SELECT Id, CaseNumber, Subject, Status, Description 
                    FROM Case 
                    WHERE AccountId = :mostRecentAccounts[0].Id 
                    AND RecordType.DeveloperName = 'Claim' 
                    ORDER BY CreatedDate DESC];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void createAttachment(Id parentId, String fileName, String base64Data) {
        try {
            // Create a new Attachment record
            Attachment attachment = new Attachment();
            attachment.ParentId = parentId; // The Case Id
            attachment.Name = fileName;
            attachment.Body = EncodingUtil.base64Decode(base64Data); // Decode the base64 data
            insert attachment;

            System.debug('Attachment created successfully: ' + attachment.Id);
        } catch (Exception e) {
            System.debug('Error creating attachment: ' + e.getMessage());
            throw new AuraHandledException('Error creating attachment: ' + e.getMessage());
        }
    }
}