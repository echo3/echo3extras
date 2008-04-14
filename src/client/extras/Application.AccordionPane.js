/**
 * @class AccordionPane component.
 * @base Echo.Component
 */
Extras.AccordionPane = Core.extend(Echo.Component, {
    
    $static: {
        DEFAULT_ANIMATION_TIME: 350
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.AccordionPane", this);
    },
    
    componentType: "Extras.AccordionPane",
    pane: true
});

