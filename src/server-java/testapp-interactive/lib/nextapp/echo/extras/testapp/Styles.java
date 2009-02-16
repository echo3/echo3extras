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

import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.StyleSheetLoader;

/**
 * 
 */
public class Styles {
    
    public static final ImageReference ICON_64_ERROR
            = new ResourceImageReference("nextapp/echo/extras/testapp/resource/image/Icon64Error.gif");
    public static final ImageReference ICON_64_INFORMATION
            = new ResourceImageReference("nextapp/echo/extras/testapp/resource/image/Icon64Information.gif");
    public static final ImageReference ICON_64_QUESTION
            = new ResourceImageReference("nextapp/echo/extras/testapp/resource/image/Icon64Question.gif");
    public static final ImageReference ICON_64_WARNING
            = new ResourceImageReference("nextapp/echo/extras/testapp/resource/image/Icon64Warning.gif");

    public static final String IMAGE_PATH = "nextapp/echo/extras/testapp/resource/image/";
    public static final String STYLE_PATH = "nextapp/echo/extras/testapp/resource/style/";

    public static final ImageReference ICON_16_ACCORDION_PANE 
            = new ResourceImageReference(IMAGE_PATH + "AccordionPaneIcon16.gif"); 
    public static final ImageReference ICON_16_BORDER_PANE 
            = new ResourceImageReference(IMAGE_PATH + "BorderPaneIcon16.gif"); 
    public static final ImageReference ICON_16_CALENDAR_SELECT 
            = new ResourceImageReference(IMAGE_PATH + "CalendarSelectIcon16.gif"); 
    public static final ImageReference ICON_16_COLOR_SELECT
            = new ResourceImageReference(IMAGE_PATH + "ColorSelectIcon16.gif"); 
    public static final ImageReference ICON_16_CONTEXT_MENU
            = new ResourceImageReference(IMAGE_PATH + "ContextMenuIcon16.gif"); 
    public static final ImageReference ICON_16_DRAG_SOURCE
            = new ResourceImageReference(IMAGE_PATH + "DragSourceIcon16.gif"); 
    public static final ImageReference ICON_16_DROP_DOWN_MENU
            = new ResourceImageReference(IMAGE_PATH + "DropDownMenuIcon16.gif"); 
    public static final ImageReference ICON_16_GROUP 
            = new ResourceImageReference(IMAGE_PATH + "GroupIcon16.gif"); 
    public static final ImageReference ICON_16_MENU_BAR_PANE 
            = new ResourceImageReference(IMAGE_PATH + "MenuBarPaneIcon16.gif"); 
    public static final ImageReference ICON_16_RICH_TEXT_AREA 
            = new ResourceImageReference(IMAGE_PATH + "RichTextAreaIcon16.gif"); 
    public static final ImageReference ICON_16_TAB_PANE 
            = new ResourceImageReference(IMAGE_PATH + "TabPaneIcon16.gif"); 
    public static final ImageReference ICON_16_TOOL_TIP_CONTAINER 
            = new ResourceImageReference(IMAGE_PATH + "ToolTipContainerIcon16.gif"); 
    public static final ImageReference ICON_16_TREE
            = new ResourceImageReference(IMAGE_PATH + "TreeIcon16.gif"); 
    public static final ImageReference ICON_16_TRANSITION_PANE 
            = new ResourceImageReference(IMAGE_PATH + "TransitionPaneIcon16.gif");
    
    public static final ImageReference DROPDOWN_TOGGLE_IMAGE
            = new ResourceImageReference(IMAGE_PATH + "DropDownToggle.png");

    public static final FillImage FILL_IMAGE_SHADOW_BACKGROUND_DARK_BLUE = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "ShadowBackgroundDarkBlue.png"));
    public static final FillImage FILL_IMAGE_SHADOW_BACKGROUND_LIGHT_BLUE = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "ShadowBackgroundLightBlue.png"));
    public static final FillImage FILL_IMAGE_PEWTER_LINE = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "PewterLineBackground.png"));
    public static final FillImage FILL_IMAGE_SILVER_LINE = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "SilverLineBackground.png"));
    public static final FillImage FILL_IMAGE_LIGHT_BLUE_LINE = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "LightBlueLineBackground.png"));

    public static final FillImage FILL_IMAGE_EXTRAS_BACKGROUND = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "ExtrasBackground.jpg"));
    public static final FillImage FILL_IMAGE_DROPDOWN_MENU_BACKGROUND = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "DropDownBackground.png"));
    public static final FillImage FILL_IMAGE_TAB_BACKGROUND = new FillImage(
            new ResourceImageReference(IMAGE_PATH + "TabBackground.png"));
    
    public static final FillImage[] TEST_FILL_IMAGES = new FillImage[] { null, 
            FILL_IMAGE_SHADOW_BACKGROUND_DARK_BLUE, FILL_IMAGE_SHADOW_BACKGROUND_LIGHT_BLUE,
            FILL_IMAGE_PEWTER_LINE, FILL_IMAGE_LIGHT_BLUE_LINE,
            FILL_IMAGE_SILVER_LINE};

    public static final ImageReference ICON_24_NO = new ResourceImageReference(IMAGE_PATH + "Icon24No.gif"); 
    public static final ImageReference ICON_24_YES = new ResourceImageReference(IMAGE_PATH + "Icon24Yes.gif");
    public static final ImageReference ECHO_IMAGE = new ResourceImageReference(IMAGE_PATH + "Echo.png");
    public static final ImageReference INTERACTIVE_TEST_APPLICATION_IMAGE 
            = new ResourceImageReference(IMAGE_PATH + "InteractiveTestApplication.png");
    public static final ImageReference NEXTAPP_LOGO = new ResourceImageReference(IMAGE_PATH + "NextAppLogo.png");
    
    public static final ImageReference ICON_LOGO =  new ResourceImageReference(IMAGE_PATH + "Logo.png");

    public static final StyleSheet DEFAULT_STYLE_SHEET;
    static {
        try {
            DEFAULT_STYLE_SHEET = StyleSheetLoader.load(STYLE_PATH + "Default.stylesheet.xml", 
                    Thread.currentThread().getContextClassLoader());
        } catch (SerialException ex) {
            throw new RuntimeException(ex);
        }
    }
}
