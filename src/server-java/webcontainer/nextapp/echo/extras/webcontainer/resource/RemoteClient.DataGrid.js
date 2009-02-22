/**
 * RemoteClient-hosted DataGrid component.
 */
Extras.RemoteDataGrid = Core.extend(Extras.DataGrid, {
    
    $static: {

        /**
         * Server-based incrementally provided model.
         */
        Model: Core.extend(Extras.DataGrid.Model, {
            
            /**
             * Column count.
             * @type Number
             */
            _columnCount: null,
            
            /**
             * Row count.
             * @type Number
             */
            _rowCount: null,
            
            /**
             * Row storage.  Temporary implementation, this will crash and burn on large DataGrids.
             */
            _rows: null,
            
            /**
             * Constructor.
             * 
             * @param {Number} columnCount the column count
             * @param {Number} rowCount the row count
             */
            $construct: function(columnCount, rowCount) {
                this._rows = [];
                this._columnCount = columnCount;
                this._rowCount = rowCount;
            },
            
            /** @see Extras.DataGrid.Model#get */
            get: function(column, row) {
                var rowArray = this._rows[row];
                return rowArray ? rowArray[column] : null;
            },
            
            /** @see Extras.DataGrid.Model#getColumnCount */
            getColumnCount: function() {
                return this._columnCount;
            },
            
            /** @see Extras.DataGrid.Model#getRowCount */
            getRowCount: function() {
                return this._rowCount;
            },
            
            /** @see Extras.DataGrid.Model#prefetch */
            prefetch: function(callback, firstColumn, firstRow, lastColumn, lastRow) {
                callback();
            },
            
            set: function(column, row, value) {
                var rowArray = this._rows[row];
                if (!rowArray) {
                    rowArray = [];
                    this._rows[row] = rowArray;
                }
                this._rows[row][column] = value;
            }
        })
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteDataGrid", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.RemoteDataGrid",
    
    $construct: function(properties) {
        Extras.DataGrid.call(this, properties);
    }
});

/**
 * RemoteClient-hosted DataGrid component synchronization peer.
 */
Extras.Sync.RemoteDataGrid = Core.extend(Extras.Sync.DataGrid, {

    $static: {

        Serial: {
    
            Model: Core.extend(Echo.Serial.PropertyTranslator, {
                
                $static: {
                
                    /** @see Echo.Serial.PropertyTranslator#toProperty */
                    toProperty: function(client, pElement) {
                        var modelElement = pElement.firstChild;
                        var model = new Extras.RemoteDataGrid.Model(parseInt(modelElement.getAttribute("cc"), 10),
                                parseInt(modelElement.getAttribute("rc"), 10));
                        var x1 = parseInt(modelElement.getAttribute("x1"), 10),
                            y1 = parseInt(modelElement.getAttribute("y1"), 10),
                            x2 = parseInt(modelElement.getAttribute("x2"), 10),
                            y2 = parseInt(modelElement.getAttribute("y2"), 10);
                        var x = x1, y = y1;
                        var valueElement = modelElement.firstChild;
                        while (valueElement) {
                            // Retrieve value.  (Use property sync peers, not implemented yet)
                            model.set(x, y, valueElement.firstChild ? valueElement.firstChild.nodeValue : null);
                            
                            // Move to next value.
                            valueElement = valueElement.nextSibling;
                            ++x;
                            if (x > x2) {
                                x = x1;
                                ++y;
                            }
                        }
                        return model;
                    }
                },
                
                $load: function() {
                    Echo.Serial.addPropertyTranslator("Extras.RemoteDataGrid.Model", this);
                }
            })
        }
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteDataGrid", this);
    }
});
