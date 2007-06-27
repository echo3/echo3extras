package nextapp.echo.extras.webcontainer.sync.component;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;
import nextapp.echo.webcontainer.util.MultiIterator;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class TreePeer 
extends AbstractComponentSynchronizePeer {

    private class TreeStructure {
        
        Tree tree;
        
        TreeStructure(Tree tree) {
            this.tree = tree;
        }
    }
    
    public static class TreeStructurePeer 
    implements SerialPropertyPeer {
    
        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement) 
        throws SerialException {
            throw new UnsupportedOperationException();
        }
    
        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
        throws SerialException {
            Tree tree = ((TreeStructure) propertyValue).tree;
            TreeStructureRenderer renderer = new TreeStructureRenderer(propertyElement, tree);
            propertyElement.setAttribute("t", "ExtrasSerial.TreeStructure");
            renderer.render();
        }
    }
    
    private static class TreeStructureRenderer {
        
        private Tree tree;
        private TreeModel model;
        private int columnCount;
        private int row = 0;
        private Element propertyElement;
        private Document document;
        
        TreeStructureRenderer(Element propertyElement, Tree tree) {
            this.propertyElement = propertyElement;
            document = propertyElement.getOwnerDocument();
            this.tree = tree;
            columnCount = getColumnCount(tree);
            model = tree.getModel();
        }
        
        private void render() {
            renderNode(null, model.getRoot());
        }
        
        private void renderNode(String parentId, Object value) {
            Component component = tree.getComponent(row * columnCount);
            boolean expanded = tree.isExpanded(row);
            String id = UserInstance.getElementId(component);
            Element eElement = document.createElement("e");
//            eElement.setAttribute("x", Integer.toString(row));
            eElement.setAttribute("i", id);
            if (parentId != null) {
                eElement.setAttribute("p", parentId);
            }
//            eElement.setAttribute("d", "" + depth);
            if (expanded) {
                eElement.setAttribute("ex", "1");
            }
            propertyElement.appendChild(eElement);

            int childCount = model.getChildCount(value);

            ++row;
            
            if (expanded) {
                for (int i = 0; i < childCount; ++i) {
                    renderNode(id, model.getChild(value, i));
                }
            }
            
        }
    }
    
    private static int getColumnCount(Tree tree) {
        return 1; // FIXME
    }

    private static final String PROPERTY_TREE_STRUCTURE = "treeStructure";
    private static final String PROPERTY_COLUMN_COUNT = "columnCount";
    
    private static final String[] MODEL_CHANGED_UPDATE_PROPERTIES = new String[] { PROPERTY_TREE_STRUCTURE,
            PROPERTY_COLUMN_COUNT };

    private static final Service TREE_SERVICE = JavaScriptService.forResources("EchoExtras.RemoteTree",  
            new String[]{ "/nextapp/echo/extras/webcontainer/resource/js/Application.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Serial.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Render.RemoteTree.js" });
    
    static {
        WebContainerServlet.getServiceRegistry().add(TREE_SERVICE);
    }
    
    public TreePeer() {
        super();
        addOutputProperty(PROPERTY_TREE_STRUCTURE);
        addOutputProperty(PROPERTY_COLUMN_COUNT);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Tree.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
     */
    public String getClientComponentType() {
        return "nextapp.echo.extras.app.RemoteTree";
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (PROPERTY_TREE_STRUCTURE.equals(propertyName)) {
            return new TreeStructure((Tree) component);
        } else if (PROPERTY_COLUMN_COUNT.equals(propertyName)) {
            return new Integer(getColumnCount((Tree) component));
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getUpdatedOutputPropertyNames(
     *      nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component,
     *      nextapp.echo.app.update.ServerComponentUpdate)
     */
    public Iterator getUpdatedOutputPropertyNames(Context context, Component component, 
            ServerComponentUpdate update) {
        Iterator normalPropertyIterator = super.getUpdatedOutputPropertyNames(context, component, update);
        
        if (update.hasUpdatedProperty(Tree.MODEL_CHANGED_PROPERTY)) {
            return new MultiIterator(
                    new Iterator[]{ normalPropertyIterator, new ArrayIterator(MODEL_CHANGED_UPDATE_PROPERTIES) });
        } else if (update.hasUpdatedProperty(Tree.EXPANSION_STATE_CHANGED_PROPERTY)) {
            return new ArrayIterator(new String[] {PROPERTY_TREE_STRUCTURE});
        } else {
            return normalPropertyIterator;
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(TREE_SERVICE.getId());
    }
}
