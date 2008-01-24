/**
 * @class BorderPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = Core.extend(EchoApp.Component, {
    
    $static: {
        DEFAULT_BORDER: { color: "#00007f", contentInsets: 20, borderInsets: 3 }
    },
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", this);
    },
    
    componentType: "ExtrasApp.BorderPane",
    pane: true
});