package nextapp.echo.extras.app;

import nextapp.echo.app.Component;
import nextapp.echo.app.ImageReference;

/**
 * Reorder handle component: a drag handle component which may be placed inside a child of a Reorder component to allow the user
 * to rearrange the children.
 */
public class ReorderHandle extends Component {
    
    public static final String PROPERTY_ICON = "icon";
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";

    /**
     * Creates a new <code>ReorderHandle</code>.
     */
    public ReorderHandle() {
        super();
    }

    /**
     * Creates a new <code>ReorderHandle</code> with the specified icon.
     * 
     * @param icon the icon
     */
    public ReorderHandle(ImageReference icon) {
        super();
        setIcon(icon);
    }

    /**
     * Returns the icon of the reorder handle.
     * 
     * @return the icon
     */
    public ImageReference getIcon() {
        return (ImageReference) get(PROPERTY_ICON);
    }
    
    /**
     * Returns the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @return the tool tip text
     */
    public String getToolTipText() {
        return (String) get(PROPERTY_TOOL_TIP_TEXT);
    }
    
    /**
     * Sets the icon to be displayed.
     *
     * @param newValue the icon to be displayed
     */
    public void setIcon(ImageReference newValue) {
        set(PROPERTY_ICON, newValue);
    }

    /**
     * Sets the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @param newValue the new tool tip text
     */
    public void setToolTipText(String newValue) {
        set(PROPERTY_TOOL_TIP_TEXT, newValue);
    }
}
