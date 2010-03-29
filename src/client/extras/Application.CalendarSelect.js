/**
 * CalendarSelect component: an input component which allows selection of a single date.  Displays a representation of a calendar,
 * showing the currently selected month/year.  May not contain child components.
 *
 * @cp {Date} date the selected date
 * @sp {String} actionCommand the action command fired in action events when a date is selected
 * @sp {#Color} adjacentMonthDateBackground background color for dates in previous/next months
 * @sp {#Color} adjacentMonthDateForeground foreground color for dates in previous/next months
 * @sp {#Border} border the border wrapping the calendar
 * @sp {#FillImage} backgroundImage calendar background image
 * @sp {#Color} dateBackground default background color of date cells
 * @sp {#FillImage} dateBackgroundImage default background image of date cells (note that this image is displayed behind the 
 *     entire calendar date grid, rather than being repeated in each cell)
 * @sp {#Border} dateBorder default border of date cells
 * @sp {#Color} dateForeground default foreground color of date cells
 * @sp {Number} dayOfWeekNameAbbreviationLength number of characters to use in abbreviated day names (default 2)
 * @sp {Number} firstDayOfWeek the displayed first day of the week (0=Sunday, 1=Monday, ...)
 * @sp {#Color} headerBackground background color of the week header
 * @sp {#FillImage} headerBackgroundImage background image of the week header
 * @sp {#Color} headerForeground foreground color of the week header
 * @sp {#Color} rolloverDateBackground rollover background color of date cells
 * @sp {#Color} rolloverDateBorder rollover border of date cells
 * @sp {#FillImage} rolloverDateBackgroundImage rollover background image of date cells
 * @sp {#Color} rolloverDateForeground rollover foreground color of date cells
 * @sp {#Color} selectedDateBackground background color of selected date
 * @sp {#Border} selectedDateBorder border of selected date
 * @sp {#FillImage} selectedDateBackgroundImage background image of selected date
 * @sp {#Color} selectedDateForeground foreground color of selected date
 * @event action An event fired when the date selection changes.  The <code>actionCommand</code> property of the pressed
 *        button is provided as a property.
 */
Extras.CalendarSelect = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.CalendarSelect", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.CalendarSelect",
    
    /**
     * Programmatically performs a date selection action.
     */
    doAction: function() {
        this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
    }
 });
