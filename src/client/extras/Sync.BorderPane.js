/**
 * Component rendering peer: BorderPane
 */
Extras.Sync.BorderPane = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.BorderPane", this);
    },

    /**
     * The main DIV element.
     * @type Element
     */
    _div: null,
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "padding:0;z-index:1;overflow:hidden;position:absolute;left:0;top:0;width:100%;height:100%;";
        this._renderBorder();
        this._renderContent(update);
        parentElement.appendChild(this._div);
    },
    
    /**
     * Renders the FillImageBorder surrounding the content.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     */
    _renderBorder: function() {
        var border = this.component.render("border", Extras.BorderPane.DEFAULT_BORDER);
        var borderInsets = Echo.Sync.Insets.toPixels(border.borderInsets);
        var flags = this.component.render("ieAlphaRenderBorder") ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        var corner;
        
        // Render top row
        if (borderInsets.top > 0) {
            // Render top left corner
            if (borderInsets.left > 0) {
                corner = this._renderBorderPart(border, "topLeft", flags, 
                        borderInsets.left, borderInsets.top, 0, null, null, 0);
                this._div.appendChild(corner);
            }
            // Render top side
            this._top = this._renderBorderPart(border, "top", flags, 
                    null, borderInsets.top, 0, borderInsets.right, null, borderInsets.left);
            this._div.appendChild(this._top);
            // Render top right corner
            if (borderInsets.right > 0) {
                corner = this._renderBorderPart(border, "topRight", flags, 
                        borderInsets.right, borderInsets.top, 0, 0, null, null);
                this._div.appendChild(corner);
            }
        }
        // Render left side
        if (borderInsets.left > 0) {
            this._left = this._renderBorderPart(border, "left", flags, 
                    borderInsets.left, null, borderInsets.top, null, borderInsets.bottom, 0);
            this._div.appendChild(this._left);
        }
        // Render right side
        if (borderInsets.right > 0) {
            this._right = this._renderBorderPart(border, "right", flags, 
                    borderInsets.right, null, borderInsets.top, 0, borderInsets.bottom, null);
            this._div.appendChild(this._right);
        }
        // Render bottom row
        if (borderInsets.bottom > 0) {
            // Render bottom left corner
            if (borderInsets.left > 0) {
                corner = this._renderBorderPart(border, "bottomLeft", flags, 
                        borderInsets.left, borderInsets.bottom, null, null, 0, 0);
                this._div.appendChild(corner);
            }
            // Render bottom side
            this._bottom = this._renderBorderPart(border, "bottom", flags, 
                    null, borderInsets.bottom, null, borderInsets.right, 0, borderInsets.left);
            this._div.appendChild(this._bottom);
            // Render bottom right corner
            if (borderInsets.right > 0) {
                corner = this._renderBorderPart(border, "bottomRight", flags, 
                        borderInsets.right, borderInsets.bottom, null, 0, 0, null);
                this._div.appendChild(corner);
            }
        }
    },
    
    /**
     * Renders a sub-element of the border.
     * 
     * @param {#FillImageBorder} border the border
     * @param {Number} position the index of the image within the border to use
     * @param {Number} flags fill image rendering flags
     * @param {Number} width the pixel width of the element
     * @param {Number} height the pixel height of the element
     * @param {Number} top the top position of the element
     * @param {Number} right the right position of the element
     * @param {Number} bottom the bottom position of the element
     * @param {Number} left the left position of the element
     * @return the created DIV
     * @type Element
     */
    _renderBorderPart: function(border, position, flags, width, height, top, right, bottom, left) {
        var div = document.createElement("div");
        div.style.cssText = "font-size:1px;position:absolute;";
        
        if (width != null) {
            div.style.width = width + "px";
        }
        if (height != null) {
            div.style.height = height + "px";
        }
        if (top != null) {
            div.style.top = top + "px";
        }
        if (right != null) {
            div.style.right = right + "px";
        }
        if (bottom != null) {
            div.style.bottom = bottom + "px";
        }
        if (left != null) {
            div.style.left = left + "px";
        }
        
        if (border.color) {
            Echo.Sync.Color.render(border.color, div, "backgroundColor");
        }
        if (border[position]) {
            Echo.Sync.FillImage.render(border[position], div, flags);
        }
        
        return div;
    },
    
    /**
     * Renders the contained content.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     */
    _renderContent: function(update) {
        this._content = document.createElement("div");
        this._content.style.cssText = "position:absolute;z-index:2;overflow:auto;";
        
        Echo.Sync.renderComponentDefaults(this.component, this._content);
    
        var border = this.component.render("border", Extras.BorderPane.DEFAULT_BORDER);
        var contentInsets = Echo.Sync.Insets.toPixels(border.contentInsets);
    
        this._content.style.top = contentInsets.top + "px";
        this._content.style.left = contentInsets.left + "px";
        this._content.style.right = contentInsets.right + "px";
        this._content.style.bottom = contentInsets.bottom + "px";
        
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            var child = this.component.getComponent(0);
            var insets = child.pane ? null : this.component.render("insets");
            if (insets) {
                Echo.Sync.Insets.render(insets, this._content, "padding");
            }
            Echo.Render.renderComponentAdd(update, child, this._content);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
        
        this._div.appendChild(this._content);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._content);
        Core.Web.VirtualPosition.redraw(this._div);
        Core.Web.VirtualPosition.redraw(this._top);
        Core.Web.VirtualPosition.redraw(this._left);
        Core.Web.VirtualPosition.redraw(this._right);
        Core.Web.VirtualPosition.redraw(this._bottom);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._content = null;
        this._div = null;
        this._left = null;
        this._right = null;
        this._top = null;
        this._bottom = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});
