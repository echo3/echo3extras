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

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.extras.app.DataGrid;
import nextapp.echo.extras.app.datagrid.DataGridModel;
import nextapp.echo.extras.app.datagrid.PrefetchDataGridModel;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.SynchronizationContext;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.ServiceRegistry;
import nextapp.echo.webcontainer.SynchronizationException;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>DataGrid</code>s.
 */
public class DataGridPeer extends AbstractComponentSynchronizePeer {
    
    private static final Service MODEL_SERVICE = new Service() {

        /**
         * Maximum number of cells to render in a single service request.
         */
        private static final int MAX_SIZE = 4096;
        
        /**
         * @see nextapp.echo.webcontainer.Service#getId()
         */
        public String getId() {
            return "EchoExtras.DataGrid.Model";
        }

        /**
         * @see nextapp.echo.webcontainer.Service#getVersion()
         */
        public int getVersion() {
            return DO_NOT_CACHE;
        }

        /**
         * @see nextapp.echo.webcontainer.Service#service(nextapp.echo.webcontainer.Connection)
         */
        public void service(Connection conn)
        throws IOException {
            try {
                HttpServletRequest request = conn.getRequest();
                String clientRenderId = request.getParameter("cid");
                DataGrid dataGrid = (DataGrid) conn.getUserInstance().getComponentByClientRenderId(clientRenderId);
                int firstColumn = Integer.parseInt(request.getParameter("x1"));
                int lastColumn = Integer.parseInt(request.getParameter("x2"));
                int firstRow = Integer.parseInt(request.getParameter("y1"));
                int lastRow = Integer.parseInt(request.getParameter("y2"));
                int size = (lastRow - firstRow + 1) * (lastColumn - firstColumn + 1);
                if (size > MAX_SIZE) {
                    throw new IOException("Model request for " + size + " cells exceeded maximum size of " + MAX_SIZE + " cells.");
                }
                ModelData modelData = new ModelData(dataGrid.getModel(), firstColumn, firstRow, lastColumn, lastRow);
                
                Document document = DomUtil.createDocument("model", null, null, null);
                Context context = new SynchronizationContext(conn, document);
                
                renderModelDataContent(context, modelData, document.getDocumentElement());
                
                conn.setContentType(ContentType.TEXT_XML);
                DomUtil.save(document, conn.getOutputStream(), null);
            } catch (SerialException ex) {
                throw new SynchronizationException("Unable to render model data.", ex);
            } catch (SAXException ex) {
                throw new SynchronizationException("Unable to render model data.", ex);
            }
        }
    };
    
