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
     * Returns the actual order of the children.
     * This method will always return a valid value regardless of the value of the order property.  It will always specify
     * every child exactly one time.
     * 
     * @return the order
     * @type Array
     */
    getOrder: function() {
        var i;
        var requestOrder = this.get("order") || [];
        var addedChildren = [];
        var actualOrder = [];
        
        for (i = 0; i < requestOrder.length; ++i) {
            if (requestOrder[i] >= this.children.length) {
                // Invalid child index.
                continue;
            }
            if (addedChildren[requestOrder[i]]) {
                // Child already added.
                continue;
            }
            // Mark child added.
            addedChildren[requestOrder[i]] = true;
            // Add child to actual order.
            actualOrder.push(requestOrder[i]);
        }
        
        // Render any children not specified in order.
        for (i = 0; i < this.children.length; ++i) {
            if (!addedChildren[i]) {
                // Unrendered child found: render.
                actualOrder.push(i);
            }
        }
        
        return actualOrder;
    },
    
    /**
     * Moves a child component from the specified source index to the new target index.
     * 
     * @param {Number} sourceIndex the source index
     * @param {Number} targetIndex the target index
     */
    reorder: function(sourceIndex, targetIndex) {
        var i, oldOrder = this.getOrder(), newOrder;
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