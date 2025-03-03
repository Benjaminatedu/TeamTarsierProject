public with sharing class ClaimCasesListController {
    @AuraEnabled
    public static List<Case> getClaimCases() {
        try {
            // Query cases with the "Claim" record type
            Id claimRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Claim').getRecordTypeId();
            return [SELECT Id, CaseNumber, Status, Subject FROM Case WHERE RecordTypeId = :claimRecordTypeId ORDER BY CreatedDate DESC LIMIT 5];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
        }
    }
}