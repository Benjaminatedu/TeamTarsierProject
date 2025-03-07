public with sharing class UserInfoController {
    // Wrapper class for Account
    public class AccountWrapper {
        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public String Name { get; set; }
        @AuraEnabled public String Phone { get; set; }
        @AuraEnabled public Date DateOfBirth { get; set; }
        @AuraEnabled public String MilitaryBranch { get; set; }
        @AuraEnabled public Decimal CurrentDisabilityRating { get; set; }
        @AuraEnabled public String DischargeStatus { get; set; } // From Military_Service__c
        @AuraEnabled public Date ServiceEndDate { get; set; } // From Military_Service__c
        @AuraEnabled public Date ServiceStartDate { get; set; } // From Military_Service__c
    }

     // Wrapper class for Case
     public class CaseWrapper {
        @AuraEnabled public String CaseNumber { get; set; }
        @AuraEnabled public String Subject { get; set; }
        @AuraEnabled public String Description { get; set; }
        @AuraEnabled public String Status { get; set; }
        @AuraEnabled public String Origin { get; set; }
        @AuraEnabled public String ClaimType { get; set; }
        @AuraEnabled public String Reason { get; set; }
    }

    // Get Most Recent Account
    @AuraEnabled(cacheable=true)
    public static AccountWrapper getMostRecentAccount() {
        // Query the most recent Account for the current user
        List<Account> mostRecentAccounts = [SELECT Id, Name, Phone, Date_of_Birth__c, 
                                                   Military_Branch__c, Current_Disability_Rating__c,
                                                   Military_Service__r.Discharge_Status__c, 
                                                   Military_Service__r.Service_End_Date__c, 
                                                   Military_Service__r.Service_Start_Date__c 
                                            FROM Account 
                                            WHERE Veteran_del__c = :UserInfo.getUserId() 
                                            ORDER BY CreatedDate DESC 
                                            LIMIT 1];

        // If no accounts are found, return null
        if (mostRecentAccounts.isEmpty()) {
            return null;
        }

        // Get the first (and only) account from the list
        Account mostRecentAccount = mostRecentAccounts[0];

        // Wrap the most recent Account
        AccountWrapper mostRecentAccountWrapper = new AccountWrapper();
        mostRecentAccountWrapper.Id = mostRecentAccount.Id;
        mostRecentAccountWrapper.Name = mostRecentAccount.Name;
        mostRecentAccountWrapper.Phone = mostRecentAccount.Phone;
        mostRecentAccountWrapper.DateOfBirth = mostRecentAccount.Date_of_Birth__c;
        mostRecentAccountWrapper.MilitaryBranch = mostRecentAccount.Military_Branch__c;
        mostRecentAccountWrapper.CurrentDisabilityRating = mostRecentAccount.Current_Disability_Rating__c;

        // Add Military Service fields
        if (mostRecentAccount.Military_Service__c != null) {
            mostRecentAccountWrapper.DischargeStatus = mostRecentAccount.Military_Service__r.Discharge_Status__c;
            mostRecentAccountWrapper.ServiceEndDate = mostRecentAccount.Military_Service__r.Service_End_Date__c;
            mostRecentAccountWrapper.ServiceStartDate = mostRecentAccount.Military_Service__r.Service_Start_Date__c;
        }

        return mostRecentAccountWrapper;
    }

    // Update User
    @AuraEnabled
    public static void updateUser(String firstName, String lastName, String email, String street, 
                                 String city, String state, String postalCode, String country, 
                                 String phoneNumber) {
        try {
            // Get the current user
            User currentUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            // Update the user fields
            currentUser.FirstName = firstName;
            currentUser.LastName = lastName;
            currentUser.Email = email;
            currentUser.Street = street;
            currentUser.City = city;
            currentUser.State = state;
            currentUser.PostalCode = postalCode;
            currentUser.Country = country;
            currentUser.Phone = phoneNumber;

            // Save changes
            update currentUser;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating user: ' + e.getMessage());
        }
    }

    // Update Account
    @AuraEnabled
    public static void updateAccount(String accountId, Date dateOfBirth, String militaryBranch, 
                                    Decimal disabilityRating) {
        try {
            // Get the account
            Account accountToUpdate = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];

            // Update the account fields
            accountToUpdate.Date_of_Birth__c = dateOfBirth;
            accountToUpdate.Military_Branch__c = militaryBranch;
            accountToUpdate.Current_Disability_Rating__c = disabilityRating;

            // Save changes
            update accountToUpdate;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating account: ' + e.getMessage());
        }
    }


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