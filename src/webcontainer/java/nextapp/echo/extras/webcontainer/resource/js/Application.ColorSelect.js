/**
 * Creates a new ColorSelect.
 * 
 * @constructor
 * @class ColorSelect component.
 * @base EchoApp.Component
 */
ExtrasApp.ColorSelect = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ExtrasApp.ColorSelect";
};

ExtrasApp.ColorSelect.prototype = new EchoApp.Component;

EchoApp.ComponentFactory.registerType("ExtrasApp.ColorSelect", ExtrasApp.ColorSelect);