/**
 * @class Group component.
 * @base EchoApp.Component
 */
ExtrasApp.ColorSelect = Core.extend(EchoApp.Component, {
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.Group", this);
    },
    
    componentType: "ExtrasApp.Group"
});