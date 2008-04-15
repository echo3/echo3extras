/**
 * ColorSelect component.
 *
 * @cp {#Color} color the selected color
 * @sp {#Extent} hueWidth the width of the hue selector
 * @sp {#Extent} saturationHeight the heigh of the saturation selector
 * @sp {#Extent} valueWidth the width of the value selector
 */
Extras.ColorSelect = Core.extend(Echo.Component, {
    
    $static: {
        /** Default value width: 150 pixels. */
        DEFAULT_VALUE_WIDTH: 150,

        /** Default saturation height: 150 pixels. */
        DEFAULT_SATURATION_HEIGHT: 150,

        /** Default hue width: 20 pixels. */
        DEFAULT_HUE_WIDTH: 20
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ColorSelect", this);
    },
    
    componentType: "Extras.ColorSelect"
});