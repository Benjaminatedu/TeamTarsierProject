public with sharing class UserCreationController {
    // Properties to store user input
    public String username { get; set; }
    public String email { get; set; }
    public String alias { get; set; }
    public String firstName { get; set; }
    public String lastName { get; set; }
    public String communityNickname { get; set; }
    public String timeZoneSidKey { get; set; }
    public String localeSidKey { get; set; }
    public String languageLocaleKey { get; set; }
    private Id profileId;
    private Boolean isActive;
    private String emailEncoding;

    // Constructor
    public UserCreationController() {
        try {
            // Default values can be set here
            this.isActive = true;
            this.profileId = [SELECT Id FROM Profile WHERE Name = 'VA Claims User' LIMIT 1].Id; // Must be set to create a new user
            this.timeZoneSidKey = 'America/Los_Angeles';
            this.localeSidKey = 'en_US';
            this.languageLocaleKey = 'en_US';
            this.emailEncoding = 'UTF-8';
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Error fetching profile: ' + e.getMessage()));
        }
    }

    // Method to create a new user
    public PageReference createUser() {
        try {
            // Ensure ProfileId is provided
            if (profileId == null) {
                throw new AuraHandledException('Profile is required.');
            }

            // Create a new User object with the provided values
            User newUser = new User(
                Username = username,
                Email = email,
                emailEncodingKey = emailEncoding,
                Alias = alias,
                CommunityNickname = communityNickname,
                ProfileId = profileId,
                TimeZoneSidKey = timeZoneSidKey,
                LocaleSidKey = localeSidKey,
                LanguageLocaleKey = languageLocaleKey,
                FirstName = firstName,
                LastName = lastName,
                IsActive = isActive
            );

            // adds new user to the database
            insert newUser;

            // Redirect to a confirmation page
            return Page.VA_Home;
        } catch (DmlException e) {
            // Handle errors and display message
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Error creating user: ' + e.getMessage()));
            return null;
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Unexpected error: ' + e.getMessage()));
            return null;
        }
    }
}

