/**
 * @class ColorSelect component.
 * @base EchoApp.Component
 */
ExtrasApp.ColorSelect = Core.extend(EchoApp.Component, {
    
    $static: {
        DEFAULT_VALUE_WIDTH: 150,
        DEFAULT_SATURATION_HEIGHT: 150,
        DEFAULT_HUE_WIDTH: 20
    },
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.ColorSelect", this);
    },
    
    componentType: "ExtrasApp.ColorSelect"
});