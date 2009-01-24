/**
 * ToolTipContainer component: a container which may contain two children, the
 * first of which is always displayed and the second of which is displayed with
 * the mouse is hovered over the first. May contain zero, one, or two components
 * as children. Many not contain pane components.
 */
Extras.ToolTipContainer = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ToolTipContainer", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.ToolTipContainer"
});