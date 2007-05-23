/**
 * Component rendering peer: Group
 */
ExtrasRender.ComponentSync.Group = function() {
	this._borderImages = null;
};

ExtrasRender.ComponentSync.Group.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.Group.DEFAULT_TITLE_INSETS = new EchoApp.Property.Insets(0, 2);

ExtrasRender.ComponentSync.Group.DEFAULT_BORDER_INSETS = new EchoApp.Property.Insets(10);

/**
 * Gets an URI for default border images.
 * 
 * @param {String} identifier the image identifier
 * @return the image URI
 * @type {String}
 */
ExtrasRender.ComponentSync.Group._getImageUri = function(identifier) {
	// FIXME abstract this somehow so it works with FreeClient too
	return "?sid=EchoExtras.Group.Image&imageuid=" + identifier;
};

ExtrasRender.ComponentSync.Group.prototype.renderAdd = function(update, parentElement) {
	this._borderImages = this.component.getRenderProperty("borderImage");
	
    var groupDivElement = document.createElement("div");
    groupDivElement.id = this.component.renderId;
    EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", null, groupDivElement, "color")

    var contentElement = this._renderContent();
    var borderParts = this._renderBorder(contentElement);
    for (var i = 0; i < borderParts.length; i++) {
	    groupDivElement.appendChild(borderParts[i]);
    }
    
    parentElement.appendChild(groupDivElement);
};

ExtrasRender.ComponentSync.Group.prototype._getRepeatingBorderImage = function(position, repeat, x, y) {
	var image;
	if (this._borderImages) {
		image = this._borderImages[position];
	} else {
		image = new EchoApp.Property.ImageReference(ExtrasRender.ComponentSync.Group._getImageUri("border" + position));
	}
	if (image) {
		return new EchoApp.Property.FillImage(image, repeat, x, y);
	}
};

ExtrasRender.ComponentSync.Group.prototype._getBorderImage = function(position, x, y) {
	return this._getRepeatingBorderImage(position, EchoApp.Property.FillImage.NO_REPEAT, x, y);
};

ExtrasRender.ComponentSync.Group.prototype._renderBorder = function(contentElem) {
	var borderParts = new Array();
	
	var borderInsets = this.component.getRenderProperty("borderInsets", ExtrasRender.ComponentSync.Group.DEFAULT_BORDER_INSETS);
    var borderPixelInsets = EchoRender.Property.Insets.toPixels(borderInsets);
    var flags = this.component.getRenderProperty("ieAlphaRenderBorder") 
            ? EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
    
    var topRightElem = document.createElement("div");
    topRightElem.style.width = "100%";
    EchoRender.Property.FillImage.render(this._getBorderImage(2, "100%", "100%"), topRightElem, flags);
    
    var topLeftElem = document.createElement("div");
    topLeftElem.style.paddingRight = borderPixelInsets.right + "px";
    topLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
    EchoRender.Property.FillImage.render(this._getBorderImage(0, "0px", "100%"), topLeftElem, flags);
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
		    EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(1, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), topPosElem, flags);
			topRowElem.appendChild(topPosElem);
	    }
	    
	    var titleElem = document.createElement("td");
	    titleElem.style.whiteSpace = "nowrap";
		EchoRender.Property.Font.renderComponentProperty(this.component, "titleFont", null, titleElem);
		EchoRender.Property.Insets.renderComponentProperty(this.component, "titleInsets", ExtrasRender.ComponentSync.Group.DEFAULT_TITLE_INSETS, titleElem, "padding");
		var titleImage = this.component.getRenderProperty("titleBackgroundImage");
		if (titleImage) {
    		EchoRender.Property.FillImage.render(new EchoApp.Property.FillImage(titleImage, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), titleElem, flags);
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
	    EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(1, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), topFillElem, flags);
		topRowElem.appendChild(topFillElem);
		
	    topLeftElem.appendChild(topTableElem);
	} else {
		var topElem = document.createElement("div");
    	topElem.style.width = "100%";
    	topElem.style.height = borderPixelInsets.top + "px";
    	EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(1, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), topElem, flags);
    	topLeftElem.appendChild(topElem);
	}
    
	borderParts.push(topRightElem);
	
	var rightElem = document.createElement("div");
    rightElem.style.width = "100%";
    EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(4, EchoApp.Property.FillImage.REPEAT_VERTICAL, "100%", "0px"), rightElem, flags);
    
    var leftElem = document.createElement("div");
    leftElem.style.paddingRight = borderPixelInsets.right + "px";
    leftElem.style.paddingLeft = borderPixelInsets.left + "px";
    EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(3, EchoApp.Property.FillImage.REPEAT_VERTICAL, "0px", "0px"), leftElem, flags);
	leftElem.appendChild(contentElem);
	rightElem.appendChild(leftElem);
	borderParts.push(rightElem);
	
	var bottomRightElem = document.createElement("div");
    bottomRightElem.style.width = "100%";
    bottomRightElem.style.height = borderPixelInsets.bottom + "px";
    EchoRender.Property.FillImage.render(this._getBorderImage(7, "100%", "100%"), bottomRightElem, flags);
    
    var bottomLeftElem = document.createElement("div");
    bottomLeftElem.style.paddingRight = borderPixelInsets.right + "px";
    bottomLeftElem.style.paddingLeft = borderPixelInsets.left + "px";
    EchoRender.Property.FillImage.render(this._getBorderImage(5, "0px", "100%"), bottomLeftElem, flags);
	bottomRightElem.appendChild(bottomLeftElem);
    
	var bottomElem = document.createElement("div");
    bottomElem.style.width = "100%";
    bottomElem.style.height = borderPixelInsets.bottom + "px";
    EchoRender.Property.FillImage.render(this._getRepeatingBorderImage(6, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "0px", "100%"), bottomElem, flags);
	bottomLeftElem.appendChild(bottomElem);
	borderParts.push(bottomRightElem);
	
	return borderParts;
};

ExtrasRender.ComponentSync.Group.prototype._renderContent = function(update) {
    var contentDivElement = document.createElement("div");
    contentDivElement.id = this.component.renderId + "_content";
    
    EchoRender.Property.Color.renderComponentProperty(this.component, "background", null, contentDivElement, "backgroundColor")
    EchoRender.Property.Font.renderDefault(this.component, contentDivElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, contentDivElement, "padding");
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; i++) {
	    var child = this.component.getComponent(i);
	    EchoRender.renderComponentAdd(update, child, contentDivElement);
    }
    
    return contentDivElement;
};

ExtrasRender.ComponentSync.Group.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

ExtrasRender.ComponentSync.Group.prototype.renderDispose = function(update) {
	this._borderImages = null;
};

EchoRender.registerPeer("nextapp.echo.extras.app.Group", ExtrasRender.ComponentSync.Group);