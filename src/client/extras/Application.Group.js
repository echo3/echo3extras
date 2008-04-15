//FIXME complete API spec.
/**
 * Group component.
 *
 * A container which renders a border consisting of images around its
 * content. Optionally draws a title in the top border.
 *
 * @sp {#FillImage} backgroundImage background image to display behind content
 */
Extras.Group = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Group", this);
    },
    
    componentType: "Extras.Group"
});
