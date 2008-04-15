/**
 * CalendarSelect component.
 */
Extras.CalendarSelect = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.CalendarSelect", this);
    },
    
    componentType: "Extras.CalendarSelect"
});
