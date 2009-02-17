/**
 * Component rendering peer: DragSource
 */
Extras.Sync.DragSource = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.DragSource", this);
    },
    
    /**
     * Clone of rendered DIV element (and descendant hierarchy).  Used when dragging the object.
     * @type Element
     */
    _cloneDiv: null,
    
    /**
     * Rendered DIV element.
     * @type Element 
     */
    _div: null,
    
    _dragStart: function() {
        this._dragStop();
        this._cloneDiv = this._div.cloneNode(true);
        this._cloneDiv.style.position = "absolute";
        this._cloneDiv.style.zIndex = "32767";
        this._setCloneOpacity(0.2);
        document.body.appendChild(this._cloneDiv);
    },
    
    _dragStop: function() {
        if (!this._cloneDiv) {
            return;
        }
        if (this._cloneDiv.parentNode) {
            this._cloneDiv.parentNode.removeChild(this._cloneDiv);
        }
        this._cloneDiv = null;
    },
    
    _processMouseDown: function(e) {
        Core.Web.DOM.preventEventDefault(e);

        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        
        this._dragStart();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        if (this.component.children.length > 0) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        }

        Core.Web.Event.add(this._div, "mousedown", Core.method(this, this._processMouseDown), false);
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._dragStop();
        Core.Web.Event.removeAll(this._div);

        this._cloneDiv = null;
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    },
    
    _setCloneOpacity: function(value) {
        if (Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._cloneDiv.style.filter = "alpha(opacity=" + (value * 100) + ")";
            }
        } else {
            this._cloneDiv.style.opacity = value;
        }
    }
});