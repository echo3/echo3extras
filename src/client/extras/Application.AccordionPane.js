/**
 * @class AccordionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.AccordionPane = Core.extend(EchoApp.Component, {
    
    $static: {
        DEFAULT_ANIMATION_TIME: 350
    },
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.AccordionPane", this);
    },
    
    componentType: "ExtrasApp.AccordionPane",
    pane: true
});

