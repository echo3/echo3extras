/**
 * Component rendering peer: Reorder
 */
Extras.Reorder.Sync = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.Reorder", this);
    },
    
    _div: null,
    _mouseUpRef: null,
    _mouseMoveRef: null,
    _movingDiv: null,
    _dragDiv: null,
    _overlayDiv: null,
    _order: null,
    
    _sourceIndex: null,
    _targetIndex: null,
    
    /**
     * Array of <code>Core.Web.Measure.Bounds</code> instances describing boundaries of child elements.
     * Indices of this array correspond to render ordered of child elements.  This array is nulled when
     * elements are reordered, and recalculated by <code>_getIndex()</code> when required.
     * @type Array
     */
    _childBounds: null,
    
    $construct: function() {
        this._mouseUpRef = Core.method(this, this._mouseUp);
        this._mouseMoveRef = Core.method(this, this._mouseMove);
    },
    
    /**
     * Starts a drag operation.
     */
    _dragStart: function() {
        this._dragStop();

        this._overlayDiv = document.createElement("div");
        this._overlayDiv.style.cssText = "position:absolute;z-index:30000;width:100%;height:100%;cursor:pointer;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlayDiv);
 
        document.body.appendChild(this._overlayDiv);

        Core.Web.Event.add(document.body, "mousemove", this._mouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._mouseUpRef, true);
    },
    
    /**
     * Stop a drag operation.
     */
    _dragStop: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._mouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._mouseUpRef, true);

        if (this._overlayDiv) {
            document.body.removeChild(this._overlayDiv);
            this._overlayDiv = null;
        }
    },
    
    /**
     * Determines the index of the child element at the specified y-coordinate.
     * 
     * @param mouseY the event clientY value, i.e., distance from top of screen.
     */
    _getIndex: function(mouseY) {
        if (!this._childBounds) {
            this._childBounds = [];
            var childDiv = this._div.firstChild;
            while (childDiv) {
                this._childBounds.push(new Core.Web.Measure.Bounds(childDiv));
                childDiv = childDiv.nextSibling;
            }
        }
        
        if (mouseY < this._childBounds[0].top) {
            // Before first index: return first index.
            return 0;
        }

        for (var i = 0; i < this._childBounds.length; ++i) {
            if (mouseY >= this._childBounds[i].top && 
                    mouseY <= this._childBounds[i].top + this._childBounds[i].height) {
                return i;
            }
        }
        
        // After last index: return last index.
        return this._childBounds.length - 1;
    },
    
    _mouseDown: function(e) {
        var handle = null,
            index,
            node = e.target;
        while (node != null && node != this._div) {
            if (node.__REORDER_HANDLE) {
                handle = node;
                break;
            }
            node = node.parentNode;
        }
        if (!handle) {
            return;
        }
        
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(e);
        
        while (node.parentNode != this._div) {
            node = node.parentNode;
        }
        this._movingDiv = node;
        
        node = this._div.firstChild;
        index = 0;
        while (node != this._movingDiv) {
            node = node.nextSibling;
            ++index;
        }
        
        this._sourceIndex = index;
        this._targetIndex = index;
        
        this._dragStart();
        
        this._movingDivBounds = new Core.Web.Measure.Bounds(this._movingDiv);
        
        this._dragOffsetY =  e.clientY - this._movingDivBounds.top;
        
        this._dragDiv = this._movingDiv.cloneNode(true);
        this._dragDiv.style.opacity = 0.8;
        this._dragDiv.style.position = "absolute";
        this._dragDiv.style.zIndex = 1000;
        this._dragDiv.style.left = this._movingDivBounds.left + "px";
        this._dragDiv.style.top = this._movingDivBounds.top + "px";
        this._dragDiv.style.width = this._movingDivBounds.width + "px";
        this._dragDiv.style.height = this._movingDivBounds.height + "px";
        document.body.appendChild(this._dragDiv);

        this._movingDiv.style.visibility = "hidden";
    },
    
    _mouseMove: function(e) {
        this._dragDiv.style.top = (e.clientY - this._dragOffsetY) + "px";
        var hoverIndex = this._getIndex(e.clientY);
        if (hoverIndex != this._targetIndex) {
            this._div.removeChild(this._movingDiv);
            if (hoverIndex < this._div.childNodes.length) {
                this._div.insertBefore(this._movingDiv, this._div.childNodes[hoverIndex]);
            } else {
                this._div.appendChild(this._movingDiv);
            }
            this._childBounds = null;
            this._targetIndex = hoverIndex; 
        }
    },
    
    _mouseUp: function(e) {
        Core.Web.dragInProgress = false;
        document.body.removeChild(this._dragDiv);
        this._dragDiv = null;
        
        this._dragStop();
        
        this._movingDiv.style.visibility = "visible";
        this._movingDiv = null;
        this.component.reorder(this._sourceIndex, this._targetIndex);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parent) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "";
        
        var order = this.component.getOrder();
        for (var i = 0; i < order.length; ++i) {
            var cell = document.createElement("div");
            Echo.Render.renderComponentAdd(update, this.component.children[order[i]], cell);
            this._div.appendChild(cell);
        }
        
        Core.Web.Event.add(this._div, "mousedown", Core.method(this, this._mouseDown));
        parent.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._div);
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Component rendering peer: Reorder.Handle
 */
Extras.Reorder.Handle.Sync = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.Reorder.Handle", this);
    },
    
    _span: null,
    _img: null,
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parent) {
        this._span = document.createElement("span");
        this._span.__REORDER_HANDLE = true;
        this._span.id = this.component.renderId;
        this._span.style.cssText = "cursor:pointer;";
        
        this._img = document.createElement("img");
        this._img.src = this.component.render("icon", this.client.getResourceUrl("Extras", "image/reorder/Icon32Move.png"));
        this._span.appendChild(this._img);
        
        parent.appendChild(this._span);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._span);
        this._span = null;
        this._img = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._span;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Does not allow child components.
    }
});
