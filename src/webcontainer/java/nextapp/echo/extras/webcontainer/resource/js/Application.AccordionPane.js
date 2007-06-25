/**
 * Creates a new AccordionPane.
 * 
 * @constructor
 * @class AccordionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.AccordionPane = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ExtrasApp.AccordionPane";
};

ExtrasApp.AccordionPane.prototype = new EchoApp.Component;

EchoApp.ComponentFactory.registerType("ExtrasApp.AccordionPane", ExtrasApp.AccordionPane);