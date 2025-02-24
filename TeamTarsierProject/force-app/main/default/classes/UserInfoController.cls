public with sharing class UserInfoController {
    public Account mostRecentAccount { get; private set; }
    public List<Case> accountCases { get; private set; }

    public UserInfoController() {
        // Query the most recently created Account for the current user
        mostRecentAccount = [SELECT Id, Name, Phone, Date_of_Birth__c, 
                                    Military_Branch__c, Current_Disability_Rating__c
                             FROM Account 
                             WHERE OwnerId = :UserInfo.getUserId() 
                             ORDER BY CreatedDate DESC 
                             LIMIT 1];

        // Query Cases associated with the most recent Account
        accountCases = [SELECT CaseNumber, Subject, Description, Status, Origin, 
                               Claim_Type__c, Reason
                        FROM Case 
                        WHERE AccountId = :mostRecentAccount.Id 
                        ORDER BY CreatedDate DESC];
    }
}