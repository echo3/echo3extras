Extras.Sync.FlowViewer = Core.extend(Echo.Render.ComponentSync, { 
    
    $static: {
        DOUBLE_CLICK_TIME: 500
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.FlowViewer", this);
    },

    /**
     * The desired first displayed row position.  This value is not a row index, but a possibly fractional value
     * denoting the row position at the very top of the viewing area.  For example, if half of the second
     * row were visible at the top, then _position would be 1.5. 
     */
    _position: 0,

    /**
     * The currently rendered first displayed row position.
     */
    _renderedPosition: 0,
    
    _columnsRendered: false,

    $construct: function() {
        this._updateListenerRef = Core.method(this, this._updateListener);
    },
    
    _clearContent: function() {
        this._columnsRendered = false;
        while (this._flowDiv.firstChild) {
            this._flowDiv.removeChild(this._flowDiv.firstChild);
        }
    },

    _createProtoCell: function() {
        this._protoCell = document.createElement("div");
        this._protoCell.style.cssText = "overflow:hidden;";
        this._protoCell.style.height = this._cellSize.height + "px";
        this._protoCell.style.width = this._cellSize.width + "px";
    },
    
    _getIndexFromNode: function(node) {
        var x, y;
        var testNode;
        var columnContentDiv;
        var columnDiv;
        
        // Find containing column content div.
        testNode = node;
        while (testNode && testNode.parentNode !== this._flowDiv) {
            testNode = testNode.parentNode;
        }
        if (!testNode) {
            return -1;
        }
        columnDiv = testNode;
        
        // Determine containing column index.
        x = 0;
        testNode = columnDiv.parentNode.firstChild;
        while (testNode) {
            if (testNode == columnDiv) {
                break;
            }
            ++x;
            testNode = testNode.nextSibling;
        }
        if (!testNode) {
            return -1;
        }
        
        // Move node reference to  child of column content div. 
        columnContentDiv = columnDiv.firstChild;
        while (node && node.parentNode !== columnContentDiv) {
            node = node.parentNode;
        }
        if (!node) {
            return -1;
        }
        
        testNode = columnContentDiv.firstChild;
        y = 0;
        while (testNode) {
            if (testNode === node) {
                var index = (y + this._renderedStartRow) * this._columnCount + x;
                return index < this._model.size() ? index : -1;
            }
            testNode = testNode.nextSibling;
            ++y; 
        }

        return -1;
    },
    
    _processClick: function(e, contextClick) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }

        var index = this._getIndexFromNode(e.target);
        if (index === -1) {
            return;
        }
        
        var time = new Date().getTime();
        if (!contextClick && this._lastClickIndex == index && 
                time - this._lastClickTime < Extras.Sync.FlowViewer.DOUBLE_CLICK_TIME) {
            this._processDoubleClick(e);
            return;
        }
        
        this._lastClickIndex = index;
        this._lastClickTime = new Date().getTime();

        if (e.ctrlKey || e.metaKey || e.altKey) {
            var selection = this.component.get("selection") || {};
            if (!contextClick && selection[index]) {
                delete selection[index];
            } else {
                selection[index] = true;
            }
            this.component.set("selection", null, true);
            this.component.set("selection", selection, true);
            this._setHighlight(index, true);
        } else {
            var oldSelection = this.component.get("selection") || {};

            selection = { };
            selection[index] = true;
            this.component.set("selection", selection, true);
            
            for (var selectedIndex in oldSelection) {
                if (selectedIndex !== index) {
                    this._setHighlight(selectedIndex, false);
                }
            }
            
            this._setHighlight(index, true);
        }
    },
    
    _processContextMenu: function(e) {
        this._processClick(e, true);
        return true;
    },
    
    _processDoubleClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }

        var index = this._getIndexFromNode(e.target);
        if (index !== -1) {
            this.component.doAction(index);
        }
    },
    
    _processScroll: function(e) {
        this._setPosition(e.row);
    },
    
    renderAdd: function(update, parentElement) {
        this._columnsRendered = false;
        
        this._model = this.component.get("model") || new Extras.Viewer.NullModel();
        this._model.addUpdateListener(this._updateListenerRef);

        this._renderer = this.component.get("renderer") || new Extras.Sync.FlowViewer.NullRenderer();
        var cellSize = this._renderer.getCellSize();
        this._cellSize = { width: cellSize.width || 100, height: cellSize.height || 100 }; 

        this._createProtoCell();

        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;";

        this._scrollContainer = new Extras.Sync.Viewer.ScrollContainer(this.client, this.component, this._model.size(), 
                this._cellSize.height);
        this._scrollContainer.onScroll = Core.method(this, this._processScroll);
        this._div.appendChild(this._scrollContainer.rootElement);
        
        this._flowDiv = document.createElement("div");
        this._flowDiv.style.cssText = "position:absolute;left:0;top:0;bottom:0;right:0;cursor:pointer;";
        Echo.Sync.Color.renderFB(this.component, this._flowDiv);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._flowDiv);
        this._scrollContainer.contentElement.appendChild(this._flowDiv);
        
        parentElement.appendChild(this._div);
        
        Core.Web.Event.add(this._div, "contextmenu", Core.method(this, this._processContextMenu), false);
        Core.Web.Event.add(this._div, "mouseup", Core.method(this, this._processClick), false);
        Core.Web.Event.Selection.disable(this._div);
    },
    
    _renderCellsFull: function() {
        var x, y, contentDiv, cellDiv, cellDivs, index, columnContentDiv,
            size = this._model.size();
        var selection = this.component.get("selection") || {};
        
        this._renderedPosition = this._position;
        this._renderedStartRow = Math.floor(this._position);
        this._renderedEndRow = Math.min(this._rowCount, 
                Math.ceil(1 + this._renderedStartRow + this._flowBounds.height / this._cellSize.height));
               
        var topPosition = 0 - Math.floor((this._position - Math.floor(this._position)) * this._cellSize.height);
        
        contentDiv = document.createElement("div");
        for (y = this._renderedStartRow; y < this._renderedEndRow; ++y) {
            cellDiv = this._protoCell.cloneNode(false);
            contentDiv.appendChild(cellDiv);
        }

        cellDivs = [];
        for (x = 0; x < this._columnDivs.length; ++x) {
            columnContentDiv = contentDiv.cloneNode(true);
            cellDivs.push(columnContentDiv.firstChild);
            this._columnDivs[x].appendChild(columnContentDiv);
            this._columnDivs[x].style.top = topPosition + "px";
        }
        
        this._model.fetch(this._renderedStartRow * this._columnCount, this._renderedEndRow * this._columnCount);
        
        for (y = this._renderedStartRow; y < this._renderedEndRow; ++y) {
            for (x = 0; x < this._columnCount; ++x) {
                index = y * this._columnCount + x;
                if (index < size) {
                    this._renderer.render(this.component, this._model.get(index), index, cellDivs[x], 
                            { selected: selection[index] });
                }
                cellDivs[x] = cellDivs[x].nextSibling;
            }
        }
    },
    
    _renderCellsIncremental: function(up) {
        var newStartRow = Math.floor(this._position);
        var newEndRow = Math.min(this._rowCount, Math.ceil(newStartRow + this._flowBounds.height / this._cellSize.height + 1));
        var topPosition = 0 - Math.floor((this._position - Math.floor(this._position)) * this._cellSize.height);
        var rowsToRemove, rowsToAdd, contentDiv, cellDiv, x, y, index;
        var size = this._model.size();
        var selection = this.component.get("selection") || {};

        this._renderedPosition = this._position;
        
        this._model.fetch(newStartRow * this._columnCount, newEndRow * this._columnCount);

        for (x = 0; x < this._columnDivs.length; ++x) {
            this._columnDivs[x].style.top = topPosition + "px";
            Core.Web.VirtualPosition.redraw(this._columnDivs[x]);
        }
        
        if (up) {
            rowsToRemove = this._renderedEndRow - newEndRow;
            rowsToAdd = this._renderedStartRow - newStartRow;

            for (y = 0; y < rowsToRemove; ++y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    if (contentDiv.lastChild) {
                        contentDiv.removeChild(contentDiv.lastChild);
                    }
                }
            }
            
            for (y = this._renderedStartRow - 1; y >= newStartRow; --y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    index = y * this._columnCount + x;
                    contentDiv = this._columnDivs[x].firstChild;
                    cellDiv = this._protoCell.cloneNode(false);
                    contentDiv.insertBefore(cellDiv, contentDiv.firstChild);
                    if (index < size) {
                        this._renderer.render(this.component, this._model.get(index), index, cellDiv, 
                                { selected: selection[index] });
                    }
                }
            }
        } else {
            rowsToRemove = newStartRow - this._renderedStartRow;
            rowsToAdd = newEndRow - this._renderedEndRow;

            for (y = 0; y < rowsToRemove; ++y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    if (contentDiv.firstChild) {
                        contentDiv.removeChild(contentDiv.firstChild);
                    }
                }
            }
            
            for (y = this._renderedEndRow; y < newEndRow; ++y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    index = y * this._columnCount + x;
                    contentDiv = this._columnDivs[x].firstChild;
                    cellDiv = this._protoCell.cloneNode(false);
                    contentDiv.appendChild(cellDiv);
                    if (index < size) {
                        this._renderer.render(this.component, this._model.get(index), index, cellDiv, 
                                { selected: selection[index] });
                    }
                }
            }
        }

        this._renderedStartRow = newStartRow;
        this._renderedEndRow = newEndRow;
    },
    
    _renderCellsUpdate: function() {
        if (this._position === this._renderedPosition) {
            return;
        }
        
        var incremental = Math.abs(this._renderedPosition - this._position) < 
                (0.75 * this._flowBounds.height / this._cellSize.height);
        
        if (incremental) {
            this._renderCellsIncremental(this._position < this._renderedPosition);
        } else {
            this._clearContent();
            this._renderColumns();
            this._renderCellsFull();
        }
    },

    _renderColumns: function() {
        if (this._columnsRendered) {
            return;
        }
        
        this._columnDivs = [];
        var position = Math.max(0, Math.floor((this._flowBounds.width - this._columnCount * this._cellSize.width) / 2));
        for (var i = 0; i < this._columnCount; ++i) {
            this._columnDivs[i] = document.createElement("div");
            this._columnDivs[i].style.cssText = "position:absolute;top:0;bottom:0;overflow:hidden;";
            this._columnDivs[i].style.width = this._cellSize.width + "px";
            this._columnDivs[i].style.left = position + "px";
            this._flowDiv.appendChild(this._columnDivs[i]);
            position += this._cellSize.width;
            Core.Web.VirtualPosition.redraw(this._columnDivs[i]);
        }
        this._columnsRendered = true;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        Core.Web.VirtualPosition.redraw(this._flowDiv);
        
        var oldBounds = this._bounds || {};
        var newBounds = new Core.Web.Measure.Bounds(this._div);
        this._bounds = newBounds;
        
        var size = this._model.size();
        
        this._columnCount = Math.max(1, Math.floor((newBounds.width - Core.Web.Measure.SCROLL_WIDTH) / this._cellSize.width));
        this._rowCount = Math.ceil(size / this._columnCount);
        
        var totalHeight = size * this._cellSize.height;
        this._scrollContainer.setActive(this._bounds.height < totalHeight);
        this._scrollContainer.setRows(this._rowCount);

        this._flowBounds = new Core.Web.Measure.Bounds(this._flowDiv);
        this._scrollContainer.renderDisplay();

        if (newBounds.width != oldBounds.width || newBounds.height != oldBounds.height) {
            this._clearContent();
            this._renderColumns();
            this._renderCellsFull();
        }
    },
    
    renderDispose: function(update) {
        this._bounds = null;
        Core.Web.Event.removeAll(this._div);
        this._scrollContainer.dispose();
        this._model.removeUpdateListener(this._updateListenerRef);
        this._scrollContainer = null;
        this._flowDiv = null;
        this._div = null;
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    _setHighlight: function(index, rollover) {
        if (index < this._renderedStartRow * this._columnCount || index >= this._renderedEndRow * this._columnCount) {
            return;
        }
        
        var contentDiv, x, y, cellDiv;
        var selection = this.component.get("selection") || {};
        
        y = Math.floor(index / this._columnCount);
        x = index % this._columnCount;
        contentDiv = this._columnDivs[x].firstChild;
        cellDiv = contentDiv.childNodes[y - this._renderedStartRow];
        while (cellDiv.firstChild) {
            cellDiv.removeChild(cellDiv.firstChild);
        }
        this._renderer.render(this.component, this._model.get(index), index, cellDiv, { selected: selection[index] });
    },

    _setPosition: function(row) {
        this._position = row;
        this._renderCellsUpdate();
    },
    
    _updateListener: function(e) {
        if (e.refresh) {
            Echo.Render.renderComponentDisplay(this.component);
            this._clearContent();
            this._renderColumns();
            this._renderCellsFull();
            return;
        }
        
        var start = Math.max(this._renderedStartRow * this._columnCount, e.startIndex),
            stop = Math.min(this._renderedEndRow * this._columnCount, e.endIndex),
            contentDiv, i, y, x, cellDivs, cellDiv;
        
        if (stop < start) {
            return;
        }
        
        var selection = this.component.get("selection") || {};
        
        for (i = start; i < stop; ++i) {
            y = Math.floor(i / this._columnCount);
            x = i % this._columnCount;
            contentDiv = this._columnDivs[x].firstChild;
            cellDiv = contentDiv.childNodes[y - this._renderedStartRow];
            while (cellDiv.firstChild) {
                cellDiv.removeChild(cellDiv.firstChild);
            }
            this._renderer.render(this.component, this._model.get(i), i, cellDiv, { selected: selection[i] });
        }
    }
});

Extras.Sync.FlowViewer.Renderer = Core.extend({
    
    $abstract: {
        
        /**
         * Returns the cell size, an object containing width and height pixel values, 
         * e.g.: { width: 200, height: 150 }.
         */
        getCellSize: function() { },
        
        render: function(component, modelValue, index, targetCell) { },
        
        dispose: function(component, modelValue, index, targetCell) { }
    }
});

Extras.Sync.FlowViewer.NullRenderer = Core.extend(Extras.Sync.FlowViewer.Renderer, {
    
    getCellSize: function() {
        return { width: 100, height: 100 };
    },
    
    render: function(component, modelValue, index, targetCell) {
        targetCell.appendChild(document.createTextNode((modelValue || "\u00a0").toString()));
    },
    
    dispose: function(component, modelValue, index, targetCell) { }
});
