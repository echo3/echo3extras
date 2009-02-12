/**
 * Component rendering peer: Group
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
    
    _div: null,
    
    _borderImages: null,
    
    _getBorderImage: function(position, repeat, x, y) {
        var image;
        if (this._borderImages) {
            image = this._borderImages[position];
        } else {
            image = this._getImageUri(position);
        }
        if (image) {
            return { url: image, repeat: repeat, x: x, y: y };
        }
    },

    /**
     * Gets an URI for default border images.
     * 
     * @param {Number} position the image position (0-7)
     * @return the image URI
     * @type {String}
     */
    _getImageUri: function(position) {
        return this.client.getResourceUrl("Extras", Extras.Sync.Group.DEFAULTS.borderImages[position]);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._borderImages = this.component.render("borderImage");
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        Echo.Sync.Color.render(this.component.render("foreground"), this._div, "color");
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._div);
    
        var content = this._renderContent();
        var borderParts = this._renderBorder(content);
        for (var i = 0; i < borderParts.length; i++) {
            this._div.appendChild(borderParts[i]);
        }
        
        parentElement.appendChild(this._div);
    },
    
    _renderBorder: function(contentElem) {
        var borderParts = [];
        var borderInsets = this.component.render("borderInsets", Extras.Sync.Group.DEFAULTS.borderInsets);
        var borderPixelInsets = Echo.Sync.Insets.toPixels(borderInsets);
        var flags = this.component.render("ieAlphaRenderBorder") ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        var topRight = document.createElement("div");
        topRight.style.width = "100%";
        Echo.Sync.FillImage.render(this._getBorderImage(2, "no-repeat", "100%", "100%"), topRight, flags);
        
        var topLeft = document.createElement("div");
        topLeft.style.paddingRight = borderPixelInsets.right + "px";
        topLeft.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(0, "no-repeat", 0, "100%"), topLeft, flags);
        topRight.appendChild(topLeft);
        
        var title = this.component.render("title");
        if (title) {
            var topTableElem = document.createElement("table");
            topTableElem.style.padding = "0px";
            topTableElem.style.borderCollapse = "collapse";
            topTableElem.style.width = "100%";
            var topTbodyElem = document.createElement("tbody");
            topTableElem.appendChild(topTbodyElem);
            var topRowElem = document.createElement("tr");
            topTbodyElem.appendChild(topRowElem);
            
            var titlePosition = this.component.render("titlePosition");
            if (titlePosition) {
                var topPosElem = document.createElement("td");
                if (Echo.Sync.Extent.isPercent(titlePosition)) {
                    topPosElem.style.width = titlePosition.toString();
                }
                var topPosElemImg = document.createElement("img");
                topPosElemImg.src = this.client.getResourceUrl("Echo", "resource/Transparent.gif");
                if (Echo.Sync.Extent.isPercent(titlePosition)) {
                    topPosElemImg.style.width = titlePosition.toString();
                }
                topPosElemImg.style.height = "1px";
                topPosElem.appendChild(topPosElemImg);
                Echo.Sync.FillImage.render(
                        this._getBorderImage(1, "repeat-x", 0, "100%"), topPosElem, flags);
                topRowElem.appendChild(topPosElem);
            }
            
            var titleElem = document.createElement("td");
            titleElem.style.whiteSpace = "nowrap";
            Echo.Sync.Font.render(this.component.render("titleFont"), titleElem);
            Echo.Sync.Insets.render(this.component.render("titleInsets",
                    Extras.Sync.Group.DEFAULTS.titleInsets), titleElem, "padding");
            var titleImage = this.component.render("titleBackgroundImage");
            if (titleImage) {
                Echo.Sync.FillImage.render({ url: titleImage, repeat: "repeat-x", x: 0, y: "100%" }, titleElem, flags);
            }
            titleElem.appendChild(document.createTextNode(title));
            topRowElem.appendChild(titleElem);
            
            var topFillElem = document.createElement("td");
            if (titlePosition && Echo.Sync.Extent.isPercent(titlePosition)) {
                topFillElem.style.width = (100 - parseInt(titlePosition, 10)) + "%";
            } else {
                topFillElem.style.width = "100%";
            }
            topFillElem.style.height = borderPixelInsets.top + "px";
            Echo.Sync.FillImage.render(this._getBorderImage(1, "repeat-x", 0, "100%"), 
                    topFillElem, flags);
            topRowElem.appendChild(topFillElem);
            
            topLeft.appendChild(topTableElem);
        } else {
            var topElem = document.createElement("div");
            topElem.style.width = "100%";
            topElem.style.height = borderPixelInsets.top + "px";
            topElem.style.fontSize = "1px";
            Echo.Sync.FillImage.render(this._getBorderImage(1, "repeat-x", 0, "100%"), 
                    topElem, flags);
            topLeft.appendChild(topElem);
        }
        
        borderParts.push(topRight);
        
        var rightElem = document.createElement("div");
        rightElem.style.width = "100%";
        Echo.Sync.FillImage.render(this._getBorderImage(4, "repeat-y", "100%", 0), 
                rightElem, flags);
        
        var leftElem = document.createElement("div");
        leftElem.style.paddingRight = borderPixelInsets.right + "px";
        leftElem.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(3, "repeat-y", 0, 0), 
                leftElem, flags);
        leftElem.appendChild(contentElem);
        rightElem.appendChild(leftElem);
        borderParts.push(rightElem);
        
        var bottomRight = document.createElement("div");
        bottomRight.style.width = "100%";
        bottomRight.style.height = borderPixelInsets.bottom + "px";
        bottomRight.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getBorderImage(7, "no-repeat", "100%", "100%"), bottomRight, flags);
        
        var bottomLeft = document.createElement("div");
        bottomLeft.style.paddingRight = borderPixelInsets.right + "px";
        bottomLeft.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(5, "no-repeat", 0, "100%"), bottomLeft, flags);
        bottomRight.appendChild(bottomLeft);
        
        var bottomElem = document.createElement("div");
        bottomElem.style.width = "100%";
        bottomElem.style.height = borderPixelInsets.bottom + "px";
        bottomElem.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getBorderImage(6, "repeat-x", 0, "100%"), 
                bottomElem, flags);
        bottomLeft.appendChild(bottomElem);
        borderParts.push(bottomRight);
        
        return borderParts;
    },
    
    _renderContent: function(update) {
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
        
        return div;
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
