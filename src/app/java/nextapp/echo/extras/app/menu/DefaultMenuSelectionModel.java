package nextapp.echo.extras.app.menu;

public class DefaultMenuSelectionModel extends AbstractMenuSelectionModel {
    
    private String selectedId;
    
    public String getSelectedId() {
        return selectedId;
    }

    public void setSelectedId(String id) {
        selectedId = id;
        fireStateChanged();
    }

}
