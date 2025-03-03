public class UserInfoController {
    public Account mostRecentAccount { get; private set; }
    public List<Case> accountCases { get; private set; }

    public UserInfoController() {
        // Query the most recently created Account for the current user
        List<Account> mostRecentAccounts = [SELECT Id, Name, Phone, Date_of_Birth__c, 
                                                   Military_Branch__c, Current_Disability_Rating__c
                                            FROM Account 
                                            WHERE Veteran_del__c = :UserInfo.getUserId() 
                                            ORDER BY CreatedDate DESC 
                                            LIMIT 1];

        // If no accounts are found, initialize an empty list for cases
        if (mostRecentAccounts.isEmpty()) {
            mostRecentAccount = null;
            accountCases = new List<Case>();
        } else {
            mostRecentAccount = mostRecentAccounts[0];

            // Query Cases associated with the most recent Account
            accountCases = [SELECT CaseNumber, Subject, Description, Status, Origin, 
                                   Claim_Type__c, Reason
                            FROM Case 
                            WHERE AccountId = :mostRecentAccount.Id 
                            ORDER BY CreatedDate DESC];
        }
    }

    // New method to fetch the most recent Account ID for the current user
    @AuraEnabled(cacheable=true)
    public static Id getMostRecentAccountId() {
        // Query the most recently created Account for the current user
        List<Account> mostRecentAccounts = [SELECT Id 
                                            FROM Account 
                                            WHERE Veteran_del__c = :UserInfo.getUserId() 
                                            ORDER BY CreatedDate DESC 
                                            LIMIT 1];

        // Return the Account ID if found, otherwise return null
        return mostRecentAccounts.isEmpty() ? null : mostRecentAccounts[0].Id;
    }
}