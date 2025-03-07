public without sharing class VAUserCreationController {

    // Default values for user creation
    private static final String DEFAULT_TIME_ZONE = 'America/Los_Angeles';
    private static final String DEFAULT_LOCALE = 'en_US';
    private static final String DEFAULT_LANGUAGE = 'en_US';
    private static final String DEFAULT_EMAIL_ENCODING = 'UTF-8';
    private static final Boolean DEFAULT_IS_ACTIVE = true;
    private static final Boolean NEW_USER = true;
    private static final String TEMP_PASSWORD = 'asdf1212';
    // Method to create a new user
    @AuraEnabled
    public static String createUser(
        String username, 
        String email, 
        String firstName, 
        String lastName, 
        String alias, 
        String communityNickname
    ) {
        try {
            // Validate required fields
            if (String.isBlank(username) || String.isBlank(email) || String.isBlank(firstName) || String.isBlank(lastName)) {
                throw new AuraHandledException('Username, Email, First Name, and Last Name are required.');
            }

            // Fetch the profile ID for 'VA Claims User'
            Profile vaClaimsProfile = [SELECT Id FROM Profile WHERE Name = 'VA User' LIMIT 1];
            if (vaClaimsProfile == null) {
                throw new AuraHandledException('Profile "VA User" not found.');
            }

            // Default Alias and CommunityNickname if not provided
            if (String.isBlank(alias)) {
                alias = firstName.substring(0, 1) + lastName.substring(0, 4); // Example: jdoe
            }
            if (String.isBlank(communityNickname)) {
                communityNickname = firstName + ' ' + lastName;
            }

            // Create a new User object
            User newUser = new User(
                Username = username,
                Email = email,
                Alias = alias,
                CommunityNickname = communityNickname,
                ProfileId = vaClaimsProfile.Id,
                TimeZoneSidKey = DEFAULT_TIME_ZONE,
                LocaleSidKey = DEFAULT_LOCALE,
                LanguageLocaleKey = DEFAULT_LANGUAGE,
                EmailEncodingKey = DEFAULT_EMAIL_ENCODING,
                FirstName = firstName,
                LastName = lastName,
                IsActive = DEFAULT_IS_ACTIVE,
                First_Login__c = NEW_USER
            );

            // Insert new user
            insert newUser;

            // Set a default password for the new user
            System.setPassword(newUser.Id, TEMP_PASSWORD);

            return 'User: ' + username + ' created successfully.';
        } catch (Exception e) {
            throw new AuraHandledException('Error creating user: ' + e.getMessage());
        }
    }
}