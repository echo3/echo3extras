/**
 * @class ColorSelect component.
 * @base Echo.Component
 */
Extras.ColorSelect = Core.extend(Echo.Component, {
    
    $static: {
        DEFAULT_VALUE_WIDTH: 150,
        DEFAULT_SATURATION_HEIGHT: 150,
        DEFAULT_HUE_WIDTH: 20
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ColorSelect", this);
    },
    
    componentType: "Extras.ColorSelect"
});