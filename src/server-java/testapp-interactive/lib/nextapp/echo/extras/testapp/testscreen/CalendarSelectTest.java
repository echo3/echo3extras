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

package nextapp.echo.extras.testapp.testscreen;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.extras.app.CalendarSelect;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>CalendarSelect</code>s.
 */
public class CalendarSelectTest extends AbstractTest {

    public CalendarSelectTest() {
        super("CalendarSelect", Styles.ICON_16_CALENDAR_SELECT);
        setStyleName("DefaultResizable");
        
        final CalendarSelect calendarSelect = new CalendarSelect();
        setTestComponent(this, calendarSelect);
        
        Column column = new Column();
        add(column);
        
        column.add(calendarSelect);
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, CalendarSelect.PROPERTY_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, CalendarSelect.PROPERTY_BACKGROUND);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, CalendarSelect.PROPERTY_BACKGROUND_IMAGE, 
                StyleUtil.TEST_FILL_IMAGES);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, CalendarSelect.PROPERTY_FONT);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, CalendarSelect.PROPERTY_BORDER);


        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set StyleName = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setStyleName("Default");
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set StyleName = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setStyleName(null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "ColumnLayoutData = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setLayoutData(null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "ColumnLayoutData = Center", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                ColumnLayoutData layoutData = new ColumnLayoutData();
                layoutData.setAlignment(Alignment.ALIGN_CENTER);
                calendarSelect.setLayoutData(layoutData);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Query Date", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Date date = calendarSelect.getDate();
                InteractiveApp.getApp().consoleWrite(date == null ? "No Date" : date.toString());
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Date", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Calendar calendar = new GregorianCalendar();
                calendar.add(Calendar.DAY_OF_MONTH, ((int) (Math.random() * 10000)) - 5000);
                calendarSelect.setDate(calendar.getTime());
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Add CalendarSelect WindowPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                WindowPane windowPane = new WindowPane("Calendar Select Test", new Extent(240), null);
                windowPane.setPositionX(new Extent((int) (Math.random() * 500)));
                windowPane.setPositionY(new Extent((int) (Math.random() * 300) + 140));
                windowPane.setStyleName("Default");
                windowPane.setInsets(new Insets(10, 5));
                CalendarSelect calendarSelect = new CalendarSelect();
                calendarSelect.setStyleName("Default");
                windowPane.add(calendarSelect);
                InteractiveApp.getApp().getDefaultWindow().getContent().add(windowPane);
            }
        });
        
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Add Centered CalendarSelect WindowPane", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                WindowPane windowPane = new WindowPane("Calendar Select Test", new Extent(240), null);
                windowPane.setPositionX(new Extent((int) (Math.random() * 500)));
                windowPane.setPositionY(new Extent((int) (Math.random() * 300) + 140));
                windowPane.setWidth(new Extent(400));
                windowPane.setStyleName("Default");
                windowPane.setInsets(new Insets(10, 5));
                Column column = new Column();
                windowPane.add(column);
                
                CalendarSelect calendarSelect = new CalendarSelect();
                ColumnLayoutData layoutData = new ColumnLayoutData();
                layoutData.setAlignment(Alignment.ALIGN_CENTER);
                calendarSelect.setLayoutData(layoutData);
                calendarSelect.setStyleName("Default");
                column.add(calendarSelect);
                InteractiveApp.getApp().getDefaultWindow().getContent().add(windowPane);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setLocale(null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale English", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setLocale(Locale.ENGLISH);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale German", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setLocale(Locale.GERMAN);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale Germany", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setLocale(Locale.GERMANY);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set First Day Of Week = 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setFirstDayOfWeek(0);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set First Day Of Week = 1", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setFirstDayOfWeek(1);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set First Day Of Week = 4", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setFirstDayOfWeek(5);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set First Day Of Week = 6", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setFirstDayOfWeek(6);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set First Day Of Week = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calendarSelect.set(CalendarSelect.PROPERTY_FIRST_DAY_OF_WEEK, null);
            }
        });
        
        // Listener Tests
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Set ActionCommand", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                calendarSelect.setActionCommand("ActionCommand " + (int) (Math.random() * 1000));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add ActionListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                calendarSelect.addActionListener(new ActionListener() {
                    
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Action event received: " + e.toString());
                    }
                });
            }
        });
        
        addStandardIntegrationTests();

    }
}
