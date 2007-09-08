/**
 * Creates a new BorderPane.
 * 
 * @constructor
 * @class TabPane component.
 * @base EchoApp.Component
 */
ExtrasApp.BorderPane = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.BorderPane";
    this.pane = true;
};

ExtrasApp.BorderPane.prototype = EchoCore.derive(EchoApp.Component);

ExtrasApp.BorderPane.DEFAULT_BORDER = new EchoApp.Property.FillImageBorder("#00007f", 
        new EchoApp.Property.Insets("20px"), new EchoApp.Property.Insets("3px"));

EchoApp.ComponentFactory.registerType("ExtrasApp.BorderPane", ExtrasApp.BorderPane);