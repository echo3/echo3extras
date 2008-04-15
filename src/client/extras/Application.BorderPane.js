/**
 * BorderPane component.
 */
Extras.BorderPane = Core.extend(Echo.Component, {
    
    $static: {
        DEFAULT_BORDER: { color: "#00007f", contentInsets: 20, borderInsets: 3 }
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.BorderPane", this);
    },
    
    componentType: "Extras.BorderPane",
    pane: true
});