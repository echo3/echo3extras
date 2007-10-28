/**
 * Component rendering peer: Group
 */
ExtrasRender.ComponentSync.Group = EchoCore.extend(EchoRender.ComponentSync, {

    global: {
    
        DEFAULT_TITLE_INSETS: new EchoApp.Insets(0, 2),
        
        DEFAULT_BORDER_INSETS: new EchoApp.Insets(10),
    
        /**
         * Gets an URI for default border images.
         * 
         * @param {String} identifier the image identifier
         * @return the image URI
         * @type {String}
         */
        _getImageUri: function(identifier) {
            // FIXME abstract this somehow so it works with FreeClient too
            return "?sid=Echo.Image&iid=EchoExtras.Group." + identifier;
        }
    },

    globalInitialize: function() {
        EchoRender.registerPeer("nextapp.echo.extras.app.Group", this);
    },

    initialize: function() {
    	this._groupDivElement = null;
    	this._borderImages = null;
    },
    
    getElement: function() {
    	return this._groupDivElement;
    },
    
    renderAdd: function(update, parentElement) {
    	this._borderImages = this.component.getRenderProperty("borderImage");
    	
        this._groupDivElement = document.createElement("div");
        this._groupDivElement.id = this.component.renderId;
        EchoAppRender.Color.renderComponentProperty(this.component, "foreground", null, this._groupDivElement, "color")
    
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
    		image = new EchoApp.ImageReference(ExtrasRender.ComponentSync.Group._getImageUri("border" + position));
    	}
    	if (image) {
    		return new EchoApp.FillImage(image, repeat, x, y);
    	}
    },
    
    _getBorderImage: function(position, x, y) {
    	return this._getRepeatingBorderImage(position, EchoApp.FillImage.NO_REPEAT, x, y);
    },
    
    _renderBorder: function(contentElem) {
    	var borderParts = [];
    	
    	var borderInsets = this.component.getRenderProperty("borderInsets", 
    	        ExtrasRender.ComponentSync.Group.DEFAULT_BORDER_INSETS);
        var borderPixelInsets = EchoAppRender.Insets.toPixels(borderInsets);
        var flags = this.component.getRenderProperty("ieAlphaRenderBorder") 
                ? EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        var topRightElem = document.createElement("div");
        topRightElem.style.width = "100%";
        EchoAppRender.FillImage.render(this._getBorderImage(2, "100%", "100%"), topRightElem, flags);
        
        var topLeftElem = document.createElement("div");
        topLeftElem.style.paddingRight = borderPixelInsets.right + "px";
        topLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
        EchoAppRender.FillImage.render(this._getBorderImage(0, "0px", "100%"), topLeftElem, flags);
    	topRightElem.appendChild(topLeftElem);
    	
    	var title = this.component.getRenderProperty("title");
    	if (title) {
    	    var topTableElem = document.createElement("table");
    	    topTableElem.style.padding = "0px";
    	    topTableElem.style.borderCollapse = "collapse";
    	    topTableElem.style.width = "100%";
    	    var topTbodyElem = document.createElement("tbody");
    	    topTableElem.appendChild(topTbodyElem);
    	    var topRowElem = document.createElement("tr");
    	    topTbodyElem.appendChild(topRowElem);
    	    
    	    var titlePosition = this.component.getRenderProperty("titlePosition");
    	    if (titlePosition) {
    		    var topPosElem = document.createElement("td");
    		    if (titlePosition.units == "%") {
    		    	topPosElem.style.width = titlePosition.toString();
    		    }
    		    var topPosElemImg = document.createElement("img");
    		    topPosElemImg.src = EchoRender.Util.TRANSPARENT_IMAGE;
    		    if (titlePosition.units != "%") {
    			    topPosElemImg.style.width = titlePosition.toString();
    		    }
    		    topPosElemImg.style.height = "1px";
    		    topPosElem.appendChild(topPosElemImg);
    		    EchoAppRender.FillImage.render(
    		            this._getRepeatingBorderImage(1, EchoApp.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), topPosElem, flags);
    			topRowElem.appendChild(topPosElem);
    	    }
    	    
    	    var titleElem = document.createElement("td");
    	    titleElem.style.whiteSpace = "nowrap";
    		EchoAppRender.Font.renderComponentProperty(this.component, "titleFont", null, titleElem);
    		EchoAppRender.Insets.renderComponentProperty(this.component, "titleInsets",
                    ExtrasRender.ComponentSync.Group.DEFAULT_TITLE_INSETS, titleElem, "padding");
    		var titleImage = this.component.getRenderProperty("titleBackgroundImage");
    		if (titleImage) {
        		EchoAppRender.FillImage.render(
        		      new EchoApp.FillImage(titleImage, EchoApp.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), titleElem, flags);
    		}
    		titleElem.appendChild(document.createTextNode(title));
    		topRowElem.appendChild(titleElem);
    		
    	    var topFillElem = document.createElement("td");
    		if (titlePosition && titlePosition.units == "%") {
    		    topFillElem.style.width = (100 - titlePosition.value) + "%";
    		} else {
    		    topFillElem.style.width = "100%";
    		}
    	    topFillElem.style.height = borderPixelInsets.top + "px";
    	    EchoAppRender.FillImage.render(this._getRepeatingBorderImage(1, EchoApp.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), 
    	            topFillElem, flags);
    		topRowElem.appendChild(topFillElem);
    		
    	    topLeftElem.appendChild(topTableElem);
    	} else {
    		var topElem = document.createElement("div");
        	topElem.style.width = "100%";
        	topElem.style.height = borderPixelInsets.top + "px";
        	topElem.style.fontSize = "1px";
        	EchoAppRender.FillImage.render(this._getRepeatingBorderImage(1, EchoApp.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), 
        	        topElem, flags);
        	topLeftElem.appendChild(topElem);
    	}
        
    	borderParts.push(topRightElem);
    	
    	var rightElem = document.createElement("div");
        rightElem.style.width = "100%";
        EchoAppRender.FillImage.render(this._getRepeatingBorderImage(4, EchoApp.FillImage.REPEAT_VERTICAL, "100%", "0px"), 
                rightElem, flags);
        
        var leftElem = document.createElement("div");
        leftElem.style.paddingRight = borderPixelInsets.right + "px";
        leftElem.style.paddingLeft = borderPixelInsets.left + "px";
        EchoAppRender.FillImage.render(this._getRepeatingBorderImage(3, EchoApp.FillImage.REPEAT_VERTICAL, "0px", "0px"), 
                leftElem, flags);
    	leftElem.appendChild(contentElem);
    	rightElem.appendChild(leftElem);
    	borderParts.push(rightElem);
    	
    	var bottomRightElem = document.createElement("div");
        bottomRightElem.style.width = "100%";
        bottomRightElem.style.height = borderPixelInsets.bottom + "px";
        bottomRightElem.style.fontSize = "1px";
        EchoAppRender.FillImage.render(this._getBorderImage(7, "100%", "100%"), bottomRightElem, flags);
        
        var bottomLeftElem = document.createElement("div");
        bottomLeftElem.style.paddingRight = borderPixelInsets.right + "px";
        bottomLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
        EchoAppRender.FillImage.render(this._getBorderImage(5, "0px", "100%"), bottomLeftElem, flags);
    	bottomRightElem.appendChild(bottomLeftElem);
        
    	var bottomElem = document.createElement("div");
        bottomElem.style.width = "100%";
        bottomElem.style.height = borderPixelInsets.bottom + "px";
        bottomElem.style.fontSize = "1px";
        EchoAppRender.FillImage.render(this._getRepeatingBorderImage(6, EchoApp.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), 
                bottomElem, flags);
    	bottomLeftElem.appendChild(bottomElem);
    	borderParts.push(bottomRightElem);
    	
    	return borderParts;
    },
    
    _renderContent: function(update) {
        var contentDivElement = document.createElement("div");
        
        EchoAppRender.FillImage.renderComponentProperty(this.component, "backgroundImage", null, contentDivElement);
        EchoAppRender.Color.renderComponentProperty(this.component, "background", null, contentDivElement, "backgroundColor")
        EchoAppRender.Font.renderDefault(this.component, contentDivElement);
        EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, contentDivElement, "padding");
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; i++) {
    	    var child = this.component.getComponent(i);
    	    EchoRender.renderComponentAdd(update, child, contentDivElement);
        }
        
        return contentDivElement;
    },
    
    renderUpdate: function(update) {
        var element = this._groupDivElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
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
