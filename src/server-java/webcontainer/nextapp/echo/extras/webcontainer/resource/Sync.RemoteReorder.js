Extras.RemoteReorder = Core.extend(Extras.Reorder, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteReorder", this);
    },

    componentType: "Extras.RemoteReorder",

    $construct: function(data) {
        Extras.Reorder.call(this, data);
        this.addListener("property", Core.method(this, function(e) {
            Core.Debug.consoleWrite(e.propertyName);
        }));
    }
});

/**
 * Component rendering peer: Reorder
 */
Extras.RemoteReorder.Sync = Core.extend(Extras.Reorder.Sync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteReorder", this);
    }
});
