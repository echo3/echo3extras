/**
 * ColorSelect component.
 *
 * @cp {#Color} color the selected color
 * @sp {#Extent} hueWidth the width of the hue selector
 * @sp {#Extent} saturationHeight the height of the saturation selector
 * @sp {#Extent} valueWidth the width of the value selector
 */
Extras.ColorSelect = Core.extend(Echo.Component, {
    
    $static: {
        /** Default value width: 12em. */
        DEFAULT_VALUE_WIDTH: "12em",

        /** Default saturation height: 12em. */
        DEFAULT_SATURATION_HEIGHT: "12em",

        /** Default hue width: 2em. */
        DEFAULT_HUE_WIDTH: "2em"
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ColorSelect", this);
    },
    
    componentType: "Extras.ColorSelect"
});
