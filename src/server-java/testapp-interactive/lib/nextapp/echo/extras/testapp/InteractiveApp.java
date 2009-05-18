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

package nextapp.echo.extras.testapp;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Window;

/**
 * Interactive Test Application Instance.
 * <p>
 * <b>WARNING TO DEVELOPERS:</b>
 * <p>
 * Beware that the Interactive Test Application is not a good example of an
 * Echo application.  The intent of this application is to serve as a running
 * testbed for the Echo framework.  As such, the requirements of this 
 * application are dramatically different from a production internet 
 * application.  There is stuff in this code of this application that is 
 * downright absurd.  Please do not look to this application to see good design
 * practices for building your own Echo applications--you will not find them 
 * here.
 */
public class InteractiveApp extends ApplicationInstance {

    /**
     * Initial test name.
     */
    public static final String INITIAL_TEST;
    static {
        String value;
        try {
            value = System.getProperty("test");
        } catch (SecurityException ex) {
            value = null;
        }
        INITIAL_TEST = value;
    }

    /**
     * A boolean flag indicating whether the application is running on a live
     * demo server.  This flag is used to disable certain tests based on 
     * whether the <code>nextapp.echo.demoserver</code> system property is
     * set.
     */
    public static final boolean LIVE_DEMO_SERVER;
    static {
        boolean liveDemoServer;
        try {
            if ("true".equals(System.getProperties().getProperty("nextapp.echo.demoserver"))) {
                liveDemoServer = true;
            } else {
                liveDemoServer = false;
            }
        } catch (SecurityException ex) {
            liveDemoServer = false;
        }
        LIVE_DEMO_SERVER = liveDemoServer;
    }
    
    /**
     * Convenience method to return the <code>ThreadLocal</code> instance 
     * precast to the appropriate type.
     * 
     * @return the active <code>InteractiveApp</code>
     * @see #getActive()
     */
    public static InteractiveApp getApp() {
        return (InteractiveApp) ApplicationInstance.getActive();
    }

    private Window mainWindow;
    private ConsoleWindowPane console;
    
    /**
     * Writes a message to a pop-up debugging console.
     * The console is used for displaying information such as
     * fired events.
     * 
     * @param message the message to write to the console
     *        (if null, console will be raised but not content
     *        will be written to it)
     */
    public void consoleWrite(String message) {
        if (console == null) {
            console = new ConsoleWindowPane();
            getDefaultWindow().getContent().add(console);
        } else if (console.getParent() == null) {
            getDefaultWindow().getContent().add(console);
        }
        if (message != null) {
            console.writeMessage(message);
        }
    }
    
    /**
     * Displays a <code>TestPane</code> from which the user may select an
     * interactive test to run.
     */
    public void displayTestPane() {
        mainWindow.setContent(new TestPane(null));
        console = null;
    }
    
    /**
     * Displays the <code>WelcomePane</code> which greets new users visiting
     * the application.
     */
    public void displayWelcomePane() {
        mainWindow.setContent(new WelcomePane());
        console = null;
    }

    /**
     * @see nextapp.echo.app.ApplicationInstance#init()
     */
    public Window init() {
        setStyleSheet(Styles.DEFAULT_STYLE_SHEET);
        mainWindow = new Window();
        mainWindow.setTitle("NextApp Echo3 Extras Test Application");
        if (INITIAL_TEST == null) {
            mainWindow.setContent(new WelcomePane());
        } else {
            mainWindow.setContent(new TestPane(INITIAL_TEST));
        }
        
        return mainWindow;
    }
}
