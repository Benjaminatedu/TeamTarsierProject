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
}