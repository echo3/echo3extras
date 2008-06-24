/**
 * Component rendering peer: Group
 */
Extras.Sync.Group = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        DEFAULT_TITLE_INSETS: "0px 2px",
        
        DEFAULT_BORDER_INSETS: "10px",
        
        DEFAULT_BORDER_IMAGES: [
            "image/group/GroupBorderTopLeft.png",
            "image/group/GroupBorderTop.png",
            "image/group/GroupBorderTopRight.png",
            "image/group/GroupBorderLeft.png",
            "image/group/GroupBorderRight.png",
            "image/group/GroupBorderBottomLeft.png",
            "image/group/GroupBorderBottom.png",
            "image/group/GroupBorderBottomRight.png"
        ]
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.Group", this);
    },

    $construct: function() {
        this._groupDivElement = null;
        this._borderImages = null;
    },
    
    /**
     * Gets an URI for default border images.
     * 
     * @param {Number} position the image position (0-7)
     * @return the image URI
     * @type {String}
     */
    _getImageUri: function(position) {
        return this.client.getResourceUrl("Extras", Extras.Sync.Group.DEFAULT_BORDER_IMAGES[position]);
    },
    
    getElement: function() {
        return this._groupDivElement;
    },
    
    renderAdd: function(update, parentElement) {
        this._borderImages = this.component.render("borderImage");
        
        this._groupDivElement = document.createElement("div");
        this._groupDivElement.id = this.component.renderId;
        Echo.Sync.Color.render(this.component.render("foreground"), this._groupDivElement, "color");
    
        var contentElement = this._renderContent();
        var borderParts = this._renderBorder(contentElement);
        for (var i = 0; i < borderParts.length; i++) {
            this._groupDivElement.appendChild(borderParts[i]);
        }
        
        parentElement.appendChild(this._groupDivElement);
    },
    
    _getRepeatingBorderImage: function(position, repeat, x, y) {
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
    
    _getBorderImage: function(position, x, y) {
        return this._getRepeatingBorderImage(position, "no-repeat", x, y);
    },
    
    _renderBorder: function(contentElem) {
        var borderParts = [];
        
        var borderInsets = this.component.render("borderInsets", 
                Extras.Sync.Group.DEFAULT_BORDER_INSETS);
        var borderPixelInsets = Echo.Sync.Insets.toPixels(borderInsets);
        var flags = this.component.render("ieAlphaRenderBorder") 
                ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        var topRightElem = document.createElement("div");
        topRightElem.style.width = "100%";
        Echo.Sync.FillImage.render(this._getBorderImage(2, "100%", "100%"), topRightElem, flags);
        
        var topLeftElem = document.createElement("div");
        topLeftElem.style.paddingRight = borderPixelInsets.right + "px";
        topLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(0, 0, "100%"), topLeftElem, flags);
        topRightElem.appendChild(topLeftElem);
        
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
                        this._getRepeatingBorderImage(1, "repeat-x", 0, "100%"), topPosElem, flags);
                topRowElem.appendChild(topPosElem);
            }
            
            var titleElem = document.createElement("td");
            titleElem.style.whiteSpace = "nowrap";
            Echo.Sync.Font.render(this.component.render("titleFont"), titleElem);
            Echo.Sync.Insets.render(this.component.render("titleInsets",
                    Extras.Sync.Group.DEFAULT_TITLE_INSETS), titleElem, "padding");
            var titleImage = this.component.render("titleBackgroundImage");
            if (titleImage) {
                Echo.Sync.FillImage.render({ url: titleImage, repeat: "repeat-x", x: 0, y: "100%" }, titleElem, flags);
            }
            titleElem.appendChild(document.createTextNode(title));
            topRowElem.appendChild(titleElem);
            
            var topFillElem = document.createElement("td");
            if (titlePosition && Echo.Sync.Extent.isPercent(titlePosition)) {
                topFillElem.style.width = (100 - parseInt(titlePosition)) + "%";
            } else {
                topFillElem.style.width = "100%";
            }
            topFillElem.style.height = borderPixelInsets.top + "px";
            Echo.Sync.FillImage.render(this._getRepeatingBorderImage(1, "repeat-x", 0, "100%"), 
                    topFillElem, flags);
            topRowElem.appendChild(topFillElem);
            
            topLeftElem.appendChild(topTableElem);
        } else {
            var topElem = document.createElement("div");
            topElem.style.width = "100%";
            topElem.style.height = borderPixelInsets.top + "px";
            topElem.style.fontSize = "1px";
            Echo.Sync.FillImage.render(this._getRepeatingBorderImage(1, "repeat-x", 0, "100%"), 
                    topElem, flags);
            topLeftElem.appendChild(topElem);
        }
        
        borderParts.push(topRightElem);
        
        var rightElem = document.createElement("div");
        rightElem.style.width = "100%";
        Echo.Sync.FillImage.render(this._getRepeatingBorderImage(4, "repeat-y", "100%", 0), 
                rightElem, flags);
        
        var leftElem = document.createElement("div");
        leftElem.style.paddingRight = borderPixelInsets.right + "px";
        leftElem.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getRepeatingBorderImage(3, "repeat-y", 0, 0), 
                leftElem, flags);
        leftElem.appendChild(contentElem);
        rightElem.appendChild(leftElem);
        borderParts.push(rightElem);
        
        var bottomRightElem = document.createElement("div");
        bottomRightElem.style.width = "100%";
        bottomRightElem.style.height = borderPixelInsets.bottom + "px";
        bottomRightElem.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getBorderImage(7, "100%", "100%"), bottomRightElem, flags);
        
        var bottomLeftElem = document.createElement("div");
        bottomLeftElem.style.paddingRight = borderPixelInsets.right + "px";
        bottomLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
        Echo.Sync.FillImage.render(this._getBorderImage(5, 0, "100%"), bottomLeftElem, flags);
        bottomRightElem.appendChild(bottomLeftElem);
        
        var bottomElem = document.createElement("div");
        bottomElem.style.width = "100%";
        bottomElem.style.height = borderPixelInsets.bottom + "px";
        bottomElem.style.fontSize = "1px";
        Echo.Sync.FillImage.render(this._getRepeatingBorderImage(6, "repeat-x", 0, "100%"), 
                bottomElem, flags);
        bottomLeftElem.appendChild(bottomElem);
        borderParts.push(bottomRightElem);
        
        return borderParts;
    },
    
    _renderContent: function(update) {
        var contentDivElement = document.createElement("div");
        
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), contentDivElement);
        Echo.Sync.Color.render(this.component.render("background"), contentDivElement, "backgroundColor")
        Echo.Sync.Font.render(this.component.render("font"), contentDivElement);
        Echo.Sync.Insets.render(this.component.render("insets"), contentDivElement, "padding");
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; i++) {
            var child = this.component.getComponent(i);
            Echo.Render.renderComponentAdd(update, child, contentDivElement);
        }
        
        return contentDivElement;
    },
    
    renderUpdate: function(update) {
        var element = this._groupDivElement;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    renderDispose: function(update) {
        this._borderImages = null;
        this._groupDivElement.id = "";
        this._groupDivElement = null;
    }
});
