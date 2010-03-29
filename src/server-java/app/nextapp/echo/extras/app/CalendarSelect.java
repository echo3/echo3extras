/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2009 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.extras.app;

import java.util.Date;
import java.util.EventListener;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * <code>CalendarSelect</code> component: an input component which allows selection of a single date. Displays a representation of a
 * calendar, showing the currently selected month/year. May not contain child components.
 */
public class CalendarSelect extends Component {

    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    
    public static final String INPUT_ACTION = "action";
   
    public static final String DATE_CHANGED_PROPERTY = "date";
    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    public static final String PROPERTY_ADJACENT_MONTH_DATE_BACKGROUND = "adjacentMonthDateBackground";
    public static final String PROPERTY_ADJACENT_MONTH_DATE_FOREGROUND = "adjacentMonthDateForeground";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_DATE_BACKGROUND = "dateBackground";
    public static final String PROPERTY_DATE_BACKGROUND_IMAGE = "dateBackgroundImage";
    public static final String PROPERTY_DATE_BORDER = "dateBorder";
    public static final String PROPERTY_DATE_FOREGROUND = "dateForeground";
    public static final String PROPERTY_DAY_OF_WEEK_ABBREVIATION_LENGTH = "dayOfWeekAbbreviationLength";
    public static final String PROPERTY_FIRST_DAY_OF_WEEK = "firstDayOfWeek";
    public static final String PROPERTY_HEADER_BACKGROUND = "headerBackground";
    public static final String PROPERTY_HEADER_BACKGROUND_IMAGE = "headerBackgroundImage";
    public static final String PROPERTY_HEADER_FOREGROUND = "headerForeground";
    public static final String PROPERTY_ROLLOVER_DATE_BACKGROUND = "rolloverDateBackground";
    public static final String PROPERTY_ROLLOVER_DATE_BACKGROUND_IMAGE = "rolloverDateBackgroundImage";
    public static final String PROPERTY_ROLLOVER_DATE_BORDER = "rolloverDateBorder";
    public static final String PROPERTY_ROLLOVER_DATE_FOREGROUND = "rolloverDateForeground";
    public static final String PROPERTY_SELECTED_DATE_BACKGROUND = "selectedDateBackground";
    public static final String PROPERTY_SELECTED_DATE_BORDER = "selectedDateBorder";
    public static final String PROPERTY_SELECTED_DATE_BACKGROUND_IMAGE = "selectedDateBackgroundImage";
    public static final String PROPERTY_SELECTED_DATE_FOREGROUND = "selectedDateForeground";
    
    /**
     * The selected date.
     */
    private Date date;
    
    /**
     * Creates a new <code>CalendarSelect</code>.
     */
    public CalendarSelect() {
        this(null);
    }
    
    /**
     * Creates a new <code>CalendarSelect</code>.
     * 
     * @param date the initially selected date
     */
    public CalendarSelect(Date date) {
        super();
        this.date = date;
    }
    
