Extras.Sync.RemoteListViewer = Core.extend(Extras.ListViewer, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Sync.RemoteListViewer", this);
    },
    
    componentType: "Extras.Sync.RemoteListViewer",
    
    $construct: function(state) {
        Extras.ListViewer.call(this, state);
        this.set("model", new Extras.Sync.RemoteViewer.Model(this));
    }
});

Extras.Sync.RemoteListViewerSync = Core.extend(Extras.Sync.ListViewer, {
    
    $load : function() {
        Echo.Render.registerPeer("Extras.Sync.RemoteListViewer", this);
    }
});
