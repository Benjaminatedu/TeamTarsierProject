public class ClaimCasesController {



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

    @AuraEnabled(cacheable=true)
    public static ClaimWrapper getClaimDetails(String claimId) {
        ClaimWrapper claimWrapper = new ClaimWrapper();
        List<AppealWrapper> appeals = new List<AppealWrapper>();
        List<AttachmentWrapper> attachments = new List<AttachmentWrapper>();
    
        try {
            // Query Case (Claim) details            
            Case claim = [
                SELECT Subject, Description, CaseNumber, Status, Claim_Type__c, Reason, CreatedDate,
                       Service_Connected_Injury__c, Date_Of_Injury__c, Age_65_or_Permanently_Disabled__c,
                       Current_Health_Status__c, Type_of_Training_Education__c, Education_Training_Institute__c,
                       Housing_Status__c
                FROM Case
                WHERE Id = :claimId
                LIMIT 1
            ];
            
            claimWrapper.subject = claim.Subject;
            claimWrapper.description = claim.Description;
            claimWrapper.caseNumber = claim.CaseNumber;
            claimWrapper.status = claim.Status;
            claimWrapper.claimType = claim.Claim_Type__c;
            claimWrapper.reason = claim.Reason;
            claimWrapper.createdDate = claim.CreatedDate;
            claimWrapper.serviceConnectedInjury = claim.Service_Connected_Injury__c;
            claimWrapper.dateOfInjury = claim.Date_Of_Injury__c;
            claimWrapper.age65OrPermanentlyDisabled = claim.Age_65_or_Permanently_Disabled__c;
            claimWrapper.currentHealthStatus = claim.Current_Health_Status__c;
            claimWrapper.typeOfTrainingEducation = claim.Type_of_Training_Education__c;
            claimWrapper.educationTrainingInstitute = claim.Education_Training_Institute__c;
            claimWrapper.housingStatus = claim.Housing_Status__c;
    
            // Query Appeals
            for (Appeal__c appeal : [SELECT Id, Name, Appeal_Status__c, Filed_Date__c
                                     FROM Appeal__c
                                     WHERE Related_Case__c = :claimId]) {
                AppealWrapper appealWrapper = new AppealWrapper();
                appealWrapper.Id = appeal.Id;
                appealWrapper.name = appeal.Name;
                appealWrapper.appealStatus = appeal.Appeal_Status__c;
                appealWrapper.filedDate = appeal.Filed_Date__c;
    
                // Query ContentDocumentLink (Files) for the current appeal
                List<String> fileNames = new List<String>();
                for (ContentDocumentLink cdl : [SELECT ContentDocument.Title
                                               FROM ContentDocumentLink
                                               WHERE LinkedEntityId = :appeal.Id]) {
                    fileNames.add(cdl.ContentDocument.Title);
                }
                appealWrapper.fileNames = fileNames; // Populate fileNames in AppealWrapper
    
                appeals.add(appealWrapper);
            }
            claimWrapper.appeals = appeals;
    
            // Query Attachments
            for (Attachment attachment : [SELECT Name
                                         FROM Attachment
                                         WHERE ParentId = :claimId]) {
                AttachmentWrapper attachmentWrapper = new AttachmentWrapper();
                attachmentWrapper.name = attachment.Name;
                attachments.add(attachmentWrapper);
            }
            claimWrapper.attachments = attachments;
    
            return claimWrapper;
    
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving claim details: ' + e.getMessage());
        }
    }

    // Wrapper classes
    public class ClaimWrapper {
        @AuraEnabled public String subject;
        @AuraEnabled public String description;
        @AuraEnabled public String caseNumber;
        @AuraEnabled public String status;
        @AuraEnabled public String claimType;
        @AuraEnabled public String reason;
        @AuraEnabled public Datetime createdDate;
        @AuraEnabled public List<AppealWrapper> appeals;
        @AuraEnabled public List<AttachmentWrapper> attachments;
        @AuraEnabled public Boolean serviceConnectedInjury;
        @AuraEnabled public Date dateOfInjury;
        @AuraEnabled public Boolean age65OrPermanentlyDisabled;
        @AuraEnabled public String currentHealthStatus;
        @AuraEnabled public String typeOfTrainingEducation;
        @AuraEnabled public String educationTrainingInstitute;
        @AuraEnabled public String housingStatus;
    }

    public class AppealWrapper {
        @AuraEnabled public String Id;
        @AuraEnabled public String name;
        @AuraEnabled public String appealStatus;
        @AuraEnabled public Datetime filedDate;
        @AuraEnabled public List<String> fileNames;
    }

    public class AttachmentWrapper {
        @AuraEnabled public String name;
    }

}