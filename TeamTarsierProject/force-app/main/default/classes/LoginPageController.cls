public with sharing class LoginPageController {
    
    public String username {get; set;}
    public String password {get; set;}
    public String errorMessage {get; set;}
    
    // Constructor
    public LoginPageController() {
        username = '';
        password = '';
        errorMessage = '';
    }
    
    // Method to perform login validation
    public PageReference login() {
        errorMessage = '';
        
        // Check if both fields are not empty
        if (String.isEmpty(username) || String.isEmpty(password)) {
            errorMessage = 'Please enter both username and password.';
            return null;
        }
        
        // Check for valid credentials (basic example, replace with actual logic for validation)
        // You can implement actual login logic such as checking Salesforce users, or integrating with an authentication service.
        if (username == 'admin' && password == 'password123') {
            // Redirect to a success page or dashboard
            return Page.VA_Home;  // Change to a page you want to redirect after login
        } else {
            // Invalid login
            errorMessage = 'Invalid username or password.';
            return null;
        }
    }
}
