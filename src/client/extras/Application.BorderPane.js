/**
 * @class BorderPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = Core.extend(EchoApp.Component, {
    
    $static: {
        DEFAULT_BORDER: new EchoApp.FillImageBorder("#00007f", 20, 3)
    },
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", this);
    },
    
    componentType: "ExtrasApp.BorderPane",
    pane: true
});