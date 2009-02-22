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
             * Constructor.
             * 
             * @param {Number} columnCount the column count
             * @param {Number} rowCount the row count
             */
            $construct: function(columnCount, rowCount) {
                this._columnCount = columnCount;
                this._rowCount = rowCount;
            },
            
            /** @see Extras.DataGrid.Model#get */
            get: function(column, row) {
                return "Test: " + column * row;
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
