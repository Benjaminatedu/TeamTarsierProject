({
    doInit: function(component, event, helper) {
        // Call Apex method to fetch appeals
        var action = component.get("c.getAppeals");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.appeals", response.getReturnValue());
            } else if (state === "ERROR") {
                component.set("v.error", response.getError()[0].message);
            }
        });
        $A.enqueueAction(action);
    },

    navigateToAppeal: function(component, event, helper) {
        var appealId = event.getSource().get("v.value");
        var navEvent = $A.get("e.force:navigateToSObject");
        navEvent.setParams({
            "recordId": appealId
        });
        navEvent.fire();
    }
})