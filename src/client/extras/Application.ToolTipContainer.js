/**
 * ToolTipContainer component.
 */
Extras.ToolTipContainer = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ToolTipContainer", this);
    },
    
    componentType: "Extras.ToolTipContainer"
});