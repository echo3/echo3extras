/**
 * @class AccordionPane component.
 */
ExtrasApp.AccordionPane = EchoCore.extend(EchoApp.Component, {
    
    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.AccordionPane", this);
    },
    
    /**
     * Creates a new AccordionPane.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
        this.componentType = "ExtrasApp.AccordionPane";
    }
});

