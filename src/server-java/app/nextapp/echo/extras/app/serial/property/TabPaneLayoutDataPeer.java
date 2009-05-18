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

package nextapp.echo.extras.app.serial.property;

import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialUtil;
import nextapp.echo.app.serial.property.LayoutDataPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.layout.TabPaneLayoutData;

import org.w3c.dom.Element;

/**
 * <code>SerialPropertyPeer</code> for <code>TabPaneLayoutData</code> properties.
 */
public class TabPaneLayoutDataPeer
extends LayoutDataPeer {

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        TabPaneLayoutData layoutData = (TabPaneLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "closeEnabled", 
                Boolean.valueOf(layoutData.isCloseEnabled()));
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "title", layoutData.getTitle());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "icon", layoutData.getIcon());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "toolTipText", layoutData.getToolTipText());
        
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeBackground", 
                layoutData.getActiveBackground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeBackgroundImage", 
                layoutData.getActiveBackgroundImage());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeBorder", 
                layoutData.getActiveBorder());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeFont", 
                layoutData.getActiveFont());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeForeground", 
                layoutData.getActiveForeground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeIcon", 
                layoutData.getActiveIcon());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeImageBorder", 
                layoutData.getActiveImageBorder());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "activeInsets", 
                layoutData.getActiveInsets());

        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveBackground", 
                layoutData.getInactiveBackground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveBackgroundImage", 
                layoutData.getInactiveBackgroundImage());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveBorder", 
                layoutData.getInactiveBorder());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveFont", 
                layoutData.getInactiveFont());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveForeground", 
                layoutData.getInactiveForeground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveImageBorder", 
                layoutData.getInactiveImageBorder());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "inactiveInsets", 
                layoutData.getInactiveInsets());

        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverBackground", 
                layoutData.getRolloverBackground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverBackgroundImage", 
                layoutData.getRolloverBackgroundImage());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverBorder", 
                layoutData.getRolloverBorder());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverFont", 
                layoutData.getRolloverFont());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverForeground", 
                layoutData.getRolloverForeground());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverIcon", 
                layoutData.getRolloverIcon());
        SerialUtil.toXml(context, TabPaneLayoutData.class, propertyElement, "rolloverImageBorder", 
                layoutData.getRolloverImageBorder());
    }
}