    private static final Service SCRIPT_SERVICE = JavaScriptService.forResources("EchoExtras.DataGrid",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.DataGrid.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.DataGrid.js",
                            "nextapp/echo/extras/webcontainer/resource/RemoteClient.DataGrid.js"});

    /**
     * A representation of a block of <code>DataGridModel</code> data.
     */
    public static class ModelData {
        
        private int firstColumn, firstRow, lastColumn, lastRow;
        private DataGridModel model;
        
        /**
         * Creates a new <code>ModelData</code> instance.
         * 
         * @param model the <code>DataGridModel</code>
         * @param firstColumn the first column (inclusive)
         * @param firstRow the first row (inclusive)
         * @param lastColumn the last column (inclusive)
         * @param lastRow the last row (inclusive)
         */
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
        
        /**
         * Returns the <code>DataGridModel</code>.
         * 
         * @return the <code>DataGridModel</code>
         */
        public DataGridModel getModel() {
            return model;
        }
        
        /**
         * Returns the first column.
         * 
         * @return the first column
         */
        public int getFirstColumn() {
            return firstColumn;
        }
        
        /**
         * Returns the first row.
         * 
         * @return the first row
         */
        public int getFirstRow() {
            return firstRow;
        }
        
        /**
         * Returns the last column.
         * 
         * @return the last column
         */
        public int getLastColumn() {
            return lastColumn;
        }
        
        /**
         * Returns the last row.
         * 
         * @return the last row
         */
        public int getLastRow() {
            return lastRow;
        }
    }
    
    /**
     * Serialization peer for <code>ModelData</code>.
     */
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
            propertyElement.setAttribute("t", "Extras.RemoteDataGrid.Model");
            ModelData modelData = (ModelData) propertyValue;
            DataGridModel model = modelData.getModel();
            Element modelElement = propertyElement.getOwnerDocument().createElement("model");
            modelElement.setAttribute("cc", Integer.toString(model.getColumnCount()));
            modelElement.setAttribute("rc", Integer.toString(model.getRowCount()));
            modelElement.setAttribute("x1", Integer.toString(modelData.getFirstColumn()));
            modelElement.setAttribute("y1", Integer.toString(modelData.getFirstRow()));
            modelElement.setAttribute("x2", Integer.toString(modelData.getLastColumn()));
            modelElement.setAttribute("y2", Integer.toString(modelData.getLastRow()));
            renderModelDataContent(context, modelData, modelElement);
            propertyElement.appendChild(modelElement);
        }
    }
    
    /**
     * Renders the content of a model data property to XML.  Appends created property elements to specified parent element.
     * 
     * @param context the relevant <code>Context</code> object (a <code>SynchronizationContext</code>)
     * @param modelData the <code>ModelData</code> whose content is to be rendered
     * @param parentElement the parent DOM <code>Element</code>
     * @throws SerialException
     */
    public static void renderModelDataContent(Context context, ModelData modelData, Element parentElement) 
    throws SerialException {
        PropertyPeerFactory factory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        for (int row = modelData.getFirstRow(); row <= modelData.getLastRow(); ++row) {
            for (int column = modelData.getFirstColumn(); column <= modelData.getLastColumn(); ++column) {
                Element pElement = parentElement.getOwnerDocument().createElement("p");
                Object modelValue = modelData.getModel().get(column, row);
                if (modelValue != null) {
                    SerialPropertyPeer modelValuePeer = factory.getPeerForProperty(modelValue.getClass());
                    modelValuePeer.toXml(context, DataGridModel.class, pElement, modelValue);
                }
                parentElement.appendChild(pElement);
            }
        }
    }
    
    static {
        CommonResources.install();

        ServiceRegistry services = WebContainerServlet.getServiceRegistry();
        services.add(SCRIPT_SERVICE);
        services.add(MODEL_SERVICE);
    }
    
    /**
     * Default constructor.
     */
    public DataGridPeer() {
        super();
        addOutputProperty(DataGrid.MODEL_CHANGED_PROPERTY);
        addOutputProperty(DataGrid.COLUMN_INDEX_CHANGED_PROPERTY);
        addOutputProperty(DataGrid.ROW_INDEX_CHANGED_PROPERTY);
        addOutputProperty(DataGrid.COLUMN_PERCENT_CHANGED_PROPERTY);
        addOutputProperty(DataGrid.ROW_PERCENT_CHANGED_PROPERTY);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
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
        DataGrid dataGrid = (DataGrid) component;
        if (propertyName.equals(DataGrid.MODEL_CHANGED_PROPERTY)) {
            return new ModelData(dataGrid.getModel(), 0, 0, 19, 19);
        } else if (propertyName.equals(DataGrid.COLUMN_INDEX_CHANGED_PROPERTY)) {
            return dataGrid.getColumnIndex();
        } else if (propertyName.equals(DataGrid.ROW_INDEX_CHANGED_PROPERTY)) {
            return dataGrid.getRowIndex();
        } else if (propertyName.equals(DataGrid.COLUMN_PERCENT_CHANGED_PROPERTY)) {
            return dataGrid.getColumnPercent();
        } else if (propertyName.equals(DataGrid.ROW_PERCENT_CHANGED_PROPERTY)) {
            return dataGrid.getRowPercent();
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
        serverMessage.addLibrary(SCRIPT_SERVICE.getId());
    }
}
