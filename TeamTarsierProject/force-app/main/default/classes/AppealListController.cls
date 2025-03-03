public with sharing class AppealListController {
    @AuraEnabled
    public static List<Appeal__c> getAppeals() {
        try {
            return [SELECT Id, Related_Case__r.CaseNumber, Name, Appeal_Status__c FROM Appeal__c ORDER BY CreatedDate DESC LIMIT 5];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
        }
    }
}