/**
 * CalendarSelect component.
 *
 * @class TransitionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.CalendarSelect = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.CalendarSelect", this);
    },
    
    componentType: "ExtrasApp.CalendarSelect"
});
