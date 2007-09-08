/**
 * Creates a new ColorSelect.
 * 
 * @constructor
 * @class ColorSelect component.
 * @base EchoApp.Component
 */
ExtrasApp.ColorSelect = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.ColorSelect";
};

ExtrasApp.ColorSelect.prototype = EchoCore.derive(EchoApp.Component);

ExtrasApp.ColorSelect.DEFAULT_VALUE_WIDTH = new EchoApp.Property.Extent(150);
ExtrasApp.ColorSelect.DEFAULT_SATURATION_HEIGHT = new EchoApp.Property.Extent(150);
ExtrasApp.ColorSelect.DEFAULT_HUE_WIDTH = new EchoApp.Property.Extent(20);

EchoApp.ComponentFactory.registerType("ExtrasApp.ColorSelect", ExtrasApp.ColorSelect);