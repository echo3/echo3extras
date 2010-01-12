Extras.ListViewer = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ListViewer", this);
    },

    componentType: "Extras.ListViewer",
    
    pane: true,
    
    doAction: function(index) {
        this.fireEvent({ type: "action", source: this, index: index });
    }
});
