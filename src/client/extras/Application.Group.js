/**
 * Group component.
 */
Extras.Group = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Group", this);
    },
    
    componentType: "Extras.Group"
});