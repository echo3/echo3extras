/**
 * CalendarSelect component.
 *
 * @class TransitionPane component.
 * @base Echo.Component
 */
Extras.CalendarSelect = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.CalendarSelect", this);
    },
    
    componentType: "Extras.CalendarSelect"
});
