/**
 * @class BorderPane component.
 */
ExtrasApp.BorderPane = EchoCore.extend(EchoApp.Component, {
    
    DEFAULT_BORDER: new EchoApp.FillImageBorder("#00007f", 
            new EchoApp.Insets("20px"), new EchoApp.Insets("3px")),
    
    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", this);
    },
    
    /**
     * Creates a new BorderPane.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
        this.componentType = "ExtrasApp.BorderPane";
    }
});