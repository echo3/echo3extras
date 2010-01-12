Extras.Sync.Viewer = { };

Extras.Sync.Viewer.ScrollContainer = Core.extend({
    
    _accumulator: 0,
    _rowHeight: null,
    _scrollPosition: 0,
    _barPosition: 0,
    onScroll: null,
    gain: 0.2,
    
    /**
     * Creates a ScrollContainer.  The dispose() method should be invoked when the ScrollContainer will no longer be used.
     */
    $construct: function(client, component, rows, rowHeight) {
        this.client = client;
        this.component = component;
        this._rowHeight = rowHeight;
        
        this.rootElement = document.createElement("div");
        this.rootElement.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;";
        
        this._barDiv = document.createElement("div");
        this._barDiv.style.cssText = "position:absolute;top:0;bottom:0;right:0;overflow:scroll;";
        this._barDiv.style.width = (1 + Core.Web.Measure.SCROLL_WIDTH) + "px";
        this._vScrollContent = document.createElement("div");
        this._vScrollContent.style.cssText = "width:1px;";
        this._barDiv.appendChild(this._vScrollContent);
        this.rootElement.appendChild(this._barDiv);
        
        this.contentElement = document.createElement("div");
        this.contentElement.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;background:white;";
        this.rootElement.appendChild(this.contentElement);
        
        Core.Web.Event.add(this._barDiv, "scroll", Core.method(this, this._processScroll), true);
        Core.Web.Event.add(this.rootElement, Core.Web.Env.BROWSER_MOZILLA ? "DOMMouseScroll" :  "mousewheel",
                Core.method(this, this._processWheel), true);
                
        this.setRows(rows);
        this._accumulatorRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._accumulatedScroll), 10);
    },
        
    _accumulatedScroll: function() {
        if (this._accumulator) {
            var increment = this._accumulator;
            this._adjustScrollPosition(this.gain * this._accumulator);
            this._accumulator = 0;
        }
    },

    /**
     * Disposes of the ScrollContainer, releasing any resources in use.
     */
    dispose: function() {
        Core.Web.Event.removeAll(this._barDiv);
        Core.Web.Event.removeAll(this.rootElement);
    
        this.rootElement = null;
        this.contentElement = null;
        this._barDiv = null;        
    },
    
    _adjustScrollPosition: function(screenFactor) {
        this._scrollPosition += this._height * screenFactor;
        this._scrollPosition = Math.max(0, Math.min(this._scrollPosition, this._maxScrollPosition));
        this._barPosition = Math.floor(this._scrollPosition * this._barFactor);
        this._rowPosition = this._scrollPosition / this._rowHeight;
        this._barDiv.scrollTop = this._barPosition;
        if (this.onScroll) {
            this.onScroll({ source: this, type: "scroll", row: this._rowPosition });
        }
    },
    
    /**
     * Process a scroll bar drag adjustment event.
     *
     * @param e the event
     */
    _processScroll: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            // Reset scroll bar position.
            this._barDiv.scrollTop = this._barPosition;
            return;
        }
        if (this._barDiv.scrollTop !== this._barPosition) {
            this._barPosition = this._barDiv.scrollTop;
            this._scrollPosition = this._barPosition / this._barFactor;
            this._rowPosition = this._scrollPosition / this._rowHeight;
            if (this.onScroll) {
                this.onScroll({ source: this, type: "scroll", row: this._rowPosition });
            }
        }
    },
    
    /**
     * Processes a scroll wheel event.
     *
     * @param e the event
     */
    _processWheel: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }

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
        
        if (this._accumulator === 0) {
            Core.Web.Scheduler.add(this._accumulatorRunnable);
        }
        
        // Scroll vertically.
        this._accumulator += wheelScroll;
        
        // Prevent default scrolling action, or in the case of modifier keys, font adjustments, etc.
        Core.Web.DOM.preventEventDefault(e);
        
        return true;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.rootElement);
        Core.Web.VirtualPosition.redraw(this.contentElement);
        Core.Web.VirtualPosition.redraw(this._barDiv);
        this._height = this._barDiv.offsetHeight;
        this._vScrollContent.style.height = Math.min(this._height * 50, this._totalRowHeight) + "px";
        this._scrollHeight = this._barDiv.scrollHeight;
        this._barRange = this._scrollHeight - this._height;
        this._updateSizes();
    },
    
    _updateSizes: function() {
        this._maxScrollPosition = Math.max(0, this._totalRowHeight - this._height);
        this._barFactor = this._barRange / this._maxScrollPosition;
    },
    
    setActive: function(active) {
        if (active) {
            this.contentElement.style.right = Core.Web.Measure.SCROLL_WIDTH + "px";
        } else {
            this.contentElement.style.right = 0;
        }
    },

    setRows: function(rows) {
        this._totalRowHeight = rows * this._rowHeight;
        this._updateSizes();
        this.renderDisplay();
    }
});