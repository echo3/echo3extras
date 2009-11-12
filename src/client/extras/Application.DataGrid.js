/**
 * DataGrid component: a model-based container which can display extremely large
 * amounts of content in a scrollable view. Content is retrieved from the model
 * only as necessary, enabling the component to contain more content than could
 * ever possibly be rendered. This component renders its content using cell
 * renderers, not child components. This component may not contain child
 * components.
 * 
 * This is an EXPERIMENTAL component, it should not be used at this point for
 * any purpose other than testing it.
 * 
 * @cp {Extras.DataGrid.Model} model the data model
 * @cp {Number} columnIndex displayed column index (indicates leftmost (leading) column in scrollable area)
 * @cp {Number} rowIndex displayed row index (indicates topmost column in scrollabel area)
 * @cp {Number} columnScroll displayed column percent, a value between 0 and 100
 * @cp {Number} rowScroll displayed row percent, a value between 0 and 100
 * @cp {Border} cellBorder default cell border
 * @sp {Number} fixedRowsTop the number of rows at the top which should not
 *     scroll
 * @sp {Number} fixedRowsBottom the number of rows at the bottom which should
 *     not scroll
 * @sp {Number} fixedColumnsRight the number of columns on the right side which
 *     should not scroll
 * @sp {Number} fixedColumnsLeft the number of columns on the left side which
 *     should not scroll
 * @sp {Array} columnWidth the widths of columns (as Extents)
 */
Extras.DataGrid = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DataGrid", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.DataGrid",
    
    /** @see Echo.Component#pane */
    pane: true
});

/**
 * Abstract base class for <code>DataGrid</code> models.
 */
Extras.DataGrid.Model = Core.extend({

    $abstract: {
    
        /**
         * Returns the data value contained in the model at the specified column and row.
         * The value will be provided to a renderer before it is displayed.
         * The returned value may be of any type.
         * 
         * @param {Number} column the column number (0-based)
         * @param {Number} row the row number (0-based)
         * @return the model value
         */
        get: function(column, row) { },
    
        /**
         * Returns the number of columns in the model
         * 
         * @return the number of columns in the model
         * @type Number
         */
        getColumnCount: function() { },
        
        /**
         * Returns the number of rows in the model
         * 
         * @return the number of rows in the model
         * @type Number
         */
        getRowCount: function() { }
    },
    
    $virtual: {
        
        /**
         * Invoked to notify model of a region of data which should be made available for display.
         * 
         * @param {Function} callback function which should be invoked by implementation when prefetching has completed
         *        this function may be invoked asynchronously, i.e., as a result of an event that is fired some time after the
         *        prefetch method has returned
         * @param {Number} firstColumn the first column to retrieve (inclusive)
         * @param {Number} firstRow the first row to retrieve (inclusive)
         * @param {Number} lastColumn the last column to retrieve (inclusive)
         * @param {Number} lastRow the last row to retrieve (inclusive)
         */
        prefetch: null
    }
});

