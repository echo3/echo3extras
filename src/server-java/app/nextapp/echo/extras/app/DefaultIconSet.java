package nextapp.echo.extras.app;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.ImageReference;

public class DefaultIconSet 
implements IconSet {

    private Map icons = new HashMap();
    
    public void addIcon(String name, ImageReference icon) {
        icons.put(name, icon);
    }

    /**
     * @see nextapp.echo.extras.app.IconSet#getIcon(java.lang.String)
     */
    public ImageReference getIcon(String name) {
        return (ImageReference) icons.get(name);
    }

    /**
     * @see nextapp.echo.extras.app.IconSet#getIconNames()
     */
    public Iterator getIconNames() {
        return Collections.unmodifiableSet(icons.keySet()).iterator();
    }
}
