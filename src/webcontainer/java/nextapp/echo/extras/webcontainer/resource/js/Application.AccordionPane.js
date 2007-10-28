/**
 * @class AccordionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.AccordionPane = EchoCore.extend(EchoApp.Component, {
    
    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.AccordionPane", this);
    },
    
    componentType: "ExtrasApp.AccordionPane"
});

