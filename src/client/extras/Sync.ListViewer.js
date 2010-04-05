Extras.Sync.ListViewer = Core.extend(Echo.Render.ComponentSync, { 
    
    $load: function() {
        Echo.Render.registerPeer("Extras.ListViewer", this);
    },
    
    _columnsRendered: false,
    
    /** Overall cell height, including border. */
    _cellHeight: null,
    
    _borderHeight: 0,
    _columnWidthPx: null,
    _columnDivs: null,
    _protoCell: null,
    _div: null,
    _listDiv: null,

    /** The first rendered row index, inclusive. */
    _renderedStartIndex: null,
    
    /** The last rendered row index, exclusive. */
    _renderedEndIndex: null, 
    
    /**
     * The currently rendered first displayed row position.
     */
    _renderedPosition: 0,
    
    /**
     * The desired first displayed row position.  This value is not a row index, but a possibly fractional value
     * denoting the row position at the very top of the viewing area.  For example, if half of the second
     * row were visible at the top, then _position would be 1.5. 
     */
    _position: 0,
    
    $construct: function() {
        this._updateListenerRef = Core.method(this, this._updateListener);
    },
    
    _calculateCellHeight: function() {
        // Measure a test text line.
        var testDiv = document.createElement("div");
        testDiv.appendChild(document.createTextNode("Test Height"));
        this._cellInnerHeight = new Core.Web.Measure.Bounds(testDiv).height;

        var border = this.component.render("border");
        var insets = Echo.Sync.Insets.toPixels(this.component.render("insets"));
        this._borderHeight = Echo.Sync.Border.getPixelSize(border, "top") + Echo.Sync.Border.getPixelSize(border, "bottom");
        
        var headerInsets = Echo.Sync.Insets.toPixels(this.component.render("headerInsets"));

        this._cellHeight = this._cellInnerHeight + this._borderHeight + insets.top + insets.bottom;
        this._headerCellHeight = this._columnNames ? this._cellInnerHeight + headerInsets.top + headerInsets.bottom : 0;
        
    },
    
    _calculateColumnWidths: function() {
        var i = 0,
            availableWidth = this._listBounds.width;
        
        this._columnWidthPx = [];
        var totalPercentWidth = 0;
        var columnWidth = this.component.render("columnWidth", ["100%"]);
        
        // Calculate sum of percentage widths *and* store absolute widths.
        // Subtract absolute widths from available width.
        for (i = 0; i < columnWidth.length; ++i) {
            if (Echo.Sync.Extent.isPercent(columnWidth[i])) {
                totalPercentWidth += parseInt(columnWidth[i], 10);
            } else {
                this._columnWidthPx[i] = Echo.Sync.Extent.toPixels(columnWidth[i]);
                availableWidth -= this._columnWidthPx[i];
            }
        }
        
        // Divide remaining width amongst percent-based columns.
        var availablePercentWidth = availableWidth;
        for (i = 0; i < columnWidth.length; ++i) {
            if (Echo.Sync.Extent.isPercent(columnWidth[i])) {
                this._columnWidthPx[i] = Math.floor(availablePercentWidth * parseInt(columnWidth[i], 10) / 100);
                availableWidth -= this._columnWidthPx[i];
            }
        }
        
        // Add any remaining width to final column to ensure 100% coverage.
        this._columnWidthPx[this._columnWidthPx.length - 1] += availableWidth;
    },
    
    _clearContent: function() {
        this._columnsRendered = false;
        while (this._listDiv.firstChild) {
            this._listDiv.removeChild(this._listDiv.firstChild);
        }
        if (this._columnNames) {
            while (this._headerDiv.firstChild) {
                this._headerDiv.removeChild(this._headerDiv.firstChild);
            }
        }
    },
    
    _createProtoCell: function() {
        this._protoCell = document.createElement("div");
        this._protoCell.style.cssText = "overflow:hidden;white-space:nowrap;";
        Echo.Sync.Insets.render(this.component.render("insets"), this._protoCell, "padding");
        this._protoCell.style.height = (this._cellInnerHeight) + "px";
        Echo.Sync.Border.render(this.component.render("border"), this._protoCell);
    },
    
    _getCellDiv: function(column, row) {
        if (row < this._renderedStartIndex || row >= this._renderedEndIndex) {
            return null;
        }
        var contentDiv = this._columnDivs[column].firstChild;
        return contentDiv.childNodes[row - this._renderedStartIndex];
    },
    
    _getIndexFromNode: function(node) {
        var x, y;
        var testNode;
        var columnContentDiv;
        
        // Find containing column content div.
        testNode = node;
        while (testNode && testNode.parentNode !== this._listDiv) {
            testNode = testNode.parentNode;
        }
        if (!testNode) {
            return -1;
        }
        
        // Move node reference to  child of column content div. 
        columnContentDiv = testNode.firstChild;
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
                return y + this._renderedStartIndex;
            }
            testNode = testNode.nextSibling;
            ++y; 
        }

        return -1;
    },
    
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        var index = this._getIndexFromNode(e.target);
        this._setHighlight(index, true);
    },
    
    _processRolloverExit: function(e) {
        var index = this._getIndexFromNode(e.target);
        this._setHighlight(index, false);
    },
    
    _processClick: function(e, contextClick) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        var index = this._getIndexFromNode(e.target);
        if (index === -1) {
            return;
        }
        
        if (e.ctrlKey || e.metaKey || e.altKey) {
            var selection = this.component.get("selection") || {};
            if (!contextClick && selection[index]) {
                delete selection[index];
            } else {
                selection[index] = true;
            }
            // Force update.
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
        var row = this._getIndexFromNode(e.target);
        if (row !== -1) {
            this.component.doAction(row);
        }
    },
    
    _processScroll: function(e) {
        this._setPosition(e.row);
    },
    
    renderAdd: function(update, parentElement) {
        this._columnsRendered = false;

        this._columnNames = this.component.render("columnName");
        
        this._model = this.component.get("model") || new Extras.Viewer.NullModel();
        this._model.addUpdateListener(this._updateListenerRef);
        
        this._renderer = this.component.get("renderer") || new Extras.Sync.ListViewer.ColumnRenderer();
        
        this._calculateCellHeight();
        
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;";
        
        if (this._columnNames) {
            this._headerDiv = document.createElement("div");
            this._headerDiv.style.cssText = "position:absolute;left:0;top:0;right:0;overflow:hidden;";
            this._headerDiv.style.height = this._headerCellHeight + "px";
            Echo.Sync.Color.render(this.component.render("headerBackground"), this._headerDiv, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("headerForeground"), this._headerDiv, "color");
            this._div.appendChild(this._headerDiv);
        }
        
        this._containerDiv = document.createElement("div");
        this._containerDiv.style.cssText = "position:absolute;left:0;right:0;bottom:0;";
        this._containerDiv.style.top = this._headerCellHeight + "px";
        this._div.appendChild(this._containerDiv);
        
        this._scrollContainer = new Extras.Sync.Viewer.ScrollContainer(this.client, this.component, this._model.size(), 
                this._cellHeight);
        this._scrollContainer.onScroll = Core.method(this, this._processScroll);
        this._containerDiv.appendChild(this._scrollContainer.rootElement);

        this._listDiv = document.createElement("div");
        this._listDiv.style.cssText = "position:absolute;left:0;top:0;bottom:0;right:0;cursor:pointer;";
        Echo.Sync.Color.renderFB(this.component, this._listDiv);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._listDiv);
        this._scrollContainer.contentElement.appendChild(this._listDiv);

        parentElement.appendChild(this._div);
        
        this._createProtoCell();
        
        Core.Web.Event.add(this._div, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this._div, "contextmenu", Core.method(this, this._processContextMenu), false);
        Core.Web.Event.add(this._div, "dblclick", Core.method(this, this._processDoubleClick), false);
        if (this.component.render("rolloverEnabled")) {
            Core.Web.Event.add(this._div, "mouseover", Core.method(this, this._processRolloverEnter), false);
            Core.Web.Event.add(this._div, "mouseout", Core.method(this, this._processRolloverExit), false);
        }
        Core.Web.Event.Selection.disable(this._div);
    },
    
    _renderHighlight: function(cellDivs, row, rollover) {
        var selection = this.component.get("selection") || {};
        var selected = selection[row];
        
        var prefix = selected ? "selection" : "rollover";
        var background, foreground;
        if (rollover || selected) {
            background = this.component.render(prefix + "Background");
            foreground = this.component.render(prefix + "Foreground");
        }
        
        for (var i = 0; i < cellDivs.length; ++i) {
            Echo.Sync.Color.renderClear(background, cellDivs[i], "backgroundColor"); 
            Echo.Sync.Color.renderClear(foreground, cellDivs[i], "color"); 
        }
    },
    
    _renderColumns: function() {
        if (this._columnsRendered) {
            return;
        }
        
        this._calculateColumnWidths();
        this._headerColumnDivs = [];
        this._columnDivs = [];
        var position = 0;
        for (var i = 0; i < this._columnWidthPx.length; ++i) {
            var width = Math.max(0, this._columnWidthPx[i]);
            if (this._columnNames && this._columnNames[i]) {
                this._headerColumnDivs[i] = document.createElement("div");
                this._headerColumnDivs[i].style.cssText = "position:absolute;top:0;overflow:hidden;";
                this._headerColumnDivs[i].style.width = width + "px";
                this._headerColumnDivs[i].style.left = position + "px";
                Echo.Sync.Insets.render(this.component.render("headerInsets"), this._headerColumnDivs[i], "padding");
                this._headerColumnDivs[i].appendChild(document.createTextNode(this._columnNames[i]));
                this._headerDiv.appendChild(this._headerColumnDivs[i]);
            }
            
            this._columnDivs[i] = document.createElement("div");
            this._columnDivs[i].style.cssText = "position:absolute;top:0;bottom:0;overflow:hidden;";
            this._columnDivs[i].style.width = width + "px";
            this._columnDivs[i].style.left = position + "px";
            this._listDiv.appendChild(this._columnDivs[i]);
            position += width;
            
            Core.Web.VirtualPosition.redraw(this._columnDivs[i]);
        }
        this._columnsRendered = true;
    },

    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._div);
        this._model.removeUpdateListener(this._updateListenerRef);
        this._scrollContainer.dispose();
        
        this._bounds = null;
        this._listBounds = null;
        this._div = null;
        this._listDiv = null;
        this._columnDivs = null;
        this._protoCell = null;
        this._scrollContainer = null;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        Core.Web.VirtualPosition.redraw(this._headerDiv);
        Core.Web.VirtualPosition.redraw(this._containerDiv);
        Core.Web.VirtualPosition.redraw(this._listDiv);
        
        var oldBounds = this._bounds || {};
        var newBounds = new Core.Web.Measure.Bounds(this._containerDiv);
        this._bounds = newBounds;
        
        var totalHeight = this._model.size() * this._cellHeight;
        this._scrollContainer.setActive(this._bounds.height < totalHeight);
        
        this._listBounds = new Core.Web.Measure.Bounds(this._listDiv);
        this._scrollContainer.renderDisplay();
        if (newBounds.width != oldBounds.width || newBounds.height != oldBounds.height) {
            this._clearContent();
            this._renderColumns();
            this._renderRowsFull();
        }
    },
    
    _renderRowsFull: function() {
        var cellDiv, cellDivs, x, y, columnContentDiv, contentDiv,
            selection = this.component.get("selection") || {},
            rowCount = this._model.size();
        
        this._renderedPosition = this._position;
        this._renderedStartIndex = Math.floor(this._position);
        this._renderedEndIndex = Math.min(rowCount, 
                Math.ceil(this._renderedStartIndex + this._listBounds.height / this._cellHeight));
        
        contentDiv = document.createElement("div");
        for (y = this._renderedStartIndex; y < this._renderedEndIndex; ++y) {
            cellDiv = this._protoCell.cloneNode(false);
            contentDiv.appendChild(cellDiv);
        }
        
        var topPosition = 0 - Math.floor((this._position - Math.floor(this._position)) * this._cellHeight);
        
        this._model.fetch(this._renderedStartIndex, this._renderedEndIndex);
        
        cellDivs = [];
        for (x = 0; x < this._columnDivs.length; ++x) {
            columnContentDiv = contentDiv.cloneNode(true);
            cellDivs.push(columnContentDiv.firstChild);
            this._columnDivs[x].appendChild(columnContentDiv);
            this._columnDivs[x].style.top = topPosition + "px";
        }
        for (y = this._renderedStartIndex; y < this._renderedEndIndex && y < rowCount; ++y) {
            this._renderer.render(this.component, this._model.get(y), y, cellDivs);
            
            if (selection[y]) {
                this._renderHighlight(cellDivs, y, false);
            }
            
            for (x = 0; x < this._columnDivs.length; ++x) {
                cellDivs[x] = cellDivs[x].nextSibling;
            }
        }
    },
    
    _renderRowsIncremental: function(up) {
        var newStartRow = Math.floor(this._position);
        var newEndRow = Math.min(this._model.size(), Math.ceil(newStartRow + this._listBounds.height / this._cellHeight + 1));
        var contentDiv, cellDivs, cellDiv, cellsToRemove, cellsToAdd, x, y,
            selection = this.component.get("selection") || {};
            
        var topPosition = 0 - Math.floor((this._position - Math.floor(this._position)) * this._cellHeight);
        this._renderedPosition = this._position;

        this._model.fetch(newStartRow, newEndRow);

        for (x = 0; x < this._columnDivs.length; ++x) {
            this._columnDivs[x].style.top = topPosition + "px";
        }
        
        if (up) {
            cellsToRemove = this._renderedEndIndex - newEndRow;
            cellsToAdd = this._renderedStartIndex - newStartRow;

            for (y = 0; y < cellsToRemove; ++y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    contentDiv.removeChild(contentDiv.lastChild);
                }
            }
            
            for (y = this._renderedStartIndex - 1; y >= newStartRow; --y) {
                cellDivs = [];
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    cellDiv = this._protoCell.cloneNode(false);
                    contentDiv.insertBefore(cellDiv, contentDiv.firstChild);
                    cellDivs.push(cellDiv);
                }
                this._renderer.render(this.component, this._model.get(y), y, cellDivs);
                if (selection[y]) {
                    this._renderHighlight(cellDivs, y, false);
                }
            }
        } else {
            cellsToRemove = newStartRow - this._renderedStartIndex;
            cellsToAdd = newEndRow - this._renderedEndIndex;

            for (y = 0; y < cellsToRemove; ++y) {
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    contentDiv.removeChild(contentDiv.firstChild);
                }
            }
            
            for (y = this._renderedEndIndex; y < newEndRow; ++y) {
                cellDivs = [];
                for (x = 0; x < this._columnDivs.length; ++x) {
                    contentDiv = this._columnDivs[x].firstChild;
                    cellDiv = this._protoCell.cloneNode(false);
                    contentDiv.appendChild(cellDiv);
                    cellDivs.push(cellDiv);
                }
                this._renderer.render(this.component, this._model.get(y), y, cellDivs);
                if (selection[y]) {
                    this._renderHighlight(cellDivs, y, false);
                }
            }
        }

        this._renderedStartIndex = newStartRow;
        this._renderedEndIndex = newEndRow;
    },
    
    _renderRowsUpdate: function() {
        if (this._position === this._renderedPosition) {
            return;
        }
        
        var incremental = Math.abs(this._renderedPosition - this._position) < (0.75 * this._listBounds.height / this._cellHeight);
        
        if (incremental) {
            this._renderRowsIncremental(this._position < this._renderedPosition);
        } else {
            this._clearContent();
            this._renderColumns();
            this._renderRowsFull();
        }
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    _setPosition: function(row) {
        this._position = row;
        this._renderRowsUpdate();
    },
    
    _setHighlight: function(index, rollover) {
        var cellDivs = [];
        for (var column = 0; column < this._columnDivs.length; ++column) {
            var cellDiv = this._getCellDiv(column, index);
            if (!cellDiv) {
                return;
            }
            cellDivs.push(cellDiv);
        }
        this._renderHighlight(cellDivs, index, rollover);
    },
    
    _updateListener: function(e) {
        if (e.refresh) {
            Echo.Render.renderComponentDisplay(this.component);
            this._scrollContainer.setRows(this._model.size());
            this._clearContent();
            this._renderColumns();
            this._renderRowsFull();
            return;
        }
        
        var start = Math.max(this._renderedStartIndex, e.startIndex),
            stop = Math.min(this._renderedEndIndex, e.endIndex),
            contentDiv, y, x, cellDivs, cellDiv,
            selection = this.component.get("selection") || {};
        
        if (stop <= start) {
            return;
        }
        
        cellDivs = [];
        for (x = 0; x < this._columnDivs.length; ++x) {
            contentDiv = this._columnDivs[x].firstChild;
            cellDiv = contentDiv.childNodes[start - this._renderedStartIndex];
            cellDivs.push(cellDiv);
        }
        
        for (y = start; y < stop; ++y) {
            for (x = 0; x < this._columnDivs.length; ++x) {
                while (cellDivs[x].firstChild) {
                    cellDivs[x].removeChild(cellDivs[x].firstChild);                
                }
            }
            
            this._renderer.render(this.component, this._model.get(y), y, cellDivs);
            if (selection[y]) {
                this._renderHighlight(cellDivs, y, false);
            }
            
            for (x = 0; x < this._columnDivs.length; ++x) {
                cellDivs[x] = cellDivs[x].nextSibling;
            }
        }
    }
});

Extras.Sync.ListViewer.Renderer = Core.extend({
    
    $abstract: {
        
        render: function(component, modelValue, index, targetCells) { },
        
        dispose: function(component, modelValue, index, targetCells) { }
    }
});

Extras.Sync.ListViewer.ColumnRenderer = Core.extend(Extras.Sync.ListViewer.Renderer, {
    
    $virtual: {
        renderColumn: function(component, modelValue, index, targetCell, columnModelValue, columnIndex) {
            targetCell.appendChild(document.createTextNode(columnModelValue.toString()));
        }
    },
    
    columnPropertyNames: null,
    
    render: function(component, modelValue, index, targetCells) {
        var value, i;
        if (!modelValue) {
            return;
        }
        for (i = 0; i < targetCells.length; ++i) {
            if (this.columnPropertyNames) {
                value = modelValue[this.columnPropertyNames[i] || i];
            } else if (modelValue instanceof Array) {
	            value = modelValue[i];
            } else if (i === 0) {
                value = modelValue;
            } else {
                value = null;
            }
            if (value != null) {
                this.renderColumn(component, modelValue, index, targetCells[i], value, i);
            }
        }
    },
    
    dispose: function(component, modelValue, index, targetCells) { }
});
