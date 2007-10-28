/**
 * @class BorderPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = Core.extend(EchoApp.Component, {
    
    $static: {
        DEFAULT_BORDER: new EchoApp.FillImageBorder("#00007f", new EchoApp.Insets("20px"), new EchoApp.Insets("3px"))
    },
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", this);
    },
    
    componentType: "ExtrasApp.BorderPane"
});