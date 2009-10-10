/**
 * Reorder component: a component which allows a user to rearrange its children using drag handles.
 *
 * @cp order the displayed order of the child components (if omitted, the child components will be displayed
 *     in their component order) 
 */
Extras.Reorder = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Reorder", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.Reorder",
    
    /**
     * Moves a child component from the specified source index to the new target index.
     * 
     * @param {Number} sourceIndex the source index
     * @param {Number} targetIndex the target index
     */
    reorder: function(sourceIndex, targetIndex) {
        var i, oldOrder = this.get("order"), newOrder;
        if (!oldOrder) {
            // Create order if not available.
            oldOrder = [];
            for (i = 0; i < this.children.length; ++i) {
                oldOrder[i] = i;
            }
        }
        newOrder = oldOrder.slice();
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, oldOrder[sourceIndex]);
        this.set("order", newOrder);
    }
});

/**
 * Reorder handle component: a drag handle component which may be placed inside a child of a Reorder component to allow the user
 * to rearrange the children.
 */
Extras.Reorder.Handle = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Reorder.Handle", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Extras.Reorder.Handle"
});