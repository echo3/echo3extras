/**
 * Drag source component.
 */
Extras.DragSource = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DragSource", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.DragSource",
});
