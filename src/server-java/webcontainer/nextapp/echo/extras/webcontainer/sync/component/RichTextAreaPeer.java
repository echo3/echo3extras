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

package nextapp.echo.extras.webcontainer.sync.component;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Label;
import nextapp.echo.app.Panel;
import nextapp.echo.app.Row;
import nextapp.echo.app.SelectField;
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

    private static final String RESOURCE_DIR = "nextapp/echo/extras/webcontainer/resource/";
    
    private static final Service RICH_TEXT_AREA_SERVICE = JavaScriptService.forResources("EchoExtras.RichTextArea",
            new String[] { RESOURCE_DIR + "Application.RichTextArea.js",
                           RESOURCE_DIR + "Sync.RichTextArea.js",
                           RESOURCE_DIR + "RemoteClient.RichTextArea.js" });
    
    private static final Map LOCALE_SERVICES = new HashMap();
    
    static {
        WebContainerServlet.getServiceRegistry().add(RICH_TEXT_AREA_SERVICE);
        addLocaleService(Locale.GERMAN, "de");
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/richtext/AlignmentCenter.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignmentJustify.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignmentLeft.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/AlignmentRight.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Background.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Bold.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/BulletedList.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Cancel.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Copy.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Cut.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Foreground.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/HorizontalRule.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Hyperlink.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Image.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Indent.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Italic.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/NumberedList.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Ok.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Outdent.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Paste.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Redo.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Subscript.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Superscript.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Table.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Underline.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/richtext/Undo.gif", ContentType.IMAGE_GIF);
    }
    
    /**
     * Adds a locale-specific service.
     * 
     * @param locale server-side <code>Locale</code>
     * @param localeCode client-side locale code
     */
    private static void addLocaleService(Locale locale, String localeCode) {
        Service service = JavaScriptService.forResource("EchoExtras.RichTextArea." + localeCode, 
                RESOURCE_DIR + "SyncLocale.RichTextArea." + localeCode + ".js");
        WebContainerServlet.getServiceRegistry().add(service);
        LOCALE_SERVICES.put(locale, service);
    }
    
    /**
     * Default constructor.
     */
    public RichTextAreaPeer() {
        super();
        
        addRequiredComponentClass(Button.class);
        addRequiredComponentClass(ColorSelect.class);
        addRequiredComponentClass(Column.class);
        addRequiredComponentClass(ContentPane.class);
        addRequiredComponentClass(Grid.class);
        addRequiredComponentClass(Label.class);
        addRequiredComponentClass(MenuBarPane.class);
        addRequiredComponentClass(Panel.class);
        addRequiredComponentClass(Row.class);
        addRequiredComponentClass(SelectField.class);
        addRequiredComponentClass(SplitPane.class);
        addRequiredComponentClass(TextField.class);
        addRequiredComponentClass(WindowPane.class);

        addOutputProperty(RichTextArea.TEXT_CHANGED_PROPERTY);
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
        return "Extras.RemoteRichTextArea";
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
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(RICH_TEXT_AREA_SERVICE.getId());
        installLocaleService(context, component);
    }

    /**
     * Installs a locale-specific service (if available) for a specific component.
     * 
     * @param context the relevant <code>Context</code>
     * @param component the component
     */
    private void installLocaleService(Context context, Component component) {
        Locale locale = component.getRenderLocale();
        if (LOCALE_SERVICES.containsKey(locale)) {
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(((Service) LOCALE_SERVICES.get(locale)).getId());
        }
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
