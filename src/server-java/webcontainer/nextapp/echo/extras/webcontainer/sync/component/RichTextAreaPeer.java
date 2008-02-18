/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2007 NextApp, Inc.
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

package nextapp.echo.extras.webcontainer.sync.component;

import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TextField;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.ColorSelect;
import nextapp.echo.extras.app.MenuBarPane;
import nextapp.echo.extras.app.RichTextArea;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>RichTextArea</code>s.
 */
public class RichTextAreaPeer extends AbstractComponentSynchronizePeer {

    private static final String LOCALIZATION_DATA = "localizationData";
    private static final Service RICH_TEXT_AREA_SERVICE = JavaScriptService.forResources("EchoExtras.RichTextArea",
            new String[] {  "/nextapp/echo/extras/webcontainer/resource/Application.RichTextArea.js",  
                            "/nextapp/echo/extras/webcontainer/resource/Render.RichTextArea.js",
                            "/nextapp/echo/extras/webcontainer/resource/RemoteClient.RichTextArea.js" });
    
    static {
        WebContainerServlet.getServiceRegistry().add(RICH_TEXT_AREA_SERVICE);
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/richtext/Ok.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Cancel.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Foreground.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Background.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Bold.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Italic.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Underline.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Undo.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Redo.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Indent.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Outdent.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Cut.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Copy.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Paste.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/BulletedList.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/NumberedList.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Table.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Image.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/HorizontalRule.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Hyperlink.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Subscript.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Superscript.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignLeft.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignCenter.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignRight.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignJustify.gif", ContentType.IMAGE_GIF);
    }
    
    public RichTextAreaPeer() {
        super();
        
        addRequiredComponentClass(Button.class);
        addRequiredComponentClass(ColorSelect.class);
        addRequiredComponentClass(Column.class);
        addRequiredComponentClass(ContentPane.class);
        addRequiredComponentClass(Grid.class);
        addRequiredComponentClass(Label.class);
        addRequiredComponentClass(MenuBarPane.class);
        addRequiredComponentClass(Row.class);
        addRequiredComponentClass(SplitPane.class);
        addRequiredComponentClass(TextField.class);
        addRequiredComponentClass(WindowPane.class);

        addOutputProperty(RichTextArea.TEXT_CHANGED_PROPERTY);
        addOutputProperty(LOCALIZATION_DATA);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return RichTextArea.class;
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return "ExtrasApp.RemoteRichTextArea";
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (RichTextArea.TEXT_CHANGED_PROPERTY.equals(propertyName)) {
            return String.class;
        }
        return null;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(RichTextArea.TEXT_CHANGED_PROPERTY)) {
            RichTextArea rta = (RichTextArea) component;
            return rta.getText();
        } else if (propertyName.equals(LOCALIZATION_DATA)) {
            //FIXME test code.
            Map testMap = new HashMap();
            testMap.put("Integer", new Integer(5));
            testMap.put("Boolean", Boolean.TRUE);
            testMap.put("String", "TestString");
            testMap.put("Color", new Color(0xabcdef));
            return testMap;
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(RICH_TEXT_AREA_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(RichTextArea.TEXT_CHANGED_PROPERTY)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, RichTextArea.TEXT_CHANGED_PROPERTY, newValue);
        }
    }
}
