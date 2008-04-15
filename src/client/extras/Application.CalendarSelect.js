/**
 * CalendarSelect component.
 *
 * @cp {Date} date the selected date
 * @sp {#Color} adjacentMonthDateForeground foreground color for dates in previous/next months
 * @sp {#Border} border the border wrapping the calendar
 * @sp {#FillImage} backgroundImage calendar background image
 * @sp {#Color} selectedDateBackground background color of selected date
 * @sp {#FillImage} selectedDateBackgroundImage background image of selected date
 * @sp {#Color} selectedDateForeground foreground color of selected date
 */
Extras.CalendarSelect = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.CalendarSelect", this);
    },
    
    componentType: "Extras.CalendarSelect"
});
