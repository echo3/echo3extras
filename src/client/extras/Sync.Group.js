/**
 * Component rendering peer: Group.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.Group = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**
         * Default rendering values used when component does not specify a property value.
         */
        DEFAULTS: {
            borderImages: [
                "image/group/GroupBorderTopLeft.png",
                "image/group/GroupBorderTop.png",
                "image/group/GroupBorderTopRight.png",
                "image/group/GroupBorderLeft.png",
                "image/group/GroupBorderRight.png",
                "image/group/GroupBorderBottomLeft.png",
                "image/group/GroupBorderBottom.png",
                "image/group/GroupBorderBottomRight.png"
            ],
            borderInsets: "10px",
            titleInsets: "0px 2px"
        }
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.Group", this);
    },
    
    /**
     * Main outer DIV element.
     * @type Element
     */
    _div: null,
    
    /**
     * Array of component-provided border images (may be null if unspecified).
     * @type Array
     */
    _borderImages: null,
    
    /**
     * Creates a FillImage value for the given position, repeat, and position settings.
     * Images are retrieved from component-set or default border image array.
     * 
     * @param {Number} position the position index (0-7)
     * @param {String} repeat the repeat setting
     * @param {#Extent} x the rendered horizontal position, e.g., 0, or "100%" 
     * @param {#Extent} y the rendered vertical position, e.g., 0, or "100%"
     * @return the rendered image
     * @type #FillImage 
     */
    _getBorderImage: function(position, repeat, x, y) {
        var image = this._borderImages ? this._borderImages[position] : 
                this.client.getResourceUrl("Extras", Extras.Sync.Group.DEFAULTS.borderImages[position]);
        return image ? { url: image, repeat: repeat, x: x, y: y } : null; 
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._borderImages = this.component.render("borderImage");
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        Echo.Sync.Color.render(this.component.render("foreground"), this._div, "color");
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._div);
    
        this._renderBorder(update);
        
        parentElement.appendChild(this._div);
    },
    
    /**
     * Renders border element, appends to main DIV.  Invokes _renderContent() to render content and append to
     * DOM hierarchy in appropriate position.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     */
    _renderBorder: function(update) {
        var borderInsets = this.component.render("borderInsets", Extras.Sync.Group.DEFAULTS.borderInsets);
        var borderPixelInsets = Echo.Sync.Insets.toPixels(borderInsets);
        var flags = this.component.render("ieAlphaRenderBorder") ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        var topRightDiv = document.createElement("div");
        topRightDiv.style.width = "100%";
        Echo.Sync.FillImage.render(this._getBorderImage(2, "no-repeat", "100%", "100%"), topRightDiv, flags);
        
        var topLeftDiv = document.createElement("div");
        topLeftDiv.style.paddingRight = borderPixelInsets.right + "px";
        topLeftDiv.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(0, "no-repeat", 0, "100%"), topLeftDiv, flags);
        topRightDiv.appendChild(topLeftDiv);
        
        var title = this.component.render("title");
        if (title) {
            var topTable = document.createElement("table");
            topTable.style.padding = "0px";
            topTable.style.borderCollapse = "collapse";
            topTable.style.width = "100%";
            var topTbody = document.createElement("tbody");
            topTable.appendChild(topTbody);
            var topTr = document.createElement("tr");
            topTbody.appendChild(topTr);
            
            var titlePosition = this.component.render("titlePosition");
            if (titlePosition) {
                var topPositionTd = document.createElement("td");
                if (Echo.Sync.Extent.isPercent(titlePosition)) {
                    topPositionTd.style.width = titlePosition.toString();
                }
                var topPositionImg = document.createElement("img");
                topPositionImg.src = this.client.getResourceUrl("Echo", "resource/Transparent.gif");
                if (Echo.Sync.Extent.isPercent(titlePosition)) {
                    topPositionImg.style.width = titlePosition.toString();
                }
                topPositionImg.style.height = "1px";
                topPositionTd.appendChild(topPositionImg);
                Echo.Sync.FillImage.render(
                        this._getBorderImage(1, "repeat-x", 0, "100%"), topPositionTd, flags);
                topTr.appendChild(topPositionTd);
            }
            
            var titleTd = document.createElement("td");
            titleTd.style.whiteSpace = "nowrap";
            Echo.Sync.Font.render(this.component.render("titleFont"), titleTd);
            Echo.Sync.Insets.render(this.component.render("titleInsets",
                    Extras.Sync.Group.DEFAULTS.titleInsets), titleTd, "padding");
            var titleImage = this.component.render("titleBackgroundImage");
            if (titleImage) {
                Echo.Sync.FillImage.render({ url: titleImage, repeat: "repeat-x", x: 0, y: "100%" }, titleTd, flags);
            }
            titleTd.appendChild(document.createTextNode(title));
            topTr.appendChild(titleTd);
            
            var topFillTd = document.createElement("td");
            if (titlePosition && Echo.Sync.Extent.isPercent(titlePosition)) {
                topFillTd.style.width = (100 - parseInt(titlePosition, 10)) + "%";
            } else {
                topFillTd.style.width = "100%";
            }
            topFillTd.style.height = borderPixelInsets.top + "px";
            Echo.Sync.FillImage.render(this._getBorderImage(1, "repeat-x", 0, "100%"), 
                    topFillTd, flags);
            topTr.appendChild(topFillTd);
            
            topLeftDiv.appendChild(topTable);
        } else {
            var topDiv = document.createElement("div");
            topDiv.style.width = "100%";
            topDiv.style.height = borderPixelInsets.top + "px";
            topDiv.style.fontSize = "1px";
            Echo.Sync.FillImage.render(this._getBorderImage(1, "repeat-x", 0, "100%"), 
                    topDiv, flags);
            topLeftDiv.appendChild(topDiv);
        }
        
        this._div.appendChild(topRightDiv);
        
        var rightDiv = document.createElement("div");
        rightDiv.style.width = "100%";
        Echo.Sync.FillImage.render(this._getBorderImage(4, "repeat-y", "100%", 0), 
                rightDiv, flags);
        
        var leftDiv = document.createElement("div");
        leftDiv.style.paddingRight = borderPixelInsets.right + "px";
        leftDiv.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(3, "repeat-y", 0, 0), 
                leftDiv, flags);
        this._renderContent(update, leftDiv);
        rightDiv.appendChild(leftDiv);
        this._div.appendChild(rightDiv);
        
        var bottomRightDiv = document.createElement("div");
        bottomRightDiv.style.width = "100%";
        bottomRightDiv.style.height = borderPixelInsets.bottom + "px";
        bottomRightDiv.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getBorderImage(7, "no-repeat", "100%", "100%"), bottomRightDiv, flags);
        
        var bottomLeftDiv = document.createElement("div");
        bottomLeftDiv.style.paddingRight = borderPixelInsets.right + "px";
        bottomLeftDiv.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(5, "no-repeat", 0, "100%"), bottomLeftDiv, flags);
        bottomRightDiv.appendChild(bottomLeftDiv);
        
        var bottomDiv = document.createElement("div");
        bottomDiv.style.width = "100%";
        bottomDiv.style.height = borderPixelInsets.bottom + "px";
        bottomDiv.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getBorderImage(6, "repeat-x", 0, "100%"), 
                bottomDiv, flags);
        bottomLeftDiv.appendChild(bottomDiv);
        this._div.appendChild(bottomRightDiv);
    },
    
    /**
     * Renders the content (child) of the Group.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Element} the element to which the content should be appended  
     */
    _renderContent: function(update, parentElement) {
        var div = document.createElement("div");
        
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), div);
        Echo.Sync.Color.render(this.component.render("background"), div, "backgroundColor");
        Echo.Sync.Font.render(this.component.render("font"), div);
        Echo.Sync.Insets.render(this.component.render("insets"), div, "padding");
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; i++) {
            var child = this.component.getComponent(i);
            Echo.Render.renderComponentAdd(update, child, div);
        }
        
        parentElement.appendChild(div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._borderImages = null;
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
    }
});
