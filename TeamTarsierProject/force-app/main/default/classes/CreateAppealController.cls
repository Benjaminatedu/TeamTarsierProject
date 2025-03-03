public  class CreateAppealController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> canCreateAppeal(Id claimId) {
        Map<String, Object> result = new Map<String, Object>();
        result.put('canCreate', false);
        result.put('disableReason', '');

        try {
            // Check if the claim status is "Denied"
            Case claim = [SELECT Id, Status FROM Case WHERE Id = :claimId LIMIT 1];
            if (claim.Status != 'Denied') {
                result.put('disableReason', 'Cannot create appeal: Claim has not yet been denied.');
                return result;
            }

            // Check if there are any appeals with status "Received", "Under Review", "Evidence Gathering", or "Decision Pending"
            List<Appeal__c> existingAppeals = [SELECT Id FROM Appeal__c 
                                              WHERE Related_Case__c = :claimId 
                                              AND Appeal_Status__c IN ('Received', 'Under Review', 'Evidence Gathering', 'Decision Pending') 
                                              LIMIT 1];
            if (!existingAppeals.isEmpty()) {
                result.put('disableReason', 'Cannot create appeal: Ongoing appeal exists.');
                return result;
            }

            // If all checks pass, allow appeal creation
            result.put('canCreate', true);
            return result;
        } catch (Exception e) {
            result.put('disableReason', 'An error occurred while checking appeal eligibility.');
            return result;
        }
    }

    @AuraEnabled
    public static void createAppeal(Id claimId, String appealType, String description) {
        // Create a new Appeal__c record
        Appeal__c newAppeal = new Appeal__c();
        newAppeal.Appeal_Type__c = appealType;
        newAppeal.Description__c = description;
        newAppeal.Appeal_Status__c = 'Received';
        newAppeal.Filed_Date__c = Date.today();
        newAppeal.Related_Case__c = claimId;

        insert newAppeal;
    }
}