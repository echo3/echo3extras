/**
 * ListViewer component.
 * Displays a vertically scrolling model-based table.  The table model rows are fetched on an as-required basis, such that
 * the table may have a very large number of rows (e.g., thousands/millions/billions) without a significant performance impact.
 * 
 * @cp {Extras.Viewer.Model} model the data model
 * @cp {Extras.Sync.ListViewer.Renderer} renderer the model renderer
 * @cp {Array} selection the array of selected indices (integers)
 * @cp {Array} columnName an array of column names
 * @cp {Array} columnWidth an array of column widths; may be specified as percentage or absolute extent values
 * 
 * @sp {#FillImage} backgroundImage background image to render behind entire component  
 * @sp {#Border} border the cell border (a multi-sided border may be used, e.g., if a single pixel wide border is desired between
 *     cells, or if only horizontal or vertical borders are desired
 * @sp {#Color} headerBackground the background color of header cells
 * @sp {#Color} headerForeground the foreground color of header cells
 * @sp {#Insets} headerInsets the header cell insets
 * @sp {#Insets} insets the cell insets
 * @sp {Boolean} rolloverEnabled flag indicating whether pointing-device rollover effects are enabled
 * @sp {#Color} rolloverBackground background color for row pointing-device rollover effect
 * @sp {#Color} rolloverForeground foreground color for row pointing-device rollover effect
 * @sp {#Color} selectionBackground background color for row selection effect
 * @sp {#Color} selectionForeground foreground color for row selection effect
 */
Extras.ListViewer = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ListViewer", this);
    },

    componentType: "Extras.ListViewer",
    
    pane: true,
    
    /**
     * Fires an action event for selection of the specified model index.
     */
    doAction: function(index) {
        this.fireEvent({ type: "action", source: this, index: index });
    }
});
