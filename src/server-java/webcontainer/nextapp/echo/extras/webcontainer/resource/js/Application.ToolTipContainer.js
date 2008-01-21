/**
 * @class ToolTipContainer component.
 * @base EchoApp.Component
 */
ExtrasApp.ToolTipContainer = Core.extend(EchoApp.Component, {
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.ToolTipContainer", this);
    },
    
    componentType: "ExtrasApp.ToolTipContainer"
});