/**
 * Component rendering peer: BorderPane
 */
ExtrasRender.ComponentSync.BorderPane = function() { };

ExtrasRender.ComponentSync.BorderPane.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.BorderPane.prototype.renderAdd = function(update, parentElement) {
    var element = this._renderMain(update);
    
    parentElement.appendChild(element);
};

ExtrasRender.ComponentSync.BorderPane.prototype._renderMain = function(update) {
    var borderPaneDivElement = document.createElement("div");
    borderPaneDivElement.id = this.component.renderId;

    borderPaneDivElement.style.padding = "0px";
    borderPaneDivElement.style.zIndex = 1;
    borderPaneDivElement.style.overflow = "hidden";
    borderPaneDivElement.style.position = "absolute";
    borderPaneDivElement.style.left = "0px";
    borderPaneDivElement.style.top = "0px";
    borderPaneDivElement.style.width = "100%";
    borderPaneDivElement.style.height = "100%";
    
    var borderElements = this._renderBorder();
    for (var i = 0; i < borderElements.length; i++) {
	    borderPaneDivElement.appendChild(borderElements[i]);
    }
    borderPaneDivElement.appendChild(this._renderContent(update));
    
    return borderPaneDivElement;
};

ExtrasRender.ComponentSync.BorderPane.prototype._renderBorder = function() {
	var borderElements = new Array();
	
    var border = this.component.getRenderProperty("border", ExtrasApp.BorderPane.DEFAULT_BORDER);
    var borderInsets = EchoRender.Property.Insets.toPixels(border.borderInsets);
    var flags = this.component.getRenderProperty("ieAlphaRenderBorder") 
            ? EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
    
    // Render top row
    if (borderInsets.top > 0) {
        // Render top left corner
        if (borderInsets.left > 0) {
            borderElements.push(this._renderBorderPart(border, 0, flags, borderInsets.left, borderInsets.top, 0, null, null, 0));
        }
        // Render top side
        borderElements.push(this._renderBorderPart(border, 1, flags, null, borderInsets.top, 0, borderInsets.right, null, borderInsets.left));
        // Render top right corner
        if (borderInsets.right > 0) {
	        borderElements.push(this._renderBorderPart(border, 2, flags, borderInsets.right, borderInsets.top, 0, 0, null, null));
        }
    }
    // Render left side
    if (borderInsets.left > 0) {
        borderElements.push(this._renderBorderPart(border, 3, flags, borderInsets.left, null, borderInsets.top, null, borderInsets.bottom, 0));
    }
    // Render right side
    if (borderInsets.right > 0) {
        borderElements.push(this._renderBorderPart(border, 4, flags, borderInsets.right, null, borderInsets.top, 0, borderInsets.bottom, null));
    }
    // Render bottom row
    if (borderInsets.bottom > 0) {
        // Render bottom left corner
        if (borderInsets.left > 0) {
	        borderElements.push(this._renderBorderPart(border, 5, flags, borderInsets.left, borderInsets.bottom, null, null, 0, 0));
        }
        // Render bottom side
        borderElements.push(this._renderBorderPart(border, 6, flags, null, borderInsets.bottom, null, borderInsets.right, 0, borderInsets.left));
        // Render bottom right corner
        if (borderInsets.right > 0) {
	        borderElements.push(this._renderBorderPart(border, 7, flags, borderInsets.right, borderInsets.bottom, null, 0, 0, null));
        }
    }
    
	return borderElements;
};

ExtrasRender.ComponentSync.BorderPane.prototype._renderBorderPart = function(border, pos, flags, width, height, top, right, bottom, left) {
	var borderDivElement = document.createElement("div");
    borderDivElement.id = this.component.renderId + "_border_" + pos;
    
    borderDivElement.style.fontSize = "1px";
    borderDivElement.style.position = "absolute";
	if (width != null) {
		borderDivElement.style.width = width + "px";
	}
	if (height != null) {
	    borderDivElement.style.height = height + "px";
	}
    if (top != null) {
	    borderDivElement.style.top = top + "px";
    }
    if (right != null) {
	    borderDivElement.style.right = right + "px";
    }
    if (bottom != null) {
	    borderDivElement.style.bottom = bottom + "px";
    }
    if (left != null) {
	    borderDivElement.style.left = left + "px";
    }
    
    if (border.color) {
    	EchoRender.Property.Color.render(border.color, borderDivElement, "backgroundColor");
    }
    if (border.fillImages[pos]) {
        EchoRender.Property.FillImage.render(border.fillImages[pos], borderDivElement, flags);
    }
    
    if ((top != null && bottom != null) || (left != null && right != null)) {
	    EchoWebCore.VirtualPosition.register(borderDivElement.id);
    }
    
    return borderDivElement;
};

ExtrasRender.ComponentSync.BorderPane.prototype._renderContent = function(update) {
    var contentDivElement = document.createElement("div");
    contentDivElement.id = this.component.renderId + "_content";
    
    contentDivElement.style.position = "absolute";
    contentDivElement.style.zIndex = 2;
    contentDivElement.style.overflow = "auto";
    
    EchoRender.Property.Color.renderFB(this.component, contentDivElement);
    EchoRender.Property.Font.renderDefault(this.component, contentDivElement);

    var border = this.component.getRenderProperty("border", ExtrasApp.BorderPane.DEFAULT_BORDER);
    var contentInsets = EchoRender.Property.Insets.toPixels(border.contentInsets);

    contentDivElement.style.top = contentInsets.top + "px";
    contentDivElement.style.left = contentInsets.left + "px";
    contentDivElement.style.right = contentInsets.right + "px";
    contentDivElement.style.bottom = contentInsets.bottom + "px";
    
    var componentCount = this.component.getComponentCount();
    if (componentCount == 1) {
	    var child = this.component.getComponent(0);
	    var insets = this._getContentInsets(child);
	    if (insets) {
	    	EchoRender.Property.Insets.renderPixel(insets, contentDivElement, "padding");
	    }
	    EchoRender.renderComponentAdd(update, child, contentDivElement);
    } else if (componentCount > 1) {
        throw new Error("Too many children: " + componentCount);
    }
    
    EchoWebCore.VirtualPosition.register(contentDivElement.id);
    
    return contentDivElement;
};

ExtrasRender.ComponentSync.BorderPane.prototype._getContentInsets = function(child) {
	if (child.componentType.indexOf("Pane") == -1) {
		// FIXME use instanceof
		return this.component.getRenderProperty("insets");
	}
	return null;
};

ExtrasRender.ComponentSync.BorderPane.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

ExtrasRender.ComponentSync.BorderPane.prototype.renderDispose = function(update) {
};

EchoRender.registerPeer("nextapp.echo.extras.app.BorderPane", ExtrasRender.ComponentSync.BorderPane);
