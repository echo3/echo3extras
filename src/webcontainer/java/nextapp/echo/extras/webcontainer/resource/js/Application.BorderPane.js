/**
 * Creates a new BorderPane.
 * 
 * @constructor
 * @class TabPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = function(renderId) {
    EchoApp.Component.call(this, "ExtrasApp.BorderPane", renderId);
};

ExtrasApp.BorderPane.prototype = new EchoApp.Component;

ExtrasApp.BorderPane.DEFAULT_BORDER = new EchoApp.Property.FillImageBorder("#00007f", 
        new EchoApp.Property.Insets("20px"), new EchoApp.Property.Insets("3px"));

EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", ExtrasApp.BorderPane);