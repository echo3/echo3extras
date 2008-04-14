/**
 * @class Group component.
 * @base Echo.Component
 */
Extras.ColorSelect = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Group", this);
    },
    
    componentType: "Extras.Group"
});