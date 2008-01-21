package nextapp.echo.extras.app;

import java.util.Iterator;

import nextapp.echo.app.ImageReference;

public interface IconSet {

    public Iterator getIconNames();
    
    public ImageReference getIcon(String name);
}