    /**
     * Adds an <code>ActionListener</code> to the <code>CalendarSelect</code>.
     * The <code>ActionListener</code> will be invoked each time a date is selected,
     * either by changing month, day, or year.
     * <p>
     * Beware of using this listener to *enforce* date selection within a range, as 
     * the user may intend to modify one or parameter of a date such that it may
     * be temporarily invalid.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }

    /**
     * Fires an action event to all listeners.
     */
    private void fireActionEvent() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        ActionEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new ActionEvent(this, (String) getRenderProperty(PROPERTY_ACTION_COMMAND));
            } 
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }

    /**
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this <code>CalendarSelect</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) get(PROPERTY_ACTION_COMMAND);
    }
        
    /**
     * Returns the background color of dates in adjacent (previous/next) months.
     * 
     * @return the background 
     */
    public Color getAdjacentMonthDateBackground() {
        return (Color) get(PROPERTY_ADJACENT_MONTH_DATE_BACKGROUND);
    }
    
    /**
     * Returns the foreground color of dates in adjacent (previous/next) months.
     * 
     * @return the foreground 
     */
    public Color getAdjacentMonthDateForeground() {
        return (Color) get(PROPERTY_ADJACENT_MONTH_DATE_FOREGROUND);
    }
    
    /**
     * Returns the background image displayed within the entire component.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border surrounding the entire component.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the selected date.
     * 
     * @return the selected date
     */
    public Date getDate() {
        return date;
    }
    
    /**
     * Returns the default background color of date cells.
     * 
     * @return the background 
     */
    public Color getDateBackground() {
        return (Color) get(PROPERTY_DATE_BACKGROUND);
    }
    
    /**
     * Returns the default background image of date cells.
     * 
     * @return the background image 
     */
    public FillImage getDateBackgroundImage() {
        return (FillImage) get(PROPERTY_DATE_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the default border of date cells.
     * 
     * @return the border
     */
    public Border getDateBorder() {
        return (Border) get(PROPERTY_DATE_BORDER);
    }
    
    /**
     * Returns the default foreground color of date cells.
     * 
     * @return the foreground 
     */
    public Color getDateForeground() {
        return (Color) get(PROPERTY_DATE_FOREGROUND);
    }
    
    /**
     * Returns the first day of the week.
     * If set, this value overrides any localized setting.
     * A value of 0 indicates Sunday, a value of 1 indicates Monday.
     * 
     * @return the first day of the week
     */
    public int getFirstDayOfWeek() {
        Integer value = (Integer) get(PROPERTY_FIRST_DAY_OF_WEEK);
        return value == null ? 0 : value.intValue();
    }
    
    /**
     * Returns the background color of the week header.
     * 
     * @return the background
     */
    public Color getHeaderBackground() {
        return (Color) get(PROPERTY_HEADER_BACKGROUND);
    }
    
    /**
     * Returns the background image of the week header.
     * 
     * @return the background image
     */
    public FillImage getHeaderBackgroundImage() {
        return (FillImage) get(PROPERTY_HEADER_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the foreground color of the week header.
     * 
     * @return the foreground
     */
    public Color getHeaderForeground() {
        return (Color) get(PROPERTY_HEADER_FOREGROUND);
    }
    
    /**
     * Returns the rollover background color of date cells.
     * 
     * @return the background 
     */
    public Color getRolloverDateBackground() {
        return (Color) get(PROPERTY_ROLLOVER_DATE_BACKGROUND);
    }
    
    /**
     * Returns the rollover background image of date cells.
     * 
     * @return the background image
     */
    public FillImage getRolloverDateBackgroundImage() {
        return (FillImage) get(PROPERTY_ROLLOVER_DATE_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the rollover border of date cells.
     * 
     * @return the border
     */
    public Border getRolloverDateBorder() {
        return (Border) get(PROPERTY_ROLLOVER_DATE_BORDER);
    }
    
    /**
     * Returns the rollover foreground color of date cells.
     * 
     * @return the foreground 
     */
    public Color getRolloverDateForeground() {
        return (Color) get(PROPERTY_ROLLOVER_DATE_FOREGROUND);
    }
    
    /**
     * Returns the background color of the selected date
     * 
     * @return the background 
     */
    public Color getSelectedDateBackground() {
        return (Color) get(PROPERTY_SELECTED_DATE_BACKGROUND);
    }
    
    /**
     * Returns the background image of the selected date
     * 
     * @return the background image
     */
    public FillImage getSelectedDateBackgroundImage() {
        return (FillImage) get(PROPERTY_SELECTED_DATE_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border of the selected date
     * 
     * @return the border
     */
    public Border getSelectedDateBorder() {
        return (Border) get(PROPERTY_SELECTED_DATE_BORDER);
    }
    
    /**
     * Returns the foreground color of the selected date
     * 
     * @return the foreground 
     */
    public Color getSelectedDateForeground() {
        return (Color) get(PROPERTY_SELECTED_DATE_FOREGROUND);
    }
    
    /**
     * Determines if any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (DATE_CHANGED_PROPERTY.equals(inputName)) {
            setDate((Date) inputValue);
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionEvent();
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from the <code>CalendarSelect</code>.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }
    
    /**
     * Sets the action command which will be provided in
     * <code>ActionEvent</code>s fired by this <code>CalendarSelect</code>.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        set(PROPERTY_ACTION_COMMAND, newValue);
    }

    /**
     * Sets the background image displayed within the entire component.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border surrounding the entire component.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the selected date.
     * 
     * @param newValue the new date
     */
    public void setDate(Date newValue) {
        Date oldValue = date;
        date = newValue;
        firePropertyChange(DATE_CHANGED_PROPERTY, oldValue, newValue);
    }

    /**
     * Sets the background color of dates in adjacent (previous/next) months.
     * 
     * @param newValue the new background
     */
    public void setAdjacentMonthDateBackground(Color newValue) {
        set(PROPERTY_ADJACENT_MONTH_DATE_BACKGROUND, newValue);
    }

    /**
     * Sets the foreground color of dates in adjacent (previous/next) months.
     * 
     * @param newValue the new foreground
     */
    public void setAdjacentMonthDateForeground(Color newValue) {
        set(PROPERTY_ADJACENT_MONTH_DATE_FOREGROUND, newValue);
    }

    /**
     * Sets the default background color of date cells.
     * 
     * @param newValue the new background
     */
    public void setDateBackground(Color newValue) {
        set(PROPERTY_DATE_BACKGROUND, newValue);
    }

    /**
     * Sets the default background image of date cells.
     * 
     * @param newValue the new background
     */
    public void setDateBackgroundImage(FillImage newValue) {
        set(PROPERTY_DATE_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the default border of date cells.
     * 
     * @param newValue the new border
     */
    public void setDateBorder(Border newValue) {
        set(PROPERTY_DATE_BORDER, newValue);
    }

    /**
     * Sets the default foreground color of date cells.
     * 
     * @param newValue the new foreground
     */
    public void setDateForeground(Color newValue) {
        set(PROPERTY_DATE_FOREGROUND, newValue);
    }
    
    /**
     * Sets the first day of the week.
     * If set, this value overrides any localized setting.
     * A value of 0 indicates Sunday, a value of 1 indicates Monday.
     * 
     * @param newValue the first day of the week
     */
    public void setFirstDayOfWeek(int newValue) {
        set(PROPERTY_FIRST_DAY_OF_WEEK, new Integer(newValue));
    }

    /**
     * Sets the background color of the week header.
     * 
     * @param newValue the new background
     */
    public void setHeaderBackground(Color newValue) {
        set(PROPERTY_HEADER_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image of the week header.
     * 
     * @param newValue the new background image
     */
    public void setHeaderBackgroundImage(FillImage newValue) {
        set(PROPERTY_HEADER_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the foreground color of the week header.
     * 
     * @param newValue the new foreground
     */
    public void setHeaderForeground(Color newValue) {
        set(PROPERTY_HEADER_FOREGROUND, newValue);
    }
    
    /**
     * Sets the rollover background color of date cells.
     * 
     * @param newValue the new background
     */
    public void setRolloverDateBackground(Color newValue) {
        set(PROPERTY_ROLLOVER_DATE_BACKGROUND, newValue);
    }

    /**
     * Sets the rollover background image of date cells.
     * 
     * @param newValue the new background image
     */
    public void setRolloverDateBackgroundImage(FillImage newValue) {
        set(PROPERTY_ROLLOVER_DATE_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the rollover border of date cells.
     * 
     * @param newValue the new border
     */
    public void setRolloverDateBorder(Border newValue) {
        set(PROPERTY_ROLLOVER_DATE_BORDER, newValue);
    }
    
    /**
     * Sets the rollover foreground color of date cells.
     * 
     * @param newValue the new foreground
     */
    public void setRolloverDateForeground(Color newValue) {
        set(PROPERTY_ROLLOVER_DATE_FOREGROUND, newValue);
    }

    /**
     * Sets the background color of the selected date.
     * 
     * @param newValue the new background
     */
    public void setSelectedDateBackground(Color newValue) {
        set(PROPERTY_SELECTED_DATE_BACKGROUND, newValue);
    }

    /**
     * Sets the background image of the selected date.
     * 
     * @param newValue the new background image
     */
    public void setSelectedDateBackgroundImage(FillImage newValue) {
        set(PROPERTY_SELECTED_DATE_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border of the selected date.
     * 
     * @param newValue the new border
     */
    public void setSelectedDateBorder(Border newValue) {
        set(PROPERTY_SELECTED_DATE_BORDER, newValue);
    }
    
    /**
     * Sets the foreground color of the selected date.
     * 
     * @param newValue the new foreground
     */
    public void setSelectedDateForeground(Color newValue) {
        set(PROPERTY_SELECTED_DATE_FOREGROUND, newValue);
    }
}
