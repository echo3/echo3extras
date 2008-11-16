/**
 * DataGrid component.
 *
 * This is an EXPERIMENTAL component, it should not be used at this point for any purpose other than testing it.
 *
 * @cp {Extras.DataGrid.Model} model the data model
 * @cp {Number} rowIndex displayed origin row index
 * @cp {Number} columnIndex displayed origin column index
 * @cp {Border} cellBorder default cell border
 * @sp {Number} fixedRowsTop the number of rows at the top which should not scroll
 * @sp {Number} fixedRowsBottom the number of rows at the bottom which should not scroll
 * @sp {Number} fixedColumnsRight the number of columns on the right side which should not scroll
 * @sp {Number} fixedColumnsLeft the number of columns on the left side which should not scroll
 * @sp {Array} columnWidth the widths of columns (as Extents)
 */
Extras.DataGrid = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DataGrid", this);
    },
    
    componentType: "Extras.DataGrid",
    
    pane: true
});

Extras.DataGrid.Model = Core.extend({

    $abstract: {
    
        get: function(column, row) { },
    
        getColumnCount: function() {
        },
        
        getRowCount: function() {
        }
    }
});
