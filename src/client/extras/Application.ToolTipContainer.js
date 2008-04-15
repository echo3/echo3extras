/**
 * ToolTipContainer component.
 * Applies a tooltip represented by a Component to another Component.
 * This component may have one or two children.
 * When the first child component is hovered, the second component will show up
 * as a tooltip. If only one component is present, no tooltip will be shown.
 */
Extras.ToolTipContainer = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ToolTipContainer", this);
    },
    
    componentType: "Extras.ToolTipContainer"
});