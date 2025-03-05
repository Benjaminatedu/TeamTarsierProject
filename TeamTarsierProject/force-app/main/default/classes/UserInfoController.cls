public class UserInfoController {
    // Wrapper class for Account information
    public class AccountWrapper {
        public String Id { get; set; }
        public String Name { get; set; }
        public String Phone { get; set; }
        public Date DateOfBirth { get; set; }
        public String MilitaryBranch { get; set; }
        public Decimal CurrentDisabilityRating { get; set; }
    }

    // Wrapper class for Case information
    public class CaseWrapper {
        public String CaseNumber { get; set; }
        public String Subject { get; set; }
        public String Description { get; set; }
        public String Status { get; set; }
        public String Origin { get; set; }
        public String ClaimType { get; set; }
        public String Reason { get; set; }
    }

    // Public properties to expose the wrapped data
    public AccountWrapper mostRecentAccount { get; set; }
    public List<CaseWrapper> accountCases { get; set; }

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
            accountCases = new List<CaseWrapper>();
        } else {
            // Wrap the most recent Account
            mostRecentAccount = new AccountWrapper();
            mostRecentAccount.Id = mostRecentAccounts[0].Id;
            mostRecentAccount.Name = mostRecentAccounts[0].Name;
            mostRecentAccount.Phone = mostRecentAccounts[0].Phone;
            mostRecentAccount.DateOfBirth = mostRecentAccounts[0].Date_of_Birth__c;
            mostRecentAccount.MilitaryBranch = mostRecentAccounts[0].Military_Branch__c;
            mostRecentAccount.CurrentDisabilityRating = mostRecentAccounts[0].Current_Disability_Rating__c;

            // Query Cases associated with the most recent Account
            List<Case> cases = [SELECT CaseNumber, Subject, Description, Status, Origin, 
                                       Claim_Type__c, Reason
                                FROM Case 
                                WHERE AccountId = :mostRecentAccounts[0].Id 
                                ORDER BY CreatedDate DESC];

            // Wrap the Cases
            accountCases = new List<CaseWrapper>();
            for (Case c : cases) {
                CaseWrapper caseWrapper = new CaseWrapper();
                caseWrapper.CaseNumber = c.CaseNumber;
                caseWrapper.Subject = c.Subject;
                caseWrapper.Description = c.Description;
                caseWrapper.Status = c.Status;
                caseWrapper.Origin = c.Origin;
                caseWrapper.ClaimType = c.Claim_Type__c;
                caseWrapper.Reason = c.Reason;
                accountCases.add(caseWrapper);
            }
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