/**
 * Component rendering peer: DataGrid
 *
 * This is an EXPERIMENTAL component, it should not be used at this point for any purpose other than testing it.
 */
Extras.Sync.DataGrid = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.DataGrid", this);
    },
    
    $static: {
                
        LEFT: { h: -1, v: 0 },
        RIGHT: { h: 1, v: 0 },
        UP: { h: 0, v: -1 },
        DOWN: { h: 0, v: 1 },

        INDEX: 0,
        PX: 1,
        PERECNT: 2,

        /**
         * Represenation of a "tile", a sub-table that renders a portion of the DataGrid.
         */
        Tile: Core.extend({
            
            /**
             * The containing DataGrid instance.
             */
            dataGrid: null,
            
            /**
             * The containing Viewport instance.
             */ 
            viewport: null,
            
            /**
             * Flag indicating whether the tile is displayed.
             */
            displayed: false,
            
            /**
             * The div element.
             */
            div: null,
            
            /**
             * The table element.
             */
            _table: null,
            
            /**
             * Edge information object.  Contains boolean properties "top", "right", "left", and "bottom" properties, 
             * indicating whether the tile is at each extreme edge.
             */
            edge: null,
            
            /**
             * Cell index information object.  Contains top, right, left, and bottom properties, indicating the cells contained
             * within the tile.
             */
            cellIndex: null,
            
            /**
             * Tile index information object.  Contains row and column properties indicating the row/column of the tile
             * within the grid of tiles.
             */
            tileIndex: null,

            /**
             * The rendered bounds of the tile.  Contains "top", "left", "width", and "height" properties describing
             * rendered bounds of the tile.  Initialized when the tile is displayed.
             */
            bounds: null,
            
            $construct: function(dataGrid, containerElement, tileColumnIndex, tileRowIndex) {
                this.dataGrid = dataGrid;
                this.containerElement = containerElement;
                this.tileIndex = { column: tileColumnIndex, row: tileRowIndex };
                 
                this.cellIndex = {
                    top: this.tileIndex.row * this.dataGrid.tileSize.rows + this.dataGrid.fixedCells.top,
                    left: this.tileIndex.column * this.dataGrid.tileSize.columns + this.dataGrid.fixedCells.left
                };
                
                this.edge = { 
                    top: this.tileIndex.row === 0,
                    left: this.tileIndex.column === 0
                };
                 
                this.cellIndex.bottom = this.cellIndex.top + this.dataGrid.tileSize.rows - 1;
                if (this.cellIndex.bottom >= this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom - 1) {
                    this.cellIndex.bottom = this.dataGrid.size.rows - this.dataGrid.fixedCells.bottom - 1;
                    this.edge.bottom = true;
                }
                this.cellIndex.right = this.cellIndex.left + this.dataGrid.tileSize.columns - 1;
                if (this.cellIndex.right >= this.dataGrid.size.columns - this.dataGrid.fixedCells.right - 1) {
                    this.cellIndex.right = this.dataGrid.size.columns - this.dataGrid.fixedCells.right - 1;
                    this.edge.right = true;
                }
            },
            
            adjustPosition: function(leftDelta, topDelta) {
                if (this.div) {
                    if (leftDelta) {
                        this.bounds.left += leftDelta;
                        this.div.style.left = this.bounds.left + "px";
                    }
                    if (topDelta) {
                        this.bounds.top += topDelta;
                        this.div.style.top = this.bounds.top + "px";
                    }
                }
                
                if (!this.isOnScreen()) {
                    this.remove();
                }
            },
            
            /**
             * Renders the tile, placing the resultant elements in the instance properites of this object.
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
                        td.appendChild(document.createTextNode(this.dataGrid._model.get(column, row)));
                        tr.appendChild(td);
                    }
                    this._table.firstChild.appendChild(tr);
                }
                
                this.bounds.height = new Core.Web.Measure.Bounds(this.div).height;
                
                this.div.style.width = this.bounds.width + "px";
            },
            
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
            
            dispose: function() {
                this.div = this._table = null;
            },
            
            /**
             * Determines if this tile is currently covering the bottom edge of the screen (pixel 0).
             */ 
            isEdgeBottom: function() {
                return this.edge.bottom || (this.bounds.top < this.dataGrid.scrollContainer.bounds.height && 
                        this.bounds.top + this.bounds.height >= this.dataGrid.scrollContainer.bounds.height);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeLeft: function() {
                return this.edge.left || this.tileIndex.column == 0 || 
                        (this.bounds.left <= 0 && this.bounds.left + this.bounds.width > 0);
            },
            
            /**
             * Determines if this tile is currently covering the left edge of the screen (pixel 0).
             */ 
            isEdgeRight: function() {
                return this.edge.right || (this.bounds.left < this.dataGrid.scrollContainer.bounds.width && 
                        this.bounds.left + this.bounds.width >= this.dataGrid.scrollContainer.bounds.width);
            },
            
            /**
             * Determines if this tile is currently covering the top edge of the screen (pixel 0).
             */ 
            isEdgeTop: function() {
                return this.edge.top || this.tileIndex.row == 0 || 
                        (this.bounds.top <= 0 && this.bounds.top + this.bounds.height > 0);
            },
        
            /**
             * Determines if any portion of this tile is currently on screen.
             */
            isOnScreen: function() {
                if (!this.displayed) {
                    return false;
                }
                var right = this.bounds.left + this.bounds.width;
                var bottom = this.bounds.top + this.bounds.height;
                return this.displayed &&
                        ((this.bounds.left >= 0 && this.bounds.left <= this.dataGrid.scrollContainer.bounds.width) ||
                        (right >= 0 && right <= this.dataGrid.scrollContainer.bounds.width)) &&
                        ((this.bounds.top >= 0 && this.bounds.top <= this.dataGrid.scrollContainer.bounds.height) ||
                        (bottom >= 0 && bottom <= this.dataGrid.scrollContainer.bounds.height));
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
            
            toString: function() {
                return "Tile (" + this.tileIndex.column + "," + this.tileIndex.row + ")";
            }
        }),
        
        Viewport: Core.extend({
        
            dataGrid: null,
            _rows: null,
            
            $construct: function(dataGrid) {
                this.dataGrid = dataGrid;
                this._rows = { };
            },

            /**
             * Adjusts position of tiles within the viewport, additionally filling in any regions that become
             * unoccupied as a result of the adjustment.
             *
             * @param x the number of horizontal pixels
             * @param y the number of vertical pixels
             */
            adjustPosition: function(x, y) {
                var row, tile;
                for (var rowIndex in this._rows) {
                    row = this._rows[rowIndex];
                    for (var columnIndex in row) {
                        tile = row[columnIndex];
                        tile.adjustPosition(x, y);
                    }
                }
                this.fill(y > 0);
            },
            
            /**
             * Clears the viewport of tiles, removing/disposing all tile objects in the process.
             */
            clear: function() {
                for (var rowIndex in this._rows) {
                    row = this._rows[rowIndex];
                    for (var columnIndex in row) {
                        var tile = row[columnIndex];
                        tile.remove();
                        tile.dispose();
                    }
                }
                this._rows = { };
            },
            
            /**
             * Displays a tile immediately adjacent to a tile.
             *
             * @param tile the origin tile
             * @param direction the adjacent direction, one of the following values (defined in Extras.Sync.DataGrid):
             *        <ul>
             *         <li>LEFT</li>
             *         <li>RIGHT</li>
             *         <li>UP</li>
             *         <li>DOWN</li>
             *        </ul>
             * @return the adjacent tile
             */
            displayTileAdjacent: function(tile, direction) {
                if (!tile.displayed) {
                    throw new Error("Tile not displayed, cannot position adjacent tile: " + tile);
                }
                
                var adjacentTile = this.get(tile.tileIndex.column + direction.h, tile.tileIndex.row + direction.v);
                adjacentTile.display(tile.bounds.left + (tile.bounds.width * direction.h), 
                        tile.bounds.top + (tile.bounds.height * direction.v));
                return adjacentTile;
            },
            
            dispose: function() {
                
            },
            
            /**
             * Ensures the viewport is filled with content.  Invoked after the viewport has been scrolled.
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
                    var cursorYPx = 0;
                    do {
                        // Move right.
                        var tile = originTile;
                        while (tile.isOnScreen() && !tile.isEdgeRight()) {
                            tile = this.displayTileAdjacent(tile, Extras.Sync.DataGrid.RIGHT);
                        }
                        
                        // Move down/up.
                        originTile = this.displayTileAdjacent(originTile, fromBottom ? 
                                Extras.Sync.DataGrid.UP : Extras.Sync.DataGrid.DOWN);
                    } while (originTile.isOnScreen());
                }
            },
            
            /**
             * Finds the topmost or bottommost tile that is on screen.  The found tile may be anywhere in the row.
             */
            _findVerticalEdgeTile: function(bottom) {
                var row, tile, topRowIndex = null, rowIndex;
                for (rowIndex in this._rows) {
                    if (topRowIndex == null || (bottom ? (rowIndex > topRowIndex) : (rowIndex < topRowIndex))) {
                        row = this._rows[rowIndex];
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
            
            get: function(columnIndex, rowIndex) {
                if (columnIndex < 0 || rowIndex < 0 ||
                        rowIndex > this.dataGrid.size.rows / this.dataGrid.tileSize.rows ||
                        columnIndex > this.dataGrid.size.columns / this.dataGrid.tileSize.columns) {
                    throw new Error("Invalid tile (" + columnIndex + "," + rowIndex +") is out-of-bounds.");
                }
                var cachedRow = this._rows[rowIndex];
                if (!cachedRow) {
                    cachedRow = { };
                    this._rows[rowIndex] = cachedRow;
                }

                var tile = cachedRow[columnIndex];
                if (!tile) {
                    tile = new Extras.Sync.DataGrid.Tile(this.dataGrid, this.dataGrid._regionElements.center,
                            columnIndex, rowIndex);
                    cachedRow[columnIndex] = tile;
                }
                return tile;
            },
            
            /**
             * Sets the position of the viewport.  Invocation will clear all existing tiles.
             */
            setPosition: function(x, xUnits, y, yUnits) {
                var tileRowIndex, tileColumnIndex, initTileColumnIndex,
                    cursorXPx, cursorYPx, tile;

                this.clear();
                
                switch (xUnits) {
                case Extras.Sync.DataGrid.INDEX:
                    initTileColumnIndex = Math.floor(x / this.dataGrid.tileSize.columns);
                    break;
                default:
                    throw new Error("Invalid yUnits: " + yUnits);
                }
                
                switch (yUnits) {
                case Extras.Sync.DataGrid.INDEX:
                    tileRowIndex = Math.floor(y / this.dataGrid.tileSize.rows);
                    break;
                default:
                    throw new Error("Invalid yUnits: " + yUnits);
                }

                cursorYPx = 0;
                while (cursorYPx < this.dataGrid.scrollContainer.bounds.height) {
                    tileColumnIndex = initTileColumnIndex;
                    cursorXPx = 0;
                    while (cursorXPx < this.dataGrid.scrollContainer.bounds.width) {
                        var tile = this.get(tileColumnIndex, tileRowIndex);
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
     * The row to display at the topmost point of the viewable area.  This value may be have a fractional part,
     * indiacating that only part of the row is visible.
     */
    _displayRowIndex: null,

    /**
     * The column to display at the leftmost point of the viewable area.  This value may be have a fractional part,
     * indiacating that only part of the column is visible.
     */
    _displayColumnIndex: null,
    
    /**
     * The percentile of rows displayed on the viewable area, with 0% representing the topmost set of rows and 100%
     * representing the bottommost set of rows.  This value may have a fractional part.
     */
    _displayRowPercent: null,
    
    /**
     * The percentile of columns displayed on the viewable area, with 0% representing the leftmost set of columns and 100%
     * representing the rightmost set of columns.  This value may have a fractional part.
     */
    _displayColumnPercent: null,
    
    /**
     * Root DIV element of rendered component.
     */ 
    _div: null,
    
    _regionElements: null,
    
    /**
     * Viewport containing rendered tiles.
     */
    _vieport: null,
    
    /**
     * Data model.
     */ 
    _model: null,

    size: null,
    
    fixedCells: null,
    
    fixedCellSizes: null,
    
    /**
     * The ScrollContainer.
     */
    scrollContainer: null,
    
    $construct: function() {
        this._div = null;
        this._viewport = new Extras.Sync.DataGrid.Viewport(this);
        this._displayRowIndex = 0;
        this._displayColumnIndex = 0;
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
            this._prototypeTable.style.cssText = "table-layout:fixed;padding:0;border:0px none;"
            var tbody = document.createElement("tbody");
            this._prototypeTable.appendChild(tbody);
        }
        return this._prototypeTable;
    },
    
    _getRowHeight: function(row) {
        return 20;
    },

    _loadProperties: function() {
        this._cellBorder = this.component.render("cellBorder");
        this._model = this.component.get("model");
        this.fixedCells = {
            left: parseInt(this.component.render("fixedRowsLeft", 0)),
            top: parseInt(this.component.render("fixedRowsTop", 0)),
            right: parseInt(this.component.render("fixedRowsRight", 0)),
            bottom: parseInt(this.component.render("fixedRowsBottom", 0))
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
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;background-color:lime;";
        this._div.id = this.component.renderId;
        
        this.scrollContainer = new Extras.Sync.DataGrid.ScrollContainer();
        this.scrollContainer.configure(10, 10);
        this.scrollContainer.onScroll = Core.method(this, this._processScroll);
        this._div.appendChild(this.scrollContainer.rootElement);
        
        this._loadProperties();
        this._fullRenderRequired = true;
        
        this._renderRegions();

        parentElement.appendChild(this._div);
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        this.scrollContainer.renderDisplay();
        
        if (this._fullRenderRequired) {
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
                var topRowIndex = Math.floor(this._displayRowIndex);
                var leftColumnIndex = Math.floor(this._displayColumnIndex);
                this._viewport.setPosition(this.component.get("columnIndex") || 0, Extras.Sync.DataGrid.INDEX,
                        this.component.get("rowIndex") || 0, Extras.Sync.DataGrid.INDEX);
            }
            this._fullRenderRequired = false;
        }
    },
    
    renderDispose: function(update) {
        this._cachedTileRows = { };
        this._prototypeTable = null;
        this._regionElements = null;
        this._div = null;
    },
    
    _renderRegions: function() {
        this._regionElements = {};
    
        if (this.fixedCells.top) {
            if (this.fixedCells.left) {
                this._regionElements.topLeft = document.createElement("div");
                this._regionElements.topLeft.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;";
            }
            
            this._regionElements.topCenter = document.createElement("div");
            this._regionElements.topCenter.style.cssText = "position:absolute;overflow:hidden;top:0;";

            if (this.fixedCells.right) {
                this._regionElements.topRight = document.createElement("div");
                this._regionElements.topRight.style.cssText = "position:absolute;overflow:hidden;top:0;right:0;";
            }
        }
        
        if (this.fixedCells.left) {
            this._regionElements.left = document.createElement("div");
            this._regionElements.left.style.cssText = "position:absolute;overflow:hidden;left:0;";
        }

        this._regionElements.center = document.createElement("div");
        this._regionElements.center.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;right:0;bottom:0;";

        if (this.fixedCells.right) {
            this._regionElements.right.style.cssText = "position:absolute;overflow:hidden;right:0;";
        }

        if (this.fixedCells.bottom) {
            if (this.fixedCells.left) {
                this._regionElements.bottomLeft = document.createElement("div");
                this._regionElements.bottomLeft.style.cssText = "position:absolute;overflow:hidden;bottom:0;left:0;";
            }
            
            this._regionElements.bottomCenter = document.createElement("div");

            if (this.fixedCells.right) {
                this._regionElements.bottomRight = document.createElement("div");
                this._regionElements.bottomRight.style.cssText = "position:absolute;overflow:hidden;bottom:0;right:0;";
            }
        }
        
        for (var name in this._regionElements) {
            this.scrollContainer.contentElement.appendChild(this._regionElements[name]);
        }
    },
    
    _renderRegionSizes: function() {
    
    },

    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    /**
     * Scrolls the viewable area up or down by a percentage of the viewable area height.
     */
    _scrollIncrementalVertical: function(percent) {
        var scrollPixels = Math.round(this.scrollContainer.bounds.height * percent / 10);
        this._viewport.adjustPosition(0, 0 - scrollPixels);
        
    },
    
    _scrollRowPercentVertical: function(percent) {
        var row = this.size.rows * percent / 100;
    }
});

Extras.Sync.DataGrid.ScrollContainer = Core.extend({

    _scrollBarWidth: 15,
    _scrollBarHeight: 15,
    _vScrollAccumulator: 0,
    
    bounds: null,

    rootElement: null,
    contentElement: null,
    
    onScroll: null,

    $construct: function(horizontal, vertical) {
        this.rootElement = document.createElement("div");
        this.rootElement.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;";
        
        this._vScrollContainer = document.createElement("div");
        this._vScrollContainer.style.cssText = "position:absolute;top:0;bottom:0;right:0;overflow:scroll;";
        this._vScrollContainer.style.width = (1 + this._scrollBarWidth) + "px";
        this._vScrollContent = document.createElement("div");
        this._vScrollContent.style.cssText = "width:1px;height:500%;";
        this._vScrollContainer.appendChild(this._vScrollContent);
        this.rootElement.appendChild(this._vScrollContainer);
        
        this._hScrollContainer = document.createElement("div");
        this._hScrollContainer.style.cssText = "position:absolute;;bottom:0;left:0;right:0;overflow:scroll;";
        this._hScrollContainer.style.height = (1 + this._scrollBarHeight) + "px";
        this._hScrollContent = document.createElement("div");
        this._hScrollContent.style.cssText = "height:1px;width:500%;";
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
        if (this._vScrollAccumulator) {
            var scrollAmount = this._vScrollAccumulator;
            this._vScrollAccumulator = 0;
            if (this.onScroll) {
                // FIXME
                this.onScroll({source: this, type: "scroll", verticalIncrement:  scrollAmount });
            }
        }
    },
    
    configure: function(horizontal, vertical) {
        if (horizontal > 1) {
            this._vScrollContainer.style.bottom = this.contentElement.style.bottom = this._scrollBarHeight + "px";
        } else {
            this._vScrollContainer.style.bottom = this.contentElement.style.bottom = 0;
        }
        if (vertical > 1) {
            this._hScrollContainer.style.right = this.contentElement.style.right = this._scrollBarWidth + "px";
        } else {
            this._hScrollContainer.style.right = this.contentElement.style.right = 0;
        }
    },
    
    dispose: function() {
        Core.Web.Event.removeAll(this._hScrollContainer);
        Core.Web.Event.removeAll(this._vScrollContainer);
        Core.Web.Event.removeAll(this.rootElement);
    
        this.rootElement = null;
        this.contentElement = null;
    },
    
    _processScrollH: function(e) {
//        Core.Debug.consoleWrite("hscroll:" + this._hScrollContainer.scrollLeft);
        if (this.onScroll) {
        }
    },
    
    _processScrollV: function(e) {
//        Core.Debug.consoleWrite("vscroll:" + this._vScrollContainer.scrollTop);
        if (this.onScroll) {
        }
    },
    
    _processWheel: function(e) {
        var wheelScroll;
        
        if (e.wheelDelta) {
            wheelScroll = e.wheelDelta / -120;
        } else if (e.detail) {
            wheelScroll = e.detail / 3;
        } else {
            return;
        }
        
        this._vScrollContainer.scrollTop += wheelScroll * 90;
        this._vScrollAccumulator += wheelScroll;
        Core.Web.Scheduler.run(Core.method(this, this._accumulatedScroll), 10);
        
        return true;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.rootElement);
        Core.Web.VirtualPosition.redraw(this.contentElement);
        Core.Web.VirtualPosition.redraw(this._hScrollContainer);
        Core.Web.VirtualPosition.redraw(this._vScrollContainer);
        
        this.bounds = new Core.Web.Measure.Bounds(this.contentElement);
    }
});
