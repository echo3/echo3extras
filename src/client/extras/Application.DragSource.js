/**
 * Drag source component.
 * 
 * @cp {Array} dropTargetIds array of strings specifying renderIds of valid drop target components
 */
Extras.DragSource = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DragSource", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.DragSource",

    /**
     * Programmatically performs a drop action.
     * 
     * @param {String} dropTarget the renderId of the valid drop target component on which the source component was dropped
     * @param {String} specificTarget the renderId of the most-specific component on which the source component was dropped 
     *        (must be a descendant of dropTargetComponent, may be equal to dropTarget)
     */
    doDrop: function(dropTarget, specificTarget) {
        this.fireEvent({ type: "drop", source: this, dropTarget: dropTarget, specificTarget: specificTarget, 
                data: specificTarget });
    }
});
