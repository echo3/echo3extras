package nextapp.echo.extras.app.menu;

import nextapp.echo.app.event.ChangeListener;

public interface MenuSelectionModel {
    
    void addChangeListener(ChangeListener l);
    
    void removeChangeListener(ChangeListener l);
    
    void setSelectedId(String id);
    
    String getSelectedId();
    
}
