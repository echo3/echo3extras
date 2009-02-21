/**
 * RemoteClient-hosted DataGrid component.
 */
Extras.RemoteDataGrid = Core.extend(Extras.DataGrid, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteDataGrid", this);
    },
    
    componentType: "Extras.RemoteDataGrid"
});

/**
 * RemoteClient-hosted DataGrid component synchronization peer.
 */
Extras.Sync.RemoteDataGrid = Core.extend(Extras.Sync.DataGrid, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteDataGrid", this);
    }
});
