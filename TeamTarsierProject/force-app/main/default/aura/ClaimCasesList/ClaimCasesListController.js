({
    doInit: function(component, event, helper) {
        // Call Apex method to fetch cases
        var action = component.get("c.getClaimCases");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.cases", response.getReturnValue());
            } else if (state === "ERROR") {
                component.set("v.error", response.getError()[0].message);
            }
        });
        $A.enqueueAction(action);
    },

    navigateToCase: function(component, event, helper) {
        // Get the case ID from the button's value attribute
        var caseId = event.getSource().get("v.value");
        // Navigate to the case record
        var navEvent = $A.get("e.force:navigateToSObject");
        navEvent.setParams({
            "recordId": caseId
        });
        navEvent.fire();
    }
})