public class AppealsController {
    @AuraEnabled(cacheable=true)
    public static List<Appeal__c> getAllAppeals() {
        return [SELECT Id, Filed_Date__c, Appeal_Type__c, Appeal_Status__c, 
                       Related_Case__r.Subject, Related_Case__r.CaseNumber
                FROM Appeal__c 
                WHERE Related_Case__r.Veteran__r.Veteran_del__c = :UserInfo.getUserId()
                ORDER BY Filed_Date__c DESC];
    }
}
