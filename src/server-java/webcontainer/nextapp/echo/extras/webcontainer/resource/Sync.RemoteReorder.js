Extras.RemoteReorder = Core.extend(Extras.Reorder, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteReorder", this);
    },

    componentType: "Extras.RemoteReorder"
});

/**
 * Component rendering peer: Reorder
 */
Extras.RemoteReorder.Sync = Core.extend(Extras.Reorder.Sync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteReorder", this);
    },
    
    /**
     * Custom serialization implementation for "selection" property.
     * @see Echo.RemoteClient
     */
    storeProperty: function(clientMessage, propertyName) {
        if (propertyName == "order") {
            var order = this.component.get("order");
            clientMessage.storeProperty(this.component.renderId, propertyName, order == null ? null : order.join(","));
            return true;
        } else {
            return false;
        }
    }
});
