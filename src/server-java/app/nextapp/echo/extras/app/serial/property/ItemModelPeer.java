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

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.serial.property.ImageReferencePeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.menu.ItemModel;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.OptionModel;
import nextapp.echo.extras.app.menu.RadioOptionModel;
import nextapp.echo.extras.app.menu.SeparatorModel;
import nextapp.echo.extras.app.menu.ToggleOptionModel;

import org.w3c.dom.Element;

/**
 * <code>SerialPropertyPeer</code> for <code>ItemModel</code> properties.
 * 
 * @author n.beekman
 */
public class ItemModelPeer implements SerialPropertyPeer {
    
    /**
     * @see SerialPropertyPeer#toProperty(Context, Class, Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) throws SerialException {
        throw new UnsupportedOperationException();
    }

    /**
     * @see SerialPropertyPeer#toXml(Context, Class, Element, Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) throws SerialException {
        ItemModel itemModel = (ItemModel)propertyValue;
        if (itemModel instanceof MenuModel) {
            toXml(context, objectClass, propertyElement, (MenuModel)itemModel);
        } else if (itemModel instanceof OptionModel) {
            toXml(context, objectClass, propertyElement, (OptionModel)itemModel);
        } else if (itemModel instanceof SeparatorModel) {
            toXml(context, objectClass, propertyElement, (SeparatorModel)itemModel);
        } else {
            throw new RuntimeException("Unsupported model type: " + itemModel.getClass().getName());
        }
    }
    
    private void toXml(Context context, Class objectClass, Element propertyElement, MenuModel model) throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        
        propertyElement.setAttribute("t", SerialPropertyPeerConstants.PROPERTY_TYPE_PREFIX + "MenuModel");
        writeIdIconAndText(context, objectClass, propertyElement, model.getId(), model.getText(), model.getIcon());
        int length = model.getItemCount();
        for (int i = 0; i < length; ++i) {
            Element subElement = serialContext.getDocument().createElement("item");
            toXml(context, objectClass, subElement, model.getItem(i));
            propertyElement.appendChild(subElement);
        }
    }
    
    private void toXml(Context context, Class objectClass, Element propertyElement, OptionModel model) throws SerialException {
        String type;
        if (model instanceof ToggleOptionModel) {
            if (model instanceof RadioOptionModel) {
                type = "RadioOptionModel";
            } else {
                type = "ToggleOptionModel";
            }
        } else {
            type = "OptionModel";
        }
        propertyElement.setAttribute("t", SerialPropertyPeerConstants.PROPERTY_TYPE_PREFIX + type);
        writeIdIconAndText(context, objectClass, propertyElement, model.getId(), model.getText(), model.getIcon());
    }
    
    private void toXml(Context context, Class objectClass, Element propertyElement, SeparatorModel model) {
        propertyElement.setAttribute("t", SerialPropertyPeerConstants.PROPERTY_TYPE_PREFIX + "SeparatorModel");
    }
    
    private void writeIdIconAndText(Context context, Class objectClass, Element propertyElement, String id, String text, ImageReference icon) throws SerialException {
        if (id != null) {
            propertyElement.setAttribute("id", id);
        }
        if (text != null) {
            propertyElement.setAttribute("text", text);
        }
        if (icon != null) {
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            Element iconElement = serialContext.getDocument().createElement("icon");
            getPeer(context, icon).toXml(context, objectClass, iconElement, icon);
            propertyElement.appendChild(iconElement);
        }
    }
    
    private ImageReferencePeer getPeer(Context context, ImageReference imageReference) {
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        SerialPropertyPeer peer = propertyPeerFactory.getPeerForProperty(imageReference.getClass());
        return (ImageReferencePeer)peer;
    }
}
