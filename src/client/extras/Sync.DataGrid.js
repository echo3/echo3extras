/**
 * Component rendering peer: DataGrid.
 * This class should not be extended by developers, the implementation is subject to change.
 *
 * This is an EXPERIMENTAL component, it should not be used at this point for any purpose other than testing it.
 */
Extras.Sync.DataGrid = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.DataGrid", this);
    },
    
    $static: {
                
        /**
         * Horizontal/Vertical constant for left direction.
         */
        LEFT: { h: -1, v: 0 },
        
        /**
         * Horizontal/Vertical constant for right direction.
         */
        RIGHT: { h: 1, v: 0 },
        
        /**
         * Horizontal/Vertical constant for up direction.
         */
        UP: { h: 0, v: -1 },

        /**
         * Horizontal/Vertical constant for down direction.
         */
        DOWN: { h: 0, v: 1 },

        REGION_LOCATIONS: {
            topLeft:     { h: -1, v: -1 },
            top:         { h:  0, v: -1 },
            topRight:    { h:  1, v: -1 },
            left:        { h: -1, v:  0 },
            center:      { h:  0, v:  0 },
            right:       { h:  1, v:  0 },
            bottomLeft:  { h: -1, v:  1 },
            bottom:      { h:  0, v:  1 },
            bottomRight: { h:  1, v:  1 }
        },
        
        /**
         * Determines if two segments in a line share any points.
         *
         * @param {Number} a1 first point of segment A
         * @param {Number} a2 second point of segment A
         * @param {Number} b1 first point of segment B
         * @param {Number} b2 second point of segment B
         * @return true if the segments share any points
         */
        intersect: function(a1, a2, b1, b2) {
            return (b1 <= a1 && a1 <= b2) || (a1 <= b1 && b1 <= a2);
        },
        
        ScrollPosition: Core.extend({
            
            xIndex: null,
            
            yIndex: null,
            
            xScroll: 0,
            
            yScroll: 0,
            
            load: function(component) {
                this.setIndex(component.get("columnIndex"), component.get("rowIndex"));
                this.setScroll(component.get("columnScroll"), component.get("rowScroll"));
            },
            
            setIndex: function(x, y) {
                if (x != null) {
                    this.xIndex = x;
                    this.xScroll = null;
                }
                if (y != null) {
                    this.yIndex = y;
                    this.yScroll = null;
                }
            },
            
            setScroll: function(x, y) {
                if (x != null) {
                    this.xScroll = x;
                    this.xIndex = null;
                }
                if (y != null) {
                    this.yScroll = y;
                    this.yIndex = null;
                }
            },
            
            store: function(component) {
                component.set("columnScroll", this.xScroll, true);
                component.set("rowScroll", this.yScroll, true);
                component.set("columnIndex", this.xIndex, true);
                component.set("rowIndex", this.yIndex, true);
            }
        }),
        
        /**
         * Abstract base class for cell renderers.
         */
        CellRenderer: Core.extend({
            
            $abstract: {
            
                /**
                 * Returns an HTML representation of a DataGrid cell.
                 * 
                 * @param {Extras.Sync.DataGrid.RenderContext} context contextual information
                 *        (provides reference to DataGrid instance, capabilities to get/set state object for cell)
                 * @param value the value provided by the model
                 * @param {Number} column the column index
                 * @param {Number} row the row index 
                 * 
                 * @return a rendered node which should be added to the DOM in the cell (may return null)
                 * @type Node
                 */
                render: function(context, value, column, row) { }
            },
            
            $virtual: {

                /**
                 * Optional disposal method to deallocate resources used by a rendered DataGrid cell.
                 * May be used for purposes such as unregistering listeners on interactive cell renderings.
                 * A state object must have been set in the RenderContext in order for this method to be invoked.
                 * 
                 * @param {Extras.Sync.DataGrid.RenderContext} context contextual information
                 *        (provides reference to DataGrid instance, capabilities to get/set state object for cell) 
                 * @param {Number} column
                 * @param {Number} row 
                 */
                dispose: null
            }
        }),
        
        /**
         * Contextual data used by cell renderers.
         * Provides capability to get/set state of cell, access to DataGrid instance.
         * RenderContexts are created and disposed with tiles.
         */
        RenderContext: Core.extend({
            
            _states: null,
            
            /**
             * The relevant DataGrid.
             * @type Extras.DataGrid
             */
            dataGrid: null,
            
            /**
             * Creates a new RenderContext.
             * 
             * @param {Extras.DataGrid} dataGrid the relevant DataGrid.
             */
            $construct: function(dataGrid) {
                this.dataGrid = dataGrid;
                this._states = {};
            },
            
            /**
             * Invoked by the tile when it is disposed.  Should never be manually invoked.
             */
            dispose: function() {
                for (var x in this._states) {
                    //FIXME implement cell disposal
                }
            },
            
            /**
             * Retrieves the state object for a rendered cell.
             * 
             * @param {Number} column the cell column index
             * @param {Number} row the cell row index 
             * @return the state object
             */
            getState: function(column, row) {
                return this._states[column + "," + row];
            },
            
            /**
             * Sets the state object for a rendered cell.
             * State objects are arbitrary renderer-defined objects containing state information about a cell.
             * A typical use for a state object would be for an interactive cell to store elements such that listeners 
             * may be removed from them when a cell is disposed.
             * 
             * @param {Number} column the cell column index
             * @param {Number} row the cell row index
             * @param state the state object, an arbitrary renderer-defined object containing state information about the
             *        cell  
             */
            setState: function(column, row, state) {
                this._states[column + "," + row] = state;
            }
        }),

        /**
         * Representation of a "tile", a sub-table that renders a portion of the DataGrid.
         * Tiles are contained within Regions.
         */
        Tile: Core.extend({
            
            /** 
             * The containing DataGrid instance. 
             * @type Extras.Sync.DataGrid
             */
            dataGrid: null,
            
            /** 
             * Flag indicating whether the tile is displayed. 
             * @type Boolean
             */
            displayed: false,
            
            /** 
             * The div element.  Outermost element of a tile, contains the <code>_table</code> element as its only child.
             * @type Element
             */
            div: null,
            
            /** 
             * The table element.  Contained within the <code>div</code> element.
             * @type Element
             */
            _table: null,
            
            /** 
             * The region containing the tile. 
             * @type Extras.Sync.DataGrid.Region
             */
            region: null,
            
            /**
             * Edge information object.  Contains boolean "top", "right", "left", and "bottom" properties, 
             * each of which evaluates to true if the tile is at that extreme edge.
             */
            edge: null,
            
            /**
             * Cell index information object.  Contains integer "top", "right", "left", and "bottom" properties, 
             * each of which indicates the index of cells at that edge of the tile.  
             *
             * As an example, if the DataGrid's tile size were 12 columns by 6 rows, then for the tile in the second column 
             * of the second row, this value would be { top: 6, left: 12, bottom: 11, right: 23 } assuming that the the data 
             * grid had at least  12 rows and 24 columns.  If the data grid only had 9 rows and 18 columns, this value would 
             * be { top: 6, left: 12, bottom: 8, right: 17 }.
             */
            cellIndex: null,
            
            /**
             * Tile index information object.  Contains row and column properties indicating the row/column of the tile
             * within the grid of tiles.  The upper left tile would be at column 0, row 0.  The tile to the right would 
             * be at column 1, row 0.
             */
            tileIndex: null,

            /**
             * The rendered position/size of the tile.  Contains "top", "left", "width", and "height" properties describing
             * rendered bounds of the tile.  Initialized when the tile is displayed.
             */
            positionPx: null,
            
            /**
             * The RenderContext instance specific to this tile.
             * @type Extras.Sync.DataGrid.RenderContext
             */
            _renderContext: null,
            
            /**
             * Creates a new <code>Tile</code>.
             *
             * @param {Extras.Sync.DataGrid} dataGrid the containing data grid peer
             * @param {Extras.Sync.DataGrid.Region} region the containing region
             * @param {Number} tileColumnIndex the column index of the tile
             * @param {Number} tileRowIndex the row index of the tile
             */
            $construct: function(dataGrid, region, tileColumnIndex, tileRowIndex) {
                this.dataGrid = dataGrid;
                this._renderContext = new Extras.Sync.DataGrid.RenderContext(dataGrid);
                this.containerElement = region.element;
                this.tileIndex = { column: tileColumnIndex, row: tileRowIndex };
                this.region = region;
                
                this.edge = { 
                    left: this.tileIndex.column === 0,
                    top: this.tileIndex.row === 0
                };
                
                this.cellIndex = { };
                
                // Determine horizontal data.
                switch (this.region.location.h) {
                case -1:
                    this.cellIndex.left = this.tileIndex.column * this.dataGrid.tileSize.columns;
                    this.cellIndex.right = this.cellIndex.left + this.dataGrid.tileSize.columns - 1;
                    if (this.cellIndex.right >= this.dataGrid.fixedCells.left) {
                        this.cellIndex.right = this.dataGrid.fixedCells.left - 1;
                        this.edge.right = true;
                    }
                    break;
                case 0: 
                    this.cellIndex.left = this.tileIndex.column * this.dataGrid.tileSize.columns + this.dataGrid.fixedCells.left;
                    this.cellIndex.right = this.cellIndex.left + this.dataGrid.tileSize.columns - 1;
                    if (this.cellIndex.right >= this.dataGrid.size.columns - this.dataGrid.fixedCells.right - 1) {
                        this.cellIndex.right = this.dataGrid.size.columns - this.dataGrid.fixedCells.right - 1;
                        this.edge.right = true;
                    }
                    break;
                case 1:
                    this.cellIndex.left = this.dataGrid.size.columns - this.dataGrid.fixedCells.right + 
                            (this.tileIndex.column * this.dataGrid.tileSize.columns);
                    this.cellIndex.right = this.cellIndex.left + this.dataGrid.tileSize.columns - 1;
                    if (this.cellIndex.right >= this.dataGrid.size.columns - 1) {
                        this.cellIndex.right = this.dataGrid.size.columns - 1;
                        this.edge.right = true;
                    }
                    break;
                }
                
                // Determine vertical data.
                switch (this.region.location.v) {
                case -1:
                    this.cellIndex.top = this.tileIndex.row * this.dataGrid.tileSize.rows;
                    this.cellIndex.bottom = this.cellIndex.top + this.dataGrid.tileSize.rows - 1;
                    if (this.cellIndex.bottom >= this.dataGrid.fixedCells.top) {
                        this.cellIndex.bottom = this.dataGrid.fixedCells.top - 1;
                        this.edge.bottom = true;
                    }
                    break;
                case 0: 
                    this.cellIndex.top = this.tileIndex.row * this.dataGrid.tileSize.rows + this.dataGrid.fixedCells.top;
                    this.cellIndex.bottom = this.cellIndex.top + this.dataGrid.tileSize.rows - 1;
                    if (this.cellIndex.bottom >= this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom - 1) {
                        this.cellIndex.bottom = this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom - 1;
                        this.edge.bottom = true;
                    }
                    break;
                case 1:
                    this.cellIndex.top = this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom + 
                            (this.tileIndex.row * this.dataGrid.tileSize.rows);
                    this.cellIndex.bottom = this.cellIndex.top + this.dataGrid.tileSize.rows - 1;
                    if (this.cellIndex.bottom >= this.dataGrid.size.rows - 1) {
                        this.cellIndex.bottom = this.dataGrid.size.rows - 1;
                        this.edge.bottom = true;
                    }
                    break;
                }
            },
            
            /**
             * Adjusts the position of the tile.
             */
            adjustPositionPx: function(px, horizontal) {
                if (this.div) {
                    if (horizontal) {
                        this.positionPx.left += px;
                        this.div.style.left = this.positionPx.left + "px";
                    } else {
                        this.positionPx.top += px;
                        this.div.style.top = this.positionPx.top + "px";
                    }
                }
                
                if (!this.isOnScreen()) {
                    this.remove();
                }
            },
            
            /**
             * Renders the tile.  Sets the div and _table element properties, measures rendered tile and sets
             * positionPx property.
             */
            create: function() {
                if (this.div) {
                    return;
                }
                
                var tr, td, row, column;

                var columnWidths = [];
                
                this.positionPx = { };
                
                this.positionPx.width = 0;
                for (column = this.cellIndex.left; column <= this.cellIndex.right; ++column) {
                    this.positionPx.width += columnWidths[column] = this.dataGrid._getColumnWidth(column);
                }

                this.div = document.createElement("div");
                this.div.style.cssText = "position:absolute;";

                this._table = this.dataGrid.getPrototypeTable().cloneNode(true);
                this._table.style.width = this.positionPx.width + "px";

                this.div.appendChild(this._table);

                for (row = this.cellIndex.top; row <= this.cellIndex.bottom; ++row) {
                    tr = document.createElement("tr");
                    for (column = this.cellIndex.left; column <= this.cellIndex.right; ++column) {
                        td = document.createElement("td");
                        td.style.cssText = "padding:0;overflow:hidden;";
                        Echo.Sync.Border.render(this.dataGrid._cellBorder, td);
                        if (row === this.cellIndex.top) {
                            td.style.width = (columnWidths[column] - this.dataGrid._cellBorderWidthPx) + "px";
                        }
                        var value = this.dataGrid._model.get(column, row);
                        if (value == null) {
                            // FIXME Temporary fix for zero-height cells causing rendering to take forever.
                            // Remove when bounding is working properly.
                            value = "\u00a0";
                        }
                        
                        var values = value.toString().split("\n");
                        for (var iValue = 0; iValue < values.length; ++iValue) {
                            if (iValue > 0) {
                                td.appendChild(document.createElement("br"));
                            }
                            td.appendChild(document.createTextNode(values[iValue]));
                        }
                        tr.appendChild(td);
                    }
                    this._table.firstChild.appendChild(tr);
                }
                
                this.div.style.width = this.positionPx.width + "px";
                
                this.dataGrid.measureDiv.appendChild(this.div);
                this.positionPx.height = this.div.offsetHeight || 100;
                
                this.positionPx.rowHeights = [];
                var tr = this._table.firstChild.firstChild;
                while (tr) {
                    this.positionPx.rowHeights.push(tr.offsetHeight);
                    tr = tr.nextSibling;
                }
                
                this.dataGrid.measureDiv.removeChild(this.div);
            },
            
            /**
             * Displays the tile at the specified coordinates.
             * Does nothing if the tile is already displayed.
             * The right and bottom positions will override left and top, if specified.
             * Note that the tile's CSS position will be set using left/top, even when 
             * right/bottom are specified (measured width/height will be used to position
             * it correctly in such a scenario). 
             *
             * @param {Number} left the left pixel coordinate of the tile within the region
             * @param {Number} top the top pixel coordinate of the tile within the region
             * @param {Number} right the right pixel coordinate of the tile within the region
             * @param {Number} bottom the bottom pixel coordinate of the tile within the region
             */
            display: function(left, top, right, bottom) {
                if (this.displayed) {
                    return;
                }
                this.create();

                if (right != null) {
                    left = right - this.positionPx.width;
                }
                if (bottom != null) {
                    top = bottom - this.positionPx.height;
                }
                
                this.div.style.top = top + "px";
                this.div.style.left = left + "px";
                this.positionPx.top = top;
                this.positionPx.left = left;
                
                this.containerElement.appendChild(this.div);
                this.displayed = true;
            },
            
            /**
             * Disposes resources used by the tile.
             * Must be invoked before the tile is discarded.
             */
            dispose: function() {
                this._renderContext.dispose();
                this.div = this._table = null;
            },
            
            /**
             * Determines if this tile is currently covering the bottom edge of the screen (pixel 0).
             */ 
            isEdgeBottom: function() {
                return this.edge.bottom || (this.positionPx.top < this.region.bounds.height && 
                        this.positionPx.top + this.positionPx.height >= this.region.bounds.height);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeLeft: function() {
                return this.edge.left || this.tileIndex.column === 0 || 
                        (this.positionPx.left <= 0 && this.positionPx.left + this.positionPx.width > 0);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeRight: function() {
                return this.edge.right || (this.positionPx.left < this.region.bounds.width && 
                        this.positionPx.left + this.positionPx.width >= this.region.bounds.width);
            },
            
            /**
             * Determines if this tile is currently covering the top edge of the screen (pixel 0).
             */ 
            isEdgeTop: function() {
                return this.edge.top || this.tileIndex.row === 0 || 
                        (this.positionPx.top <= 0 && this.positionPx.top + this.positionPx.height > 0);
            },
        
            /**
             * Determines if any portion of this tile is currently on screen.
             */
            isOnScreen: function() {
                if (!this.displayed) {
                    return false;
                }
                return Extras.Sync.DataGrid.intersect(this.positionPx.left, this.positionPx.left + 
                        this.positionPx.width, 0, this.region.bounds.width) &&
                        Extras.Sync.DataGrid.intersect(this.positionPx.top, this.positionPx.top + 
                        this.positionPx.height, 0, this.region.bounds.height);
            },

            /**
             * Disposes of resources used by the tile.
             */
            remove: function() {
                if (this.displayed) {
                    this.div.parentNode.removeChild(this.div);
                    this.displayed = false;
                }
            },
            
            setRowHeight: function(row, newHeight) {
                var oldHeight = this.positionPx.rowHeights[row];
                var tbody = this._table.firstChild;
                tbody.childNodes[row].style.height = newHeight + "px";
                this.positionPx.rowHeights[row] = newHeight;
                this.positionPx.height += newHeight - oldHeight;
            },
            
            /** @see Object#toString */
            toString: function() {
                return "Tile (" + this.tileIndex.column + "," + this.tileIndex.row + ")";
            }
        }),
        
        /**
         * Represents a region of the DataGrid.  A DataGrid may have up to nine regions, arranged as three
         * rows and three columns.  Regions in the center row can be vertically scrolled, while the top and bottom rows
         * are vertically fixed.  Regions in the center column can be horizontally scrolled , while the left and right
         * columns are horizontally fixed.
         */
        Region: Core.extend({

            /**
             * The containing Extras.Sync.DataGrid instance.
             * @type Extras.Sync.DataGrid
             */
            dataGrid: null,
            
            /**
             * Object containing all <code>Tile</code> instances held within the region.
             * This object maps tile row indices to tile column maps.
             * The tile column maps map column indices to actual tiles.
             * The indices used are the indices of tiles, not the indices of the cells they contain.
             * This object is organized like a two dimensional array, with rows as the first dimension and columns as the seccond,
             * e.g., requesting _tiles[4][2] would return the tile at row 4 (the fifth row) and column 2 (the third column).
             * Before making such a query one would have to ensure that _tiles[4] is defined.
             * Though integer values are used, note that this is an object, not an array mapping.
             */
            _tiles: null,
            
            /**
             * Cell count size for region, contains rows and columns numeric properties.
             */
            size: null,
            
            /**
             * 
             */
            bounds: null,

            /**
             * The region name one of the following values: 
             * topLeft, top, topRight, left, center, right, bottomLeft, bottom, bottomRight
             * @type String
             */
            name: null,
            
            /** 
             * The location of the region, an object containing h and v properties.
             * These h and v properties may have values of -1, 0, or 1.
             * A value of 0 indicates center, -1 indicates left/top, 1 indicates right/bottom.
             */
            location: null,
            
            /**
             * Creates a new Region.
             *
             * @param {Extras.Sync.DataGrid} dataGrid the containing data grid synchronization peer
             * @param {String} name the region name, one of the following values: 
             *        topLeft, top, topRight, left, center, right, bottomLeft, bottom, bottomRight
             */
            $construct: function(dataGrid, name) {
                var rows, columns;

                this.dataGrid = dataGrid;
                this.name = name;
                this._tiles = { };
                this.location = Extras.Sync.DataGrid.REGION_LOCATIONS[name];

                this.element = document.createElement("div");
                this.element.style.cssText = "position:absolute;overflow:hidden;";
                if (this.location.h != 0 || this.location.v != 0) {
                    //FIXME temporary background color for non center regions.
                    this.element.style.backgroundColor = "#dfffdf";
                }
                
                switch (this.location.v) {
                case -1:
                    this.element.style.top = 0;
                    rows = this.dataGrid.fixedCells.top;
                    break;
                case 0:
                    rows = this.dataGrid.scrollSize.rows;
                    break;
                case 1:
                    this.element.style.bottom = 0;
                    rows = this.dataGrid.fixedCells.bottom;
                    break;
                }
                
                switch (this.location.h) {
                case -1:
                    this.element.style.left = 0;
                    columns = this.dataGrid.fixedCells.left;
                    break;
                case 0:
                    columns = this.dataGrid.scrollSize.columns;;
                    break;
                case 1:
                    this.element.style.right = 0;
                    columns = this.dataGrid.fixedCells.right;
                    break;
                }
                
                this.size = { columns: columns, rows: rows };
                
                this.tileCount = { 
                    columns: Math.ceil(columns / this.dataGrid.tileSize.columns), 
                    rows: Math.ceil(rows / this.dataGrid.tileSize.rows)
                };
            },

            /**
             * Adjusts the positions of tiles within the region, additionally filling in any areas that become
             * unoccupied as a result of the adjustment.
             */
            adjustPositionPx: function(px, horizontal) {
                if ((this.location.h && horizontal) || (this.location.v && !horizontal)) {
                    // Return immediately if region is not scrollable in specified direction.
                    return;
                }
            
                var row, tile;
                for (var rowIndex in this._tiles) {
                    row = this._tiles[rowIndex];
                    for (var columnIndex in row) {
                        tile = row[columnIndex];
                        tile.adjustPositionPx(px, horizontal);
                    }
                }
                
                this.fill(false);
                this.fill(true);
                
                var hasTop = false, hasBottom = false;
                for (var rowIndex in this._tiles) {
                    if (rowIndex == 0) {
                        hasTop = true;
                    }
                    if (hasTop && hasBottom) {
                        break;
                    }
                }
            },
            
            /**
             * Clears the region of tiles, removing/disposing all tile objects in the process.
             */
            clear: function() {
                for (var rowIndex in this._tiles) {
                    var row = this._tiles[rowIndex];
                    for (var columnIndex in row) {
                        var tile = row[columnIndex];
                        tile.remove();
                        tile.dispose();
                    }
                }
                this._tiles = { };
            },

            /**
             * Positions a tile immediately adjacent to another tile.
             *
             * @param {Echo.Sync.DataGrid.Tile} tile the origin tile
             * @param {Echo.Sync.DataGrid.Tile} adjacentTile the adjacent tile
             * @param direction the adjacent direction, one of the following values (defined in Extras.Sync.DataGrid):
             *        <ul>
             *         <li><code>LEFT</code></li>
             *         <li><code>RIGHT</code></li>
             *         <li><code>UP</code></li>
             *         <li><code>DOWN</code></li>
             *        </ul>
             */
            positionTileAdjacent: function(tile, adjacentTile, direction) {
                var left, right, top, bottom;
                switch (direction.h) {
                case -1:
                    right = tile.positionPx.left;
                    break;
                case 1:
                    left = tile.positionPx.left + tile.positionPx.width;
                    break;
                default:
                    left = tile.positionPx.left;
                }
                
                switch (direction.v) {
                case -1:
                    bottom = tile.positionPx.top;
                    break;
                case 1:
                    top = tile.positionPx.top + tile.positionPx.height;
                    break;
                default:
                    top = tile.positionPx.top;
                }
                
                adjacentTile.display(left, top, right, bottom);
            },
            
            /**
             * Ensures the region is filled with content.  Invoked after the viewport has been scrolled.
             *
             * @param {Boolean} fromBottom flag indicating whether filling should start from the bottom (true) or top (false)
             */
            fill: function(fromBottom) {
                // Find top/bottommost tile.
                var tile = this._findVerticalEdgeTile(fromBottom),
                    adjacentTile;

                // Move left, displaying tiles until left edge tile is reached.
                while (!tile.isEdgeLeft()) {
                    adjacentTile = this.getTile(tile.tileIndex.column - 1, tile.tileIndex.row);
                    this.positionTileAdjacent(tile, adjacentTile, Extras.Sync.DataGrid.LEFT);
                    tile = adjacentTile;
                }
                    
                var leftEdgeTile = tile;
                
                if (leftEdgeTile == null) {
                    //FIXME impl.
                    alert("FIXME...can't find left edge tile, scenario not handled yet.");
                } else {
                    do {
                        // Move right.
                        tile = leftEdgeTile;
                        while (tile.isOnScreen() && !tile.isEdgeRight()) {
                            adjacentTile = this.getTile(tile.tileIndex.column + 1, tile.tileIndex.row);
                            this.positionTileAdjacent(tile, adjacentTile, Extras.Sync.DataGrid.RIGHT);
                            tile = adjacentTile;
                        }
                        
                        this.synchronizeHeights(leftEdgeTile);

                        // Move down/up.
                        adjacentTile = this.getTile(leftEdgeTile.tileIndex.column, 
                                leftEdgeTile.tileIndex.row + (fromBottom ? -1 : 1));
                        if (adjacentTile == null) {
                            break;
                        }
                        this.positionTileAdjacent(leftEdgeTile, adjacentTile, 
                                fromBottom ? Extras.Sync.DataGrid.UP : Extras.Sync.DataGrid.DOWN);
                        leftEdgeTile = adjacentTile;
                    } while (leftEdgeTile.isOnScreen());
                }
            },
            
            /**
             * Finds the topmost or bottommost tile that is on screen.  The found tile may be anywhere in the row.
             *
             * @param {Boolean} bottom flag indicating whether topmost (false) or bottommost (true) tile should be returned
             */
            _findVerticalEdgeTile: function(bottom) {
                var row, tile, topRowIndex = null, rowIndex;
                for (rowIndex in this._tiles) {
                    if (topRowIndex == null || (bottom ? (rowIndex > topRowIndex) : (rowIndex < topRowIndex))) {
                        row = this._tiles[rowIndex];
                        for (var columnIndex in row) {
                            if (row[columnIndex].isOnScreen()) {
                                tile = row[columnIndex];
                                topRowIndex = rowIndex;
                                break;
                            }
                        }
                    }
                }
                return tile;
            },
            
            getTile: function(columnIndex, rowIndex) {
                if (columnIndex < 0 || rowIndex < 0 || columnIndex > this.size.columns / this.dataGrid.tileSize.columns || 
                        rowIndex > this.size.rows / this.dataGrid.tileSize.rows) {
                    return null;
                }
                var cachedRow = this._tiles[rowIndex];
                if (!cachedRow) {
                    cachedRow = { };
                    this._tiles[rowIndex] = cachedRow;
                }

                var tile = cachedRow[columnIndex];
                if (!tile) {
                    tile = new Extras.Sync.DataGrid.Tile(this.dataGrid, this, columnIndex, rowIndex);
                    cachedRow[columnIndex] = tile;
                }
                return tile;
            },
            
            getBorderTilesX: function() {
                if (this.location.h !== 0 || this.location.v !== 0) {
                    throw new Error("Cannot invoke getPositionV on tile other than center.");
                }
                
                var leftTile, rightTile;
                
                for (var rowIndex in this._tiles) {
                    var row = this._tiles[rowIndex];
                    for (var columnIndex in row) {
                        var tile = row[columnIndex];
                        if (tile.displayed && tile.isOnScreen()) {
                            if (tile.positionPx.left <= 0) {
                                leftTile = tile;
                            }
                            if (tile.positionPx.left + tile.positionPx.width > this.bounds.width) {
                                rightTile = tile;
                            }
                            break;
                        }
                    }
                    if (leftTile && rightTile) {
                        break;
                    }
                }
                
                return {
                    left: leftTile, right: rightTile
                };
            },
            
            getBorderTilesY: function() {
                if (this.location.h !== 0 || this.location.v !== 0) {
                    throw new Error("Cannot invoke getPositionV on tile other than center.");
                }
                
                var topTile, bottomTile, topPx = null, bottomPx = null;
                
                for (var rowIndex in this._tiles) {
                    var row = this._tiles[rowIndex];
                    for (var columnIndex in row) {
                        var tile = row[columnIndex];
                        if (tile.displayed && tile.isOnScreen()) {
                            if (topPx == null || tile.positionPx.top < topPx) {
                                topPx = tile.positionPx.top;
                                if (topPx <= 0) {
                                    topTile = tile;
                                }
                            }
                            var tileBottomPx = this.bounds.height - (tile.positionPx.top + tile.positionPx.height);
                            if (bottomPx == null || tileBottomPx < bottomPx) {
                                bottomPx = tileBottomPx;
                                if (bottomPx <= 0) {
                                    bottomTile = tile;
                                }
                            }
                            break;
                        }
                    }
                    if (topTile && bottomTile) {
                        break;
                    }
                }
                
                return {
                    top: topTile, bottom: bottomTile, topPx: topPx, bottomPx: bottomPx
                };
            },
            
            /**
             * Renders all tiles in the region.  Invocation will clear all existing tiles.
             */
            renderTiles: function() {
                var xFactor, yFactor, originColumn, originRow, tileRowIndex = 0, tileColumnIndex = 0, tile, 
                    xPosition = 0, yPosition = 0;
                   
                // Clear.
                this.clear();
                    
                // Calculate horizontal scroll position, if required.
                if (this.location.h === 0) {
                    if (this.dataGrid.scrollPosition.xScroll != null) {
                        xFactor = this.dataGrid.scrollPosition.xScroll / 100;
                        originColumn = this.dataGrid.scrollSize.columns * xFactor;
                    } else {
                        originColumn = this.dataGrid.scrollPosition.xIndex || 0;
                    }
                    tileColumnIndex = Math.floor(originColumn / this.dataGrid.tileSize.columns);
                }
                
                // Calculate vertical scroll position, if required.
                if (this.location.v === 0) {
                    if (this.dataGrid.scrollPosition.yScroll != null) {
                        yFactor = this.dataGrid.scrollPosition.yScroll / 100;
                        originRow = this.dataGrid.scrollSize.rows * yFactor;
                    } else {
                        originRow = this.dataGrid.scrollPosition.yIndex || 0;
                    }
                    tileRowIndex = Math.floor(originRow / this.dataGrid.tileSize.rows);
                }
                
                // Create origin tile.
                tile = this.getTile(tileColumnIndex, tileRowIndex);
                tile.create();
                
                // Determine horizontal position.
                if (this.location.h === 0) {
                    if (this.dataGrid.scrollPosition.xScroll != null) {
                        xPosition = xFactor * (this.bounds.width - tile.positionPx.width);
                    }
                }

                // Determine vertical position.
                if (this.location.v === 0) {
                    if (this.dataGrid.scrollPosition.yScroll != null) {
                        yPosition = yFactor * (this.bounds.height - tile.positionPx.height);
                    }
                }
                
                // Display origin tile.
                tile.display(xPosition, yPosition); 
                
                // Fill region.
                this.fill(false);
                this.fill(true);
            },
            
            /**
             * Updates the rendered bounds of the region.  The values passed always indicate the pixel bounds of the
             * center region of the DataGrid.
             */
            notifySeparatorUpdate: function() {
                var s = this.dataGrid.separatorPx;
                
                this.bounds = { };
                switch (this.location.h) {
                case -1: 
                    this.element.style.width = s.left + "px"; 
                    this.bounds.width = s.left;
                    break;
                case  0: 
                    this.element.style.left = s.left + "px"; 
                    this.element.style.right = s.right + "px"; 
                    this.bounds.width = this.dataGrid.scrollContainer.bounds.width - s.left - s.right;
                    break;
                case  1: 
                    this.element.style.width = s.right + "px"; 
                    this.bounds.width = s.right;
                    break;
                }
                switch (this.location.v) {
                case -1: 
                    this.element.style.height = s.top + "px"; 
                    this.bounds.height = s.top;
                    break;
                case  0: 
                    this.element.style.top = s.top + "px"; 
                    this.element.style.bottom = s.bottom + "px"; 
                    this.bounds.height = this.dataGrid.scrollContainer.bounds.height - s.top - s.bottom;
                    break;
                case  1: 
                    this.element.style.height = s.bottom + "px"; 
                    this.bounds.height = s.bottom;
                    break;
                }
            },
            
            synchronizeHeights: function(leftEdgeTile) {
                var tile = leftEdgeTile, 
                    tiles = [ leftEdgeTile ],
                    maxHeight, 
                    differentHeights,
                    iRow,
                    iTile;
                    
                while (tile.isOnScreen() && !tile.isEdgeRight()) {
                    tile = this.getTile(tile.tileIndex.column + 1, tile.tileIndex.row);
                    tiles.push(tile);
                }
                tile = null;
                
                for (iRow = 0; iRow < leftEdgeTile.positionPx.rowHeights.length; ++iRow) {
                    maxHeight = leftEdgeTile.positionPx.rowHeights[iRow];
                    differentHeights = false;
                    for (var iTile = 1; iTile < tiles.length; ++iTile) {
                        if (tiles[iTile].positionPx.rowHeights[iRow] != maxHeight) {
                            differentHeights = true;
                            if (tiles[iTile].positionPx.rowHeights[iRow] > maxHeight) {
                                maxHeight = tiles[iTile].positionPx.rowHeights[iRow];
                            }
                        }
                    }
                    if (differentHeights) {
                        for (var iTile = 0; iTile < tiles.length; ++iTile) {
                            tiles[iTile].setRowHeight(iRow, maxHeight);
                        }
                        Core.Debug.consoleWrite("adjust");
                    } else {
                        Core.Debug.consoleWrite("no adjust");
                    }
                }
            }
        })
    },
    
    /**
     * Number of rows per tile.  The last tile may have fewer rows.
     */
    tileSize: {
        columns: 5,
        rows: 3
    },
    
    _fullRenderRequired: null,
    
    /**
     * Root DIV element of rendered component.
     */ 
    _div: null,
    
    measureDiv: null,
    
    /**
     * Current displayed scroll position.
     * @type Extras.Sync.DataGrid.ScrollPosition 
     */
    scrollPosition: null,
    
    /**
     * The displayed visible range of cell indices in the center region.
     * Contains top, left, right, and bottom properties.  Values may be fractional when part of a cell is displayed.
     * Bottom/right values will indicate an index of n + 1 if the entirety of cell n is displayed, 
     * but none of cell n + 1 is displayed.
     */
    visibleRange: null,
    
    /**
     * Amount by which the edges of the top-/left-/right-bottom-most tiles are overscrolling their maximums.
     * Contains top, left, right, and bottom properties as pixels values.
     * This property is used to take corrective action to avoid overscrolling content.
     * Example, a value of 48 for the "top" property indicates that the topmost tile of the center region has been scrolled
     * such that its top edge is 48 pixels below the top edge of the region.  
     */
    overscroll: null,
        
    regions: null,
    
    /**
     * Data model.
     */ 
    _model: null,
    
    /**
     * Separator positions (separating fixed from scrolling content), in pixels.
     * These values are calculated from the widths of the fixed cells.
     * Contains top, left, right, and bottom integer properties.
     * @type Object
     */
    separatorPx: null,

    /**
     * Size of grid in rows and columns.  Contains numeric rows and columns properties.
     */
    size: null,
    
    /**
     * Size of scrolling region of grid in rows and columns.  Contains numeric rows and columns properties.
     */
    scrollSize: null,
    
    /**
     * Combined pixel width of the left and right borders of a cell.
     * @type Number
     */
    _cellBorderWidthPx: null,
    
    /**
     * combined pixel height of the top and bottom borders of a cell.
     * @type Number
     */
    _cellBorderHeightPx: null,
    
    /**
     * Number of fixed cells in left, top, right, and bottom sides of the DataGrid.
     * Contains numeric left, top, right, and bottom properties.
     */
    fixedCells: null,
    
    /**
     * The <code>ScrollContainer</code>.
     * @type Extras.Sync.DataGrid.ScrollContainer
     */
    scrollContainer: null,
    
    $construct: function() {
        this._div = null;
        this.visibleRange = {};
        this.overscroll = {};
        this.scrollPosition = new Extras.Sync.DataGrid.ScrollPosition();
    },
    
    adjustPositionPx: function(px, horizontal) {
        if (horizontal) {
            // Limit adjustment to 1/2 screen width.
            if (Math.abs(px) > this.regions.center.bounds.width / 2) {
                px = this.regions.center.bounds.width / 2 * (px < 0 ? -1 : 1);
            }
        } else {
            // Limit adjustment to 1/2 screen height.
            if (Math.abs(px) > this.regions.center.bounds.height / 2) {
                px = this.regions.center.bounds.height / 2 * (px < 0 ? -1 : 1);
            }
        }
        
        this._adjustRegionPositionPx(px, horizontal);

        if (horizontal) {
            this._updateScrollContainerX();
            this.scrollPosition.setIndex(this.visibleRange.left, null);
            this.scrollPosition.store(this.component);
        } else {
            if (this.overscroll.top && this.overscroll.top > 0) {
                this._adjustRegionPositionPx(0 - this.overscroll.top, horizontal);
            } else if (this.overscroll.bottom && this.overscroll.bottom > 0) {
                this._adjustRegionPositionPx(this.overscroll.bottom, horizontal);
                if (this.overscroll.top && this.overscroll.top > 0) {
                    this._adjustRegionPositionPx(0 - this.overscroll.top, horizontal);
                }
            }
            
            this._updateScrollContainerY();
            this.scrollPosition.setIndex(null, this.visibleRange.top); 
            this.scrollPosition.store(this.component);
        }
    },
    
    _adjustRegionPositionPx: function(px, horizontal) {
        for (var name in this.regions) {
            this.regions[name].adjustPositionPx(px, horizontal);
        }
        if (horizontal) {
            this.updateVisibleRangeX();
        } else {
            this.updateVisibleRangeY();
        }
    },

    /**
     * Creates the <code>regions</code> property, containg 
     * topLeft, top, topRight, left, center, right, bottomLeft, bottom, and bottomRight properties addressing each
     * individual region.
     * Calculates separator positions.
     */
    _createRegions: function() {
        this.regions = { };
    
        // Create top regions.
        if (this.fixedCells.top) {
            if (this.fixedCells.left) {
                this.regions.topLeft = new Extras.Sync.DataGrid.Region(this, "topLeft");
            }
            this.regions.top = new Extras.Sync.DataGrid.Region(this, "top");
            if (this.fixedCells.right) {
                this.regions.topRight = new Extras.Sync.DataGrid.Region(this, "topRight");
            }
        }
        
        // Create top bottom.
        if (this.fixedCells.bottom) {
            if (this.fixedCells.left) {
                this.regions.bottomLeft = new Extras.Sync.DataGrid.Region(this, "bottomLeft");
            }
            this.regions.bottom = new Extras.Sync.DataGrid.Region(this, "bottom");
            if (this.fixedCells.right) {
                this.regions.bottomRight = new Extras.Sync.DataGrid.Region(this, "bottomRight");
            }
        }
        
        // Create center regions.
        if (this.fixedCells.left) {
            this.regions.left = new Extras.Sync.DataGrid.Region(this, "left");
        }
        this.regions.center = new Extras.Sync.DataGrid.Region(this, "center");
        if (this.fixedCells.right) {
            this.regions.right = new Extras.Sync.DataGrid.Region(this, "right");
        }
        
        // Add region elements to scroll container
        for (var name in this.regions) {
            this.scrollContainer.contentElement.appendChild(this.regions[name].element);
        }
        
        // Calculate separator positions.
        this._updateSeparators();
    },
    
    /**
     * Determines the width of the specified column.
     * 
     * @param column the column index
     * @return the pixel width
     * @type Number
     */
    _getColumnWidth: function(column) {
        return 80; //FIXME
    },
    
    /**
     * Creates or retrieves the prototype table, consisting of a TABLE element with a single TBODY as its child.
     * 
     * @return the prototype table
     * @type Element
     */
    getPrototypeTable: function() {
        if (!this._prototypeTable) {
            this._prototypeTable = document.createElement("table");
            this._prototypeTable.cellPadding = this._prototypeTable.cellSpacing = 0;
            this._prototypeTable.style.cssText = "table-layout:fixed;padding:0;border:0px none;";
            var tbody = document.createElement("tbody");
            this._prototypeTable.appendChild(tbody);
        }
        return this._prototypeTable;
    },
    
    /**
     * Determines the height of the specified row.
     * 
     * @param row the row index
     * @return the pixel width
     * @type Number
     */
    _getRowHeight: function(row) {
        return 19; //FIXME, manually set to approximate value until measuring code in place.
    },

    _loadProperties: function() {
        this._cellBorder = this.component.render("cellBorder");
        this._cellBorderHeightPx = Echo.Sync.Border.getPixelSize(this._cellBorder, "top") +
                Echo.Sync.Border.getPixelSize(this._cellBorder, "bottom");
        this._cellBorderWidthPx = Echo.Sync.Border.getPixelSize(this._cellBorder, "left") +
                Echo.Sync.Border.getPixelSize(this._cellBorder, "right");
        this._model = this.component.get("model");
        this.scrollPosition.load(this.component);
        this.fixedCells = {
            left: parseInt(this.component.render("fixedColumnsLeft", 0), 10),
            top: parseInt(this.component.render("fixedRowsTop", 0), 10),
            right: parseInt(this.component.render("fixedColumnsRight", 0), 10),
            bottom: parseInt(this.component.render("fixedRowsBottom", 0), 10)
        };
    },
    
    _processScroll: function(e) {
        if (e.incremental) {
            if (e.verticalIncrement) {
                this._scrollIncremental(e.verticalIncrement, false);
            } else if (e.horizontalIncrement) {
                this._scrollIncremental(e.horizontalIncrement, true);
            }
        } else {
            this.scrollPosition.setScroll(e.horizontal == null ? null : e.horizontal, 
                    e.vertical == null ? null : e.vertical);
            this.scrollPosition.store(this.component);
            
            for (var name in this.regions) {
                if ((e.horizontal && this.regions[name].location.h === 0) ||
                        (e.vertical && this.regions[name].location.v === 0)) {
                    this.regions[name].renderTiles();
                }
            }
            this.scrollContainer.setPosition(this.scrollPosition.xScroll, this.scrollPosition.yScroll);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;";
        this._div.id = this.component.renderId;
        
        this.measureDiv = document.createElement("div");
        this.measureDiv.style.cssText = "position:absolute;top:0;width:1600px;height:1200px;left:-1600px;overflow:hidden;";
        this._div.appendChild(this.measureDiv);
        
        this.scrollContainer = new Extras.Sync.DataGrid.ScrollContainer();
        this.scrollContainer.configure(10, 10);
        this.scrollContainer.onScroll = Core.method(this, this._processScroll);
        this._div.appendChild(this.scrollContainer.rootElement);
        
        this._loadProperties();
        this._fullRenderRequired = true;

        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        this.scrollContainer.renderDisplay();
        
        if (this._fullRenderRequired) {
            if (this._model == null) {
                this.size = { columns: 0, rows: 0 };
                this.scrollSize = { columns: 0, rows: 0 };
            } else {
                this.size = {
                    columns: this._model.getColumnCount(),
                    rows: this._model.getRowCount()
                };
                this.scrollSize = {
                    columns: this.size.columns - this.fixedCells.left - this.fixedCells.right,
                    rows: this.size.rows - this.fixedCells.top - this.fixedCells.bottom
                };
            }
            
            this._createRegions();
            
            if (this._model) {
                this.renderRegionTiles();
            }
            this._fullRenderRequired = false;
        }

        this._updateSeparators();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._cachedTileRows = { };
        this._prototypeTable = null;
        this.regions = null;
        this._div = null;
        this.measureDiv = null;
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    /**
     * Scrolls the viewable area horizontally or vertically by a percentage of the viewable area width/height.
     */
    _scrollIncremental: function(percent, horizontal) {
        var scrollPixels = Math.round((horizontal ? this.scrollContainer.bounds.width : this.scrollContainer.bounds.height) * 
                percent / 10);
        this.adjustPositionPx(0 - scrollPixels, horizontal);
    },
    
    /**
     */
    renderRegionTiles: function() {
        for (var name in this.regions) {
            this.regions[name].renderTiles();
        }
        this.scrollContainer.setPosition(this.scrollPosition.xScroll, this.scrollPosition.yScroll);
    },
    
    /**
     * Updates the horizontal position of the scroll container based on the <code>visibleRange</code> property.
     */
    _updateScrollContainerX: function() {
        var x = 0;
        if (this.visibleRange.left != null && this.visibleRange.right != null) {
            x = 100 * (this.visibleRange.left + this.visibleRange.right) / 2 / this.size.columns;
        } else if (this.visibleRange.left != null) {
            x = 100 * this.visibleRange.left / this.size.columns;
        }
        this.scrollContainer.setPosition(x, null);
    },
    
    /**
     * Updates the vertical position of the scroll container based on the <code>visibleRange</code> property.
     */
    _updateScrollContainerY: function() {
        var y = 0;
        if (this.visibleRange.top != null && this.visibleRange.bottom != null) {
            y = 100 * (this.visibleRange.top + this.visibleRange.bottom) / 2 / this.size.rows;
        } else if (this.visibleRange.top != null) {
            y = 100 * this.visibleRange.top / this.size.rows;
        }
        this.scrollContainer.setPosition(null, y);
    },

    /**
     * Updates the positions of region separators, storing left/top/right/bottom pixel position values in 
     * the <code>separatorPx</code> property.
     * Notifies regions of the update.
     */
    _updateSeparators: function() {
        var i, name;
        this.separatorPx = { left: 0, top: 0, right: 0, bottom: 0 };
        
        if (this.fixedCells.top) {
            for (i = 0; i < this.fixedCells.top; ++i) {
                this.separatorPx.top += this._getRowHeight(i);
            }
        }

        if (this.fixedCells.bottom) {
            for (i = 0; i < this.fixedCells.bottom; ++i) {
                this.separatorPx.bottom += this._getRowHeight(this.size.rows - i - 1);
            }
        }

        if (this.fixedCells.left) {
            for (i = 0; i < this.fixedCells.left; ++i) {
                this.separatorPx.left += this._getColumnWidth(i);
            }
        }
        
        if (this.fixedCells.right) {
            for (i = 0; i < this.fixedCells.right; ++i) {
                this.separatorPx.right += this._getColumnWidth(this.size.columns - i - 1);
            }
        }
        
        for (name in this.regions) {
            this.regions[name].notifySeparatorUpdate();
        }
    },
    
    /**
     * Updates the <code>visibleRange.left</code> and <code>visibleRange.right</code> properties based on the displayed
     * position of the center region.
     */
    updateVisibleRangeX: function() {
        var borderTiles = this.regions.center.getBorderTilesX(), columns;
        
        if (borderTiles.left) {
            columns = borderTiles.left.cellIndex.right - borderTiles.left.cellIndex.left + 1;
            this.visibleRange.left = borderTiles.left.cellIndex.left + 
                    columns * (0 - borderTiles.left.positionPx.left) / borderTiles.left.positionPx.width;
        } else {
            this.visibleRange.left = null;
        }
        
        if (borderTiles.right) {
            columns = borderTiles.right.cellIndex.right - borderTiles.right.cellIndex.left + 1;
            this.visibleRange.right = 1 + borderTiles.right.cellIndex.right - 
                    columns * (borderTiles.right.positionPx.left + borderTiles.right.positionPx.width - 
                    this.regions.center.bounds.width) / borderTiles.right.positionPx.width;
        } else {
            this.visibleRange.right = null;
        }
    },
    
    /**
     * Updates the <code>visibleRange.top</code> and <code>visibleRange.bottom</code> properties based on the displayed
     * position of the center region.
     */
    updateVisibleRangeY: function() {
        var borderTiles = this.regions.center.getBorderTilesY(), rows;
        if (borderTiles.top) {
            rows = borderTiles.top.cellIndex.bottom - borderTiles.top.cellIndex.top + 1;
            this.visibleRange.top = borderTiles.top.cellIndex.top + 
                    rows * (0 - borderTiles.top.positionPx.top) / borderTiles.top.positionPx.height;
            this.overscroll.top = null;
        } else {
            this.visibleRange.top = null;
            this.overscroll.top = borderTiles.topPx;
        }
        
        if (borderTiles.bottom) {
            rows = borderTiles.bottom.cellIndex.bottom - borderTiles.bottom.cellIndex.top + 1;
            this.visibleRange.bottom = 1 + borderTiles.bottom.cellIndex.bottom - 
                    rows * (borderTiles.bottom.positionPx.top + borderTiles.bottom.positionPx.height - 
                    this.regions.center.bounds.height) / borderTiles.bottom.positionPx.height;
            this.overscroll.bottom = null;
        } else {
            this.visibleRange.bottom = null;
            this.overscroll.bottom = borderTiles.bottomPx;
        }
    }
});

/**
 * Renders a scrolling container for the DataGrid, processing scroll events and managing scroll bar positions.
 * Features an "accumulator" so as not to fire events overly frequently, e.g., mousewheel scrolling must stop for a (very) 
 * brief period of time before a scroll event is fired.
 */
Extras.Sync.DataGrid.ScrollContainer = Core.extend({

    _hScrollAccumulator: 0,
    _vScrollAccumulator: 0,
    
    bounds: null,

    rootElement: null,
    contentElement: null,
    _lastScrollSetTime: 0,
    
    size: 5,
    
    /**
     * Horizontal scroll position, a value between 0 and 100.
     * @type Number
     */
    scrollX: 0,

    /**
     * Vertical scroll position, a value between 0 and 100.
     * @type Number
     */
    scrollY: 0,
    
    /**
     * Singleton listener to invoke when scroll position changes.
     * @type Function
     */
    onScroll: null,

    /**
     * Creates a ScrollContainer.  The dispose() method should be invoked when the ScrollContainer will no longer be used.
     *
     * @param horizontal
     * @param vertical
     */
    $construct: function(horizontal, vertical) {
        this.rootElement = document.createElement("div");
        this.rootElement.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;";
        
        this._vScrollContainer = document.createElement("div");
        this._vScrollContainer.style.cssText = "position:absolute;top:0;bottom:0;right:0;overflow:scroll;";
        this._vScrollContainer.style.width = (1 + Core.Web.Measure.SCROLL_WIDTH) + "px";
        this._vScrollContent = document.createElement("div");
        this._vScrollContent.style.cssText = "width:1px;height:" + (this.size * 100) + "%;";
        this._vScrollContainer.appendChild(this._vScrollContent);
        this.rootElement.appendChild(this._vScrollContainer);
        
        this._hScrollContainer = document.createElement("div");
        this._hScrollContainer.style.cssText = "position:absolute;bottom:0;left:0;right:0;overflow:scroll;";
        this._hScrollContainer.style.height = (1 + Core.Web.Measure.SCROLL_HEIGHT) + "px";
        this._hScrollContent = document.createElement("div");
        this._hScrollContent.style.cssText = "height:1px;width:" + (this.size * 100) + "%;";
        this._hScrollContainer.appendChild(this._hScrollContent);
        this.rootElement.appendChild(this._hScrollContainer);
        
        this.contentElement = document.createElement("div");
        this.contentElement.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;background:white;";
        this.rootElement.appendChild(this.contentElement);
        
        Core.Web.Event.add(this._vScrollContainer, "scroll", Core.method(this, this._processScrollV), true);
        Core.Web.Event.add(this._hScrollContainer, "scroll", Core.method(this, this._processScrollH), true);
        Core.Web.Event.add(this.rootElement, Core.Web.Env.BROWSER_MOZILLA ? "DOMMouseScroll" :  "mousewheel",
                Core.method(this, this._processWheel), true);
    },
    
    _accumulatedScroll: function() {
        if (this._vScrollAccumulator || this._hScrollAccumulator) {
            var v = this._vScrollAccumulator;
            this._vScrollAccumulator = 0;
            var h = this._hScrollAccumulator;
            this._hScrollAccumulator = 0;
            if (this.onScroll) {
                // FIXME
                this.onScroll({source: this, type: "scroll", incremental: true, horizontalIncrement: h, verticalIncrement:  v });
            }
        }
    },
    
    configure: function(horizontal, vertical) {
        if (horizontal > 1) {
            this._vScrollContainer.style.bottom = this.contentElement.style.bottom = Core.Web.Measure.SCROLL_HEIGHT + "px";
        } else {
            this._vScrollContainer.style.bottom = this.contentElement.style.bottom = 0;
        }
        if (vertical > 1) {
            this._hScrollContainer.style.right = this.contentElement.style.right = Core.Web.Measure.SCROLL_WIDTH + "px";
        } else {
            this._hScrollContainer.style.right = this.contentElement.style.right = 0;
        }
    },
    
    /**
     * Disposes of the ScrollContainer, releasing any resources in use.
     */
    dispose: function() {
        Core.Web.Event.removeAll(this._hScrollContainer);
        Core.Web.Event.removeAll(this._vScrollContainer);
        Core.Web.Event.removeAll(this.rootElement);
    
        this.rootElement = null;
        this.contentElement = null;
    },
    
    /**
     * Determines if a just-received scroll event is the result of a user adjusting a scroll bar or a result of the
     * scroll bar having been adjusted programmatically.  
     */
    _isUserScroll: function() {
        //FIXME this is not going to work.
        return (new Date().getTime() - this._lastScrollSetTime) > 400; 
    },
    
    /**
     * Process a horizontal scroll bar drag adjustment event.
     *
     * @param e the event
     */
    _processScrollH: function(e) {
        if (!this._isUserScroll()) {
            return;
        }

        this.scrollX = 100 * this._hScrollContainer.scrollLeft / ((this.size - 1) * this.bounds.width);
        
        if (this.onScroll) {
            this.onScroll({source: this, type: "scroll", incremental: false,  horizontal: this.scrollX });
        }
    },
    
    /**
     * Process a vertical scroll bar drag adjustment event.
     *
     * @param e the event
     */
    _processScrollV: function(e) {
        if (!this._isUserScroll()) {
            return;
        }
        
        this.scrollY = 100 * this._vScrollContainer.scrollTop / ((this.size - 1) * this.bounds.height);
        
        if (this.onScroll) {
            this.onScroll({source: this, type: "scroll", incremental: false,  vertical: this.scrollY });
        }
    },
    
    /**
     * Processes a scroll wheel event.
     *
     * @param e the event
     */
    _processWheel: function(e) {
        // Convert scroll wheel direction/distance data into uniform/cross-browser format:
        // A value of 1 indicates one notch scroll down, -1 indicates one notch scroll up.
        var wheelScroll;
        if (e.wheelDelta) {
            wheelScroll = e.wheelDelta / -120;
        } else if (e.detail) {
            wheelScroll = e.detail / 3;
        } else {
            return;
        }
        
        if (e.shiftKey) {
            // Scroll horizontally.
            this._hScrollAccumulator += wheelScroll;
        } else {
            // Scroll vertically.
            this._vScrollAccumulator += wheelScroll;
        }
        Core.Web.Scheduler.run(Core.method(this, this._accumulatedScroll), 10);
        
        // Prevent default scrolling action, or in the case of modifier keys, font adjustments, etc.
        Core.Web.DOM.preventEventDefault(e);
        
        return true;
    },
    
    /**
     * Executes operations which should be performed when the containing component synchronize peer's <code>renderDisplay</code>
     * method is invoked.
     */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.rootElement);
        Core.Web.VirtualPosition.redraw(this.contentElement);
        Core.Web.VirtualPosition.redraw(this._hScrollContainer);
        Core.Web.VirtualPosition.redraw(this._vScrollContainer);
        
        this.bounds = new Core.Web.Measure.Bounds(this.contentElement);
        this._scrollHeight = new Core.Web.Measure.Bounds(this._hScrollContent).height;
        this._scrollWidth = new Core.Web.Measure.Bounds(this._vScrollContent).width;
    },
    
    setPosition: function(scrollX, scrollY) {
        this._lastScrollSetTime = new Date().getTime();
        if (scrollX != null) {
            this.scrollX = scrollX;
            this._hScrollContainer.scrollLeft = this.scrollX / 100 * ((this.size - 1) * this.bounds.width);
        }
        if (scrollY != null) {
            this.scrollY = scrollY;
            this._vScrollContainer.scrollTop = this.scrollY / 100 * ((this.size - 1) * this.bounds.height);
        }
    }
});

