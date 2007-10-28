/**
 * @class BorderPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = EchoCore.extend(EchoApp.Component, {
    
    global: {
        DEFAULT_BORDER: new EchoApp.FillImageBorder("#00007f", new EchoApp.Insets("20px"), new EchoApp.Insets("3px"))
    },
    
    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", this);
    },
    
    componentType: "ExtrasApp.BorderPane"
});