public class AppealsController {
    @AuraEnabled(cacheable=true)
    public static List<Appeal__c> getAllAppeals() {
        return [SELECT Id, Filed_Date__c, Appeal_Type__c, Appeal_Status__c, 
                       Related_Case__r.Subject, Related_Case__r.CaseNumber
                FROM Appeal__c 
                WHERE Related_Case__r.Veteran__r.Veteran_del__c = :UserInfo.getUserId()
                ORDER BY Filed_Date__c DESC];
    }

    @AuraEnabled
    public static void uploadFile(Id parentId, String fileName, String base64Data) {
        try {
            // Create a new ContentVersion record
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            contentVersion.FirstPublishLocationId = parentId; // Link to the Appeal record
            insert contentVersion;

            System.debug('File uploaded successfully: ' + contentVersion.Id);
        } catch (Exception e) {
            System.debug('Error uploading file: ' + e.getMessage());
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }
}
