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
             * The rendered bounds of the tile.  Contains "top", "left", "width", and "height" properties describing
             * rendered bounds of the tile.  Initialized when the tile is displayed.
             */
            bounds: null,
            
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
                    this.cellIndex.left = this.dataGrid.size.columns - this.dataGrid.fixedCells.right - 
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
                    this.cellIndex.top = this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom - 
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
             * Has no effect in directions in which the cell is fixed (per region location property).
             *
             * @param {Number} h the number of pixels to adjust the tile horizontally
             * @param {Number} v the number of pixels to adjust the tile vertically
             */
            adjustPositionPx: function(h, v) {
                if (this.div) {
                    if (h && !this.region.location.h) {
                        this.bounds.left += h;
                        this.div.style.left = this.bounds.left + "px";
                    }
                    if (v && !this.region.location.v) {
                        this.bounds.top += v;
                        this.div.style.top = this.bounds.top + "px";
                    }
                }
                
                if (!this.isOnScreen()) {
                    this.remove();
                }
            },
            
            /**
             * Renders the tile.  Sets the div and _table element properties, measures rendered tile and sets
             * bounds property.
             */
            create: function() {
                var tr, td, row, column;

                var columnWidths = [];
                
                this.bounds = { };
                
                this.bounds.width = 0;
                for (column = this.cellIndex.left; column <= this.cellIndex.right; ++column) {
                    this.bounds.width += columnWidths[column] = this.dataGrid._getColumnWidth(column);
                }

                this.div = document.createElement("div");
                this.div.style.cssText = "position:absolute;";

                this._table = this.dataGrid.getPrototypeTable().cloneNode(true);
                this._table.style.width = this.bounds.width + "px";

                this.div.appendChild(this._table);

                for (row = this.cellIndex.top; row <= this.cellIndex.bottom; ++row) {
                    tr = document.createElement("tr");
                    for (column = this.cellIndex.left; column <= this.cellIndex.right; ++column) {
                        td = document.createElement("td");
                        td.style.padding = 0;
                        Echo.Sync.Border.render(this.dataGrid._cellBorder, td);
                        if (row === this.cellIndex.top) {
                            td.style.width = columnWidths[column] + "px";
                        }
                        var value = this.dataGrid._model.get(column, row);
                        if (value == null) {
                            // FIXME Temporary fix for zero-height cells causing rendering to take forever.
                            // Remove when bounding is working properly.
                            value = "\u00a0";
                        }
                        td.appendChild(document.createTextNode(value));
                        tr.appendChild(td);
                    }
                    this._table.firstChild.appendChild(tr);
                }
                
                this.bounds.height = new Core.Web.Measure.Bounds(this.div).height;
                
                this.div.style.width = this.bounds.width + "px";
            },
            
            /**
             * Displays the tile at the specified coordinates.
             * Does nothing if the tile is already displayed.
             *
             * @param {Number} left the left pixel coordinate of the tile within the region
             * @param {Number} top the top pixel coordinate of the tile within the region
             */
            display: function(left, top) {
                if (this.displayed) {
                    return;
                }
                if (!this.div) {
                    this.create();
                }
                this.bounds.top = top;
                this.bounds.left = left;
                this.div.style.top = top + "px";
                this.div.style.left = left + "px";
                
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
                return this.edge.bottom || (this.bounds.top < this.region.bounds.height && 
                        this.bounds.top + this.bounds.height >= this.region.bounds.height);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeLeft: function() {
                return this.edge.left || this.tileIndex.column === 0 || 
                        (this.bounds.left <= 0 && this.bounds.left + this.bounds.width > 0);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeRight: function() {
                return this.edge.right || (this.bounds.left < this.region.bounds.width && 
                        this.bounds.left + this.bounds.width >= this.region.bounds.width);
            },
            
            /**
             * Determines if this tile is currently covering the top edge of the screen (pixel 0).
             */ 
            isEdgeTop: function() {
                return this.edge.top || this.tileIndex.row === 0 || 
                        (this.bounds.top <= 0 && this.bounds.top + this.bounds.height > 0);
            },
        
            /**
             * Determines if any portion of this tile is currently on screen.
             */
            isOnScreen: function() {
                if (!this.displayed) {
                    return false;
                }
                return Extras.Sync.DataGrid.intersect(this.bounds.left, this.bounds.left + this.bounds.width,
                        0, this.region.bounds.width) &&
                        Extras.Sync.DataGrid.intersect(this.bounds.top, this.bounds.top + this.bounds.height,
                        0, this.region.bounds.height);
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
             */
            _tiles: null,
            
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
                this.dataGrid = dataGrid;
                this.name = name;
                this._tiles = { };
                this.location = Extras.Sync.DataGrid.REGION_LOCATIONS[name];

                this.element = document.createElement("div");
                this.element.style.cssText = "position:absolute;overflow:hidden;";
                
                if (this.location.h === -1) {
                    this.element.style.left = 0;
                } else if (this.location.h === 1) {
                    this.element.style.right = 0;
                }
                if (this.location.v === -1) {
                    this.element.style.top = 0;
                } else if (this.location.h === 1) {
                    this.element.style.bottom = 0;
                }
            },

            /**
             * Adjusts the positions of tiles within the region, additionally filling in any areas that become
             * unoccupied as a result of the adjustment.
             *
             * @param {Number} x the number of horizontal pixels to shift the tiles (positive values indicate to the right)
             * @param {Number} y the number of vertical pixels to shift the tiles (positive values indicate downward)
             */
            adjustPositionPx: function(x, y) {
                if (this.location.h && this.location.y) {
                    // This operation has no effect on corner tiles.
                    return;
                }
            
                x = this.location.h ? 0 : x;
                y = this.location.v ? 0 : y;
                var row, tile;
                for (var rowIndex in this._tiles) {
                    row = this._tiles[rowIndex];
                    for (var columnIndex in row) {
                        tile = row[columnIndex];
                        tile.adjustPositionPx(x, y);
                    }
                }
                this.fill(y > 0);
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
             * Displays a tile immediately adjacent to a tile.
             *
             * @param {Echo.Sync.DataGrid.Tile} tile the origin tile
             * @param direction the adjacent direction, one of the following values (defined in Extras.Sync.DataGrid):
             *        <ul>
             *         <li><code>LEFT</code></li>
             *         <li><code>RIGHT</code></li>
             *         <li><code>UP</code></li>
             *         <li><code>DOWN</code></li>
             *        </ul>
             * @return the adjacent tile
             * @type Echo.Sync.DataGrid.Tile
             */
            displayTileAdjacent: function(tile, direction) {
                if (!tile.displayed) {
                    throw new Error("Tile not displayed, cannot position adjacent tile: " + tile);
                }
                
                var adjacentTile = this.getTile(tile.tileIndex.column + direction.h, tile.tileIndex.row + direction.v);
                if (adjacentTile == null) {
                    return null;
                }
                adjacentTile.display(tile.bounds.left + (tile.bounds.width * direction.h), 
                        tile.bounds.top + (tile.bounds.height * direction.v));
                return adjacentTile;
            },
            
            /**
             * Ensures the region is filled with content.  Invoked after the viewport has been scrolled.
             *
             * @param {Boolean} fromBottom flag indicating whether filling should start from the bottom (true) or top (false)
             */
            fill: function(fromBottom) {
                // Find top/bottommost tile.
                var originTile = this._findVerticalEdgeTile(fromBottom);

                // Move left, displaying tiles until left edge tile is reached.
                while (!originTile.isEdgeLeft()) {
                    originTile = this.displayTileAdjacent(originTile, Extras.Sync.DataGrid.LEFT);
                }
                
                if (originTile == null) {
                    //FIXME impl.
                    alert("FIXME...can't find origin tile, scenario not handled yet.");
                } else {
                    do {
                        // Move right.
                        var tile = originTile;
                        while (tile.isOnScreen() && !tile.isEdgeRight()) {
                            tile = this.displayTileAdjacent(tile, Extras.Sync.DataGrid.RIGHT);
                        }
                        
                        // Move down/up.
                        originTile = this.displayTileAdjacent(originTile, fromBottom ? 
                                Extras.Sync.DataGrid.UP : Extras.Sync.DataGrid.DOWN);
                    } while (originTile != null && originTile.isOnScreen());
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
                if (columnIndex < 0 || rowIndex < 0 ||
                        rowIndex > this.dataGrid.size.rows / this.dataGrid.tileSize.rows ||
                        columnIndex > this.dataGrid.size.columns / this.dataGrid.tileSize.columns) {
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

            /**
             * Sets the position of the region.  Invocation will clear all existing tiles.
             *
             * @param {Number} x the horizontal position of the region
             * @param {Number} y the vertical position of the region
             */
            setPosition: function(x, y) {
                var tileRowIndex, tileColumnIndex, initTileColumnIndex,
                    cursorXPx, cursorYPx, tile;

                this.clear();
                
                initTileColumnIndex = Math.floor(x / this.dataGrid.tileSize.columns);
                tileRowIndex = Math.floor(y / this.dataGrid.tileSize.rows);

                cursorYPx = 0;
                while (cursorYPx < this.bounds.height) {
                    tileColumnIndex = initTileColumnIndex;
                    cursorXPx = 0;
                    while (cursorXPx < this.bounds.width) {
                        tile = this.getTile(tileColumnIndex, tileRowIndex);
                        tile.display(cursorXPx, cursorYPx);
                        if (tile.isEdgeRight()) {
                            break;
                        }
                        cursorXPx += tile.bounds.width;
                        ++tileColumnIndex;
                    }
                    if (tile.isEdgeBottom()) {
                        break;
                    }
                    cursorYPx += tile.bounds.height;
                    ++tileRowIndex;
                }
            },
            
            /**
             * Updates the rendered bounds of the region.  The values passed always indicate the pixel bounds of the
             * center region of the DataGrid.
             *
             * @param {Number} left the offset from the left edge of the DataGrid to the left edge of the center region
             * @param {Number} top the offset from the top edge of the DataGrid to the top edge of the center region
             * @param {Number} right the offset from the right edge of the DataGrid to the right edge of the center region
             * @param {Number} bottom the offset from the bottom edge of the DataGrid to the bottom edge of the center region
             */
            updateBounds: function(left, top, right, bottom) {
                this.bounds = { };
                switch (this.location.h) {
                case -1: 
                    this.element.style.width = left + "px"; 
                    this.bounds.width = left;
                    break;
                case  0: 
                    this.element.style.left = left + "px"; 
                    this.element.style.right = right + "px"; 
                    this.bounds.width = this.dataGrid.scrollContainer.bounds.width - left - right;
                    break;
                case  1: 
                    this.element.style.width = right + "px"; 
                    this.bounds.width = right;
                    break;
                }
                switch (this.location.v) {
                case -1: 
                    this.element.style.height = top + "px"; 
                    this.bounds.height = top;
                    break;
                case  0: 
                    this.element.style.top = top + "px"; 
                    this.element.style.bottom = bottom + "px"; 
                    this.bounds.height = this.dataGrid.scrollContainer.bounds.height - top - bottom;
                    break;
                case  1: 
                    this.element.style.height = bottom + "px"; 
                    this.bounds.height = bottom;
                    break;
                }
            }
        })
    },
    
    /**
     * Number of rows per tile.  The last tile may have fewer rows.
     */
    tileSize: {
        columns: 12,
        rows: 6
    },
    
    _fullRenderRequired: null,
    
    /**
     * Root DIV element of rendered component.
     */ 
    _div: null,
    
    /**
     * Current displayed index position.  Contains x and y numeric properties.
     */
    position: null,
    
    regions: null,
    
    /**
     * Data model.
     */ 
    _model: null,

    /**
     * Size of grid in rows and columns.  Contains numeric rows and columns properties.
     */
    size: null,
    
    /**
     * Number of fixed cells in left, top, right, and bottom sides of the DataGrid.
     * Contains numeric left, top, right, and bottom properties.
     */
    fixedCells: null,
    
    fixedCellSizes: null,
    
    /**
     * The ScrollContainer.
     */
    scrollContainer: null,
    
    $construct: function() {
        this._div = null;
        this.position = { x: 0, y: 0 };
    },
    
    _adjustIndexByPx: function(px, horizontal) {
        if (px === 0) {
            return;
        }
        
        var index = horizontal ? this.position.x : this.position.y,
            dist = Math.abs(px),
            inc = px < 0 ? 1 : -1,
            value = 0,
            getSize = horizontal ? this._getColumnWidth : this._getRowHeight;
           
Core.Debug.consoleWrite("px=" + px);        
        while (value < dist) {
            var size = getSize(index);
            if (value + size > dist) {
Core.Debug.consoleWrite("dist-value = " + (dist - value)); 
                index += inc * ((dist - value) / size); 
                value = dist;
            } else {
                value += size;
                index += inc;
            }
        }
        
        if (horizontal) {
            this.position.x = index;
        } else {
            this.position.y = index;
        }

Core.Debug.consoleWrite("Position: " + Core.Debug.toString(this.position));
    },
    
    adjustPositionPx: function(xPx, yPx) {
        // FIXME Temporary bounds restrictions.
        if (this.position.x < 0 && xPx > 0) {
            xPx = 0;
        }
        if (this.position.y < 0 && yPx > 0) {
            yPx = 0;
        }
        
        this._adjustIndexByPx(xPx, true);
        this._adjustIndexByPx(yPx, false);
        
        Core.Debug.consoleWrite(Core.Debug.toString(this.position));
        
        for (var name in this.regions) {
            this.regions[name].adjustPositionPx(xPx, yPx);
        }
        
        this.scrollContainer.setPosition(this.position.x / this.size.columns, this.position.y / this.size.rows);
        
        Core.Debug.consoleWrite("ScrollPos: " + (this.position.y / this.size.rows));
    },

    _createRegions: function() {
        this.regions = { };
    
        if (this.fixedCells.top) {
            if (this.fixedCells.left) {
                this.regions.topLeft = new Extras.Sync.DataGrid.Region(this, "topLeft");
            }
            this.regions.top = new Extras.Sync.DataGrid.Region(this, "top");
            if (this.fixedCells.right) {
                this.regions.topRight = new Extras.Sync.DataGrid.Region(this, "topRight");
            }
        }
        
        if (this.fixedCells.bottom) {
            if (this.fixedCells.left) {
                this.regions.bottomLeft = new Extras.Sync.DataGrid.Region(this, "bottomLeft");
            }
            this.regions.bottom = new Extras.Sync.DataGrid.Region(this, "bottom");
            if (this.fixedCells.right) {
                this.regions.bottomRight = new Extras.Sync.DataGrid.Region(this, "bottomRight");
            }
        }
        
        if (this.fixedCells.left) {
            this.regions.left = new Extras.Sync.DataGrid.Region(this, "left");
        }

        this.regions.center = new Extras.Sync.DataGrid.Region(this, "center");

        if (this.fixedCells.right) {
            this.regions.right = new Extras.Sync.DataGrid.Region(this, "right");
        }
        
        for (var name in this.regions) {
            this.scrollContainer.contentElement.appendChild(this.regions[name].element);
        }
        
        this._updateRegionBounds();
    },
    
    _getCellBorderHeight: function(column, row) {
        return 2;
    },
    
    _getCellBorderWidth: function(column, row) {
        return 2;
    },
    
    _getColumnWidth: function(column) {
        return 80;
    },
    
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
    
    _getRowHeight: function(row) {
        return 17; //FIXME
    },

    _loadProperties: function() {
        this._cellBorder = this.component.render("cellBorder");
        this._model = this.component.get("model");
        this.fixedCells = {
            left: parseInt(this.component.render("fixedColumnsLeft", 0), 10),
            top: parseInt(this.component.render("fixedRowsTop", 0), 10),
            right: parseInt(this.component.render("fixedColumnsRight", 0), 10),
            bottom: parseInt(this.component.render("fixedRowsBottom", 0), 10)
        };

        // FIXME temporary
        this.fixedCellSizes = { 
            left: this.fixedCells.left * this._getColumnWidth(),
            top: this.fixedCells.top * this._getRowHeight(),
            right: this.fixedCells.right * this._getColumnWidth(),
            bottom: this.fixedCells.bottom * this._getRowHeight()
        };
    },
    
    _processScroll: function(e) {
        if (e.verticalIncrement) {
            this._scrollIncrementalVertical(e.verticalIncrement);
        }
        if (e.horizontalIncrement) {
            this._scrollIncrementalHorizontal(e.horizontalIncrement);
        }
        Core.Debug.consoleWrite(this.y);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;";
        this._div.id = this.component.renderId;
        
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
        
            this._createRegions();

            if (this._model == null) {
                this.size = {
                    columns: 0,
                    rows: 0
                };
            } else {
                this.size = {
                    columns: this._model.getColumnCount(),
                    rows: this._model.getRowCount()
                };
                var topRowIndex = Math.floor(this.position.y);
                var leftColumnIndex = Math.floor(this.position.x);
                this.setPosition(this.component.get("columnIndex") || 0, this.component.get("rowIndex") || 0);
            }
            this._fullRenderRequired = false;
        }

        this._updateRegionBounds();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._cachedTileRows = { };
        this._prototypeTable = null;
        this.regions = null;
        this._div = null;
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
     * Scrolls the viewable area left or right by a percentage of the viewable area width.
     */
    _scrollIncrementalHorizontal: function(percent) {
        var scrollPixels = Math.round(this.scrollContainer.bounds.width * percent / 10);
        this.adjustPositionPx(0 - scrollPixels, 0);
        
    },
    
    /**
     * Scrolls the viewable area up or down by a percentage of the viewable area height.
     */
    _scrollIncrementalVertical: function(percent) {
        var scrollPixels = Math.round(this.scrollContainer.bounds.height * percent / 10);
        this.adjustPositionPx(0, 0 - scrollPixels);
        
    },
    
    _scrollRowPercentVertical: function(percent) {
        var row = this.size.rows * percent / 100;
    },
    
    /**
     * Sets the position of the viewport.  Invocation will clear all existing tiles.
     */
    setPosition: function(x, y) {
        for (var name in this.regions) {
            this.regions[name].setPosition(x, y);
        }
    },

    _updateRegionBounds: function() {
        var i, name, left = 0, top = 0, right = 0, bottom = 0;
        
        if (this.fixedCells.top) {
            for (i = 0; i < this.fixedCells.top; ++i) {
                top += this._getRowHeight(i);
            }
        }

        if (this.fixedCells.bottom) {
            for (i = 0; i < this.fixedCells.bottom; ++i) {
                bottom += this._getRowHeight(this.size.rows - i - 1);
            }
        }

        if (this.fixedCells.left) {
            for (i = 0; i < this.fixedCells.left; ++i) {
                left += this._getColumnWidth(i);
            }
        }
        
        if (this.fixedCells.right) {
            for (i = 0; i < this.fixedCells.right; ++i) {
                right += this._getColumnWidth(this.size.columns - i - 1);
            }
        }
        
        for (name in this.regions) {
            this.regions[name].updateBounds(left, top, right, bottom);
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
     * Horizontal scroll position, a value between 0 and 1.
     * @type Number
     */
    scrollX: 0,

    /**
     * Vertical scroll position, a value between 0 and 1.
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
        this._hScrollContainer.style.cssText = "position:absolute;;bottom:0;left:0;right:0;overflow:scroll;";
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
                this.onScroll({source: this, type: "scroll", horizontalIncrement: h, verticalIncrement:  v });
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
        return (new Date().getTime() - this._lastScrollSetTime) > 100; 
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

        this.scrollX = this._hScrollContainer.scrollLeft / ((this.size - 1) * this.bounds.width);
        
        //FIXME Implement
        Core.Debug.consoleWrite("hscroll:" + this.scrollX);
        if (this.onScroll) {
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
        
        this.scrollY = this._vScrollContainer.scrollTop / ((this.size - 1) * this.bounds.height);
        
        Core.Debug.consoleWrite("vscroll:" + this.scrollY);
        //FIXME Implement
        if (this.onScroll) {
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
        Core.Debug.consoleWrite(this.bounds);
    },
    
    setPosition: function(scrollX, scrollY) {
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        
        this._hScrollContainer.scrollLeft = this.scrollX * ((this.size - 1) * this.bounds.width);
        this._vScrollContainer.scrollTop = this.scrollY * ((this.size - 1) * this.bounds.height);
    }
});
