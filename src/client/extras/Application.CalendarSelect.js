/**
 * CalendarSelect component.
 *
 * @cp {Date} date the selected date
 * @sp {#Color} adjacentMonthDateForeground foreground color for dates in previous/next months
 * @sp {#Color} adjacentMonthDateBackground background color for dates in previous/next months
 * @sp {#Border} border the border wrapping the calendar
 * @sp {#FillImage} backgroundImage calendar background image
 * @sp {#Color} dateBackground default background color of date cells
 * @sp {#Border} dateBorder default border of date cells
 * @sp {#FillImage} dateBackgroundImage default background image of date cells (note that this image is displayed behind the 
 *     entire calendar date grid, rather than being repeated in each cell)
 * @sp {#Color} dateForeground default foreground color of date cells
 * @sp {#Color} rolloverDateBackground rollover background color of date cells
 * @sp {#Color} rolloverDateBorder rollover border of date cells
 * @sp {#FillImage} rolloverDateBackgroundImage rollover background image of date cells
 * @sp {#Color} rolloverDateForeground rollover foreground color of date cells
 * @sp {#Color} selectedDateBackground background color of selected date
 * @sp {#Border} selectedDateBorder border of selected date
 * @sp {#FillImage} selectedDateBackgroundImage background image of selected date
 * @sp {#Color} selectedDateForeground foreground color of selected date
 */
Extras.CalendarSelect = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.CalendarSelect", this);
    },
    
    componentType: "Extras.CalendarSelect"
});
