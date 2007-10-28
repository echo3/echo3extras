/**
 * @class AccordionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.AccordionPane = Core.extend(EchoApp.Component, {
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.AccordionPane", this);
    },
    
    componentType: "ExtrasApp.AccordionPane"
});

