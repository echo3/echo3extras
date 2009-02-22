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

import org.w3c.dom.Element;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.DataGrid;
import nextapp.echo.extras.app.datagrid.DataGridModel;
import nextapp.echo.extras.app.datagrid.PrefetchDataGridModel;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.ServiceRegistry;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>DataGrid</code>s.
 */
public class DataGridPeer extends AbstractComponentSynchronizePeer {
    
    private static final Service DATA_GRID_SERVICE = JavaScriptService.forResources("EchoExtras.DataGrid",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.DataGrid.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.DataGrid.js",
                            "nextapp/echo/extras/webcontainer/resource/RemoteClient.DataGrid.js"});

    public static class ModelData {
        
        private int firstColumn, firstRow, lastColumn, lastRow;
        private DataGridModel model;
        
        public ModelData(DataGridModel model, int firstColumn, int firstRow, int lastColumn, int lastRow) {
            super();
            this.model = model;
            this.firstColumn = firstColumn;
            this.firstRow = firstRow;
            this.lastColumn = lastColumn;
            this.lastRow = lastRow;

            if (model instanceof PrefetchDataGridModel) {
                ((PrefetchDataGridModel) model).prefetch(firstColumn, firstRow, lastColumn, lastRow);
            }
        }
        
        public DataGridModel getModel() {
            return model;
        }
        
        public int getFirstColumn() {
            return firstColumn;
        }
        
        public int getFirstRow() {
            return firstRow;
        }
        
        public int getLastColumn() {
            return lastColumn;
        }
        
        public int getLastRow() {
            return lastRow;
        }
    }
    
    public static class ModelDataPeer 
    implements SerialPropertyPeer {

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, java.lang.Class,
         *      org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement)
        throws SerialException {
            throw new UnsupportedOperationException();
        }

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, java.lang.Class,
         *      org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue)
        throws SerialException {
            PropertyPeerFactory factory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
            ModelData modelData = (ModelData) propertyValue;
            DataGridModel model = modelData.getModel();
            Element modelElement = propertyElement.getOwnerDocument().createElement("model");
            modelElement.setAttribute("cc", Integer.toString(model.getColumnCount()));
            modelElement.setAttribute("rc", Integer.toString(model.getRowCount()));
            modelElement.setAttribute("x1", Integer.toString(modelData.getFirstColumn()));
            modelElement.setAttribute("y1", Integer.toString(modelData.getFirstRow()));
            modelElement.setAttribute("x2", Integer.toString(modelData.getLastColumn()));
            modelElement.setAttribute("y2", Integer.toString(modelData.getLastRow()));
            for (int row = modelData.getFirstRow(); row < modelData.getLastRow(); ++row) {
                for (int column = modelData.getFirstColumn(); column < modelData.getLastColumn(); ++column) {
                    Element pElement = propertyElement.getOwnerDocument().createElement("p");
                    Object modelValue = model.get(column, row);
                    if (modelValue != null) {
                        SerialPropertyPeer modelValuePeer = factory.getPeerForProperty(modelValue.getClass());
                        modelValuePeer.toXml(context, objectClass, pElement, modelValue);
                    }
                    modelElement.appendChild(pElement);
                }
            }
            propertyElement.appendChild(modelElement);
        }
    }
    
    static {
        CommonResources.install();

        ServiceRegistry services = WebContainerServlet.getServiceRegistry();
        services.add(DATA_GRID_SERVICE);
    }
    
    /**
     * Default constructor.
     */
    public DataGridPeer() {
        super();
   //     addOutputProperty(DataGrid.MODEL_CHANGED_PROPERTY);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return "Extras.RemoteDataGrid";
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return DataGrid.class;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(DataGrid.MODEL_CHANGED_PROPERTY)) {
            DataGrid dataGrid = (DataGrid) component;
            return new ModelData(dataGrid.getModel(), 0, 0, 19, 19);
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(DATA_GRID_SERVICE.getId());
    }
}
