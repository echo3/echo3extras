Extras.FlowViewer = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.FlowViewer", this);
    },

    componentType: "Extras.FlowViewer",
    
    pane: true,
    
    doAction: function(index) {
        this.fireEvent({ type: "action", source: this, index: index });
    }
});
