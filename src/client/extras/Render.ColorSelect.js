ExtrasRender.ComponentSync.ColorSelect = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.ColorSelect", this);
    },
    
    _h: 0,
    _s: 0,
    _v: 0,

    _processHMouseMoveRef: null,
    _processHMouseUpRef: null,
    _processSVMouseMoveRef: null,
    _processSVMouseUpRef: null,

    $construct: function() {
        this._processHMouseMoveRef = Core.method(this, this._processHMouseMove);
        this._processHMouseUpRef = Core.method(this, this._processHMouseUp);
        this._processSVMouseMoveRef = Core.method(this, this._processSVMouseMove);
        this._processSVMouseUpRef = Core.method(this, this._processSVMouseUp);
    },
        
    _hsvToRgb: function(h, s, v) {
        var r, g, b;
        if (s == 0) {
            r = g = b = v;
        } else {
            h /= 60;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));
            switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            default:
                r = v;
                g = p;
                b = q;
                break;
            }
        }
        return new ExtrasRender.ComponentSync.ColorSelect.RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    },
    
    _processHMouseDown: function(e) {
        WebCore.EventProcessor.add(this._hListenerDivElement, "mousemove", this._processHMouseMoveRef, false);
        WebCore.EventProcessor.add(this._hListenerDivElement, "mouseup", this._processHMouseUpRef, false);
        this._processHUpdate(e);
    },
    
    _processHMouseMove: function(e) {
        this._processHUpdate(e);
    },
    
    _processHMouseUp: function(e) {
        WebCore.EventProcessor.remove(this._hListenerDivElement, "mousemove", this._processHMouseMoveRef, false);
        WebCore.EventProcessor.remove(this._hListenerDivElement, "mouseup", this._processHMouseUpRef, false);
        this._storeColor();
    },
    
    _processHUpdate: function(e) {
        var bounds = new WebCore.Measure.Bounds(this._hListenerDivElement);
        this._h = (this._saturationHeight - (e.clientY - bounds.top - 7)) * 360 / this._saturationHeight;
        this._updateDisplayedColor();
    },
    
    _processSVMouseDown: function(e) {
        WebCore.EventProcessor.add(this._svListenerDivElement, "mousemove", this._processSVMouseMoveRef, false);
        WebCore.EventProcessor.add(this._svListenerDivElement, "mouseup", this._processSVMouseUpRef, false);
        this._processSVUpdate(e);
    },
    
    _processSVMouseMove: function(e) {
        this._processSVUpdate(e);
    },
    
    _processSVMouseUp: function(e) {
        WebCore.EventProcessor.remove(this._svListenerDivElement, "mousemove", this._processSVMouseMoveRef, false);
        WebCore.EventProcessor.remove(this._svListenerDivElement, "mouseup", this._processSVMouseUpRef, false);
        this._storeColor();
    },
    
    _processSVUpdate: function(e) {
        var bounds = new WebCore.Measure.Bounds(this._svListenerDivElement);
        this._v = (e.clientX - bounds.left - 7) / this._valueWidth;
        this._s = 1 - ((e.clientY - bounds.top - 7) / this._saturationHeight);
        this._updateDisplayedColor();
    },
    
    renderAdd: function(update, parentElement) {
        this._valueWidth = EchoAppRender.Extent.toPixels(
                this.component.render("valueWidth", ExtrasApp.ColorSelect.DEFAULT_VALUE_WIDTH), true);
        this._saturationHeight = EchoAppRender.Extent.toPixels(
                this.component.render("saturationHeight", ExtrasApp.ColorSelect.DEFAULT_SATURATION_HEIGHT), false);
        this._hueWidth = EchoAppRender.Extent.toPixels(
                this.component.render("hueWidth", ExtrasApp.ColorSelect.DEFAULT_HUE_WIDTH), true);
    
        var svGradientImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectSVGradient.png");
        var hGradientImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectHGradient.png");
        var arrowDownImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectArrowDown.gif");
        var arrowUpImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectArrowUp.gif");
        var arrowRightImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectArrowRight.gif");
        var arrowLeftImageSrc = this.client.getResourceUrl("Extras", "image/ColorSelectArrowLeft.gif");
        
        // Create container div element, relatively positioned.
        this._containerDivElement = document.createElement("div");
        this._containerDivElement.style.position = "relative";
        this._containerDivElement.style.left = "0px";
        this._containerDivElement.style.top = "0px";
        this._containerDivElement.style.width = (this._valueWidth + this._hueWidth + 29) + "px";
        this._containerDivElement.style.height = (this._saturationHeight + 36) +"px";
        this._containerDivElement.style.overflow = "hidden";
        
        // Create saturation / value selector.
        this._svDivElement = document.createElement("div");
        this._svDivElement.style.position = "absolute";
        this._svDivElement.style.left = "7px";
        this._svDivElement.style.top = "7px";
        this._svDivElement.style.width = this._valueWidth + "px";
        this._svDivElement.style.height = this._saturationHeight + "px";
        this._svDivElement.style.backgroundColor = "#ff0000";
        this._containerDivElement.appendChild(this._svDivElement);
        
        if (svGradientImageSrc) {
            if (WebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
                this._svDivElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader("
                        + "src='" + svGradientImageSrc + "', sizingMethod='scale');";
            } else {
                var svGradientImgElement = document.createElement("img");
                svGradientImgElement.src = svGradientImageSrc;
                svGradientImgElement.style.width = this._valueWidth + "px";
                svGradientImgElement.style.height = this._saturationHeight + "px";
                this._svDivElement.appendChild(svGradientImgElement);
            }
        }
        
        // Create container for value selecion bar.
        this._vLineDivElement = document.createElement("div");
        this._vLineDivElement.style.position = "absolute";
        this._vLineDivElement.style.left = "2px";
        this._vLineDivElement.style.top = "0px";
        this._vLineDivElement.style.width = "11px";
        this._vLineDivElement.style.height = (this._saturationHeight + 14) + "px";
        this._vLineDivElement.style.overflow = "hidden";
        this._containerDivElement.appendChild(this._vLineDivElement);
    
        // Create value selection bar top arrow.
        if (arrowDownImageSrc) {
            var vLineTopImgElement = document.createElement("img");
            vLineTopImgElement.src = arrowDownImageSrc;
            vLineTopImgElement.style.position = "absolute";
            vLineTopImgElement.style.left = "0px";
            vLineTopImgElement.style.top = "0px";
            this._vLineDivElement.appendChild(vLineTopImgElement);
        }
        
        // Create value selection bar line.
        var vLineBarDivElement = document.createElement("div");
        vLineBarDivElement.style.position = "absolute";
        vLineBarDivElement.style.top = "7px";
        vLineBarDivElement.style.left = "5px";
        vLineBarDivElement.style.height = this._saturationHeight + "px";
        vLineBarDivElement.style.width = "1px";
        vLineBarDivElement.style.backgroundColor = "#000000";
        this._vLineDivElement.appendChild(vLineBarDivElement);
    
        // Create value selection bar bottom arrow.
        if (arrowUpImageSrc) {
            var vLineBottomImgElement = document.createElement("img");
            vLineBottomImgElement.src = arrowUpImageSrc;
            vLineBottomImgElement.style.position = "absolute";
            vLineBottomImgElement.style.left = "0px";
            vLineBottomImgElement.style.top = (this._saturationHeight + 7) + "px";
            this._vLineDivElement.appendChild(vLineBottomImgElement);
        }
        
        // Create saturation selection bar container.
        this._sLineDivElement = document.createElement("div");
        this._sLineDivElement.style.position = "absolute";
        this._sLineDivElement.style.left = "0px";
        this._sLineDivElement.style.top = (this._saturationHeight + 2) + "px";
        this._sLineDivElement.style.height = "11px";
        this._sLineDivElement.style.width = (this._valueWidth + 14) + "px";
        this._sLineDivElement.style.overflow = "hidden";
        this._containerDivElement.appendChild(this._sLineDivElement);
        
        // Create saturation selection bar left arrow.
        if (arrowRightImageSrc) {
            var sLineLeftImgElement = document.createElement("img");
            sLineLeftImgElement.src = arrowRightImageSrc;
            sLineLeftImgElement.style.position = "absolute";
            sLineLeftImgElement.style.left = "0px";
            sLineLeftImgElement.style.top = "0px";
            this._sLineDivElement.appendChild(sLineLeftImgElement);
        }
        
        // Create saturation selection bar line.
        var sLineBarDivElement = document.createElement("div");
        sLineBarDivElement.style.position = "absolute";
        sLineBarDivElement.style.left = "0px";
        sLineBarDivElement.style.left = "7px";
        sLineBarDivElement.style.top = "5px";
        sLineBarDivElement.style.width = this._valueWidth + "px";
        sLineBarDivElement.style.height = "1px";
        sLineBarDivElement.style.fontSize = "1px";
        sLineBarDivElement.style.borderTop = "1px #000000 solid";
        sLineBarDivElement.style.lineHeight = "0";
        this._sLineDivElement.appendChild(sLineBarDivElement);
    
        // Create saturation selection bar right arrow.
        if (arrowLeftImageSrc) {
            var sLineRightImgElement = document.createElement("img");
            sLineRightImgElement.src = arrowLeftImageSrc;
            sLineRightImgElement.style.position = "absolute";
            sLineRightImgElement.style.left = this._valueWidth + 7 + "px";
            sLineRightImgElement.style.top = "0px";
            this._sLineDivElement.appendChild(sLineRightImgElement);
        }
        
        // Create hue selector.
        var hDivElement = document.createElement("div");
        hDivElement.style.position = "absolute";
        hDivElement.style.left = (this._valueWidth + 22) + "px";
        hDivElement.style.top = "7px";
        hDivElement.style.width = this._hueWidth + "px";
        hDivElement.style.height = this._saturationHeight + "px";
        this._containerDivElement.appendChild(hDivElement);
    
        if (hGradientImageSrc) {
            var hGradientImgElement = document.createElement("img");
            hGradientImgElement.src = hGradientImageSrc;
            hGradientImgElement.style.position = "absolute";
            hGradientImgElement.style.left = "0px";
            hGradientImgElement.style.top = "0px";
            hGradientImgElement.style.width = this._hueWidth + "px";
            hGradientImgElement.style.height = this._saturationHeight + "px";
            hDivElement.appendChild(hGradientImgElement);
        }
        
        this._hLineDivElement = document.createElement("div");
        this._hLineDivElement.style.position = "absolute";
        this._hLineDivElement.style.left = (this._valueWidth + 15) + "px";
        this._hLineDivElement.style.top = (this._saturationHeight + 2) + "px";
        this._hLineDivElement.style.height = "11px";
        this._hLineDivElement.style.width = (this._hueWidth + 14) + "px";
        this._hLineDivElement.style.overflow = "hidden";
        this._containerDivElement.appendChild(this._hLineDivElement);
        
        if (arrowRightImageSrc) {
            var hLineLeftImgElement = document.createElement("img");
            hLineLeftImgElement.src = arrowRightImageSrc;
            hLineLeftImgElement.style.position = "absolute";
            hLineLeftImgElement.style.left = "0px";
            hLineLeftImgElement.style.top = "0px";
            this._hLineDivElement.appendChild(hLineLeftImgElement);
        }
    
        if (arrowLeftImageSrc) {
            var hLineRightImgElement = document.createElement("img");
            hLineRightImgElement.src = arrowLeftImageSrc;
            hLineRightImgElement.style.position = "absolute";
            hLineRightImgElement.style.left = (this._hueWidth + 7) + "px";
            hLineRightImgElement.style.top = "0px";
            this._hLineDivElement.appendChild(hLineRightImgElement);
        }
        
        var hLineBarDivElement = document.createElement("div");
        hLineBarDivElement.style.position = "absolute";
        hLineBarDivElement.style.left = "0px";
        hLineBarDivElement.style.left = "7px";
        hLineBarDivElement.style.top = "5px";
        hLineBarDivElement.style.width = this._hueWidth + "px";
        hLineBarDivElement.style.height = "1px";
        hLineBarDivElement.style.fontSize = "1px";
        hLineBarDivElement.style.borderTop = "1px #000000 solid";
        hLineBarDivElement.style.lineHeight = "0";
        this._hLineDivElement.appendChild(hLineBarDivElement);
        
        this._colorDivElement = document.createElement("div");
        this._colorDivElement.style.position = "absolute";
        this._colorDivElement.style.left = "7px";
        this._colorDivElement.style.top = (this._saturationHeight + 16) + "px";
        this._colorDivElement.style.width = (this._valueWidth + this._hueWidth + 13) + "px";
        this._colorDivElement.style.height = "18px";
        this._colorDivElement.style.color = "#ffffff";
        this._colorDivElement.style.backgroundColor = "#000000";
        this._colorDivElement.style.borderColor = "#000000";
        this._colorDivElement.style.borderStyle = "outset";
        this._colorDivElement.style.borderWidth = "1px";
        this._colorDivElement.style.fontFamily = "monospace";
        this._colorDivElement.style.textAlign = "center";
        if (this.component.render("displayValue")) {
            this._colorDivElement.appendChild(document.createTextNode("#000000"));
        }
        this._containerDivElement.appendChild(this._colorDivElement);
        
        this._svListenerDivElement = document.createElement("div");
        this._svListenerDivElement.style.position = "absolute";
        this._svListenerDivElement.style.zIndex = "1";
        this._svListenerDivElement.style.left = "0px";
        this._svListenerDivElement.style.top = "0px";
        this._svListenerDivElement.style.width = (this._valueWidth + 14) + "px";
        this._svListenerDivElement.style.height = (this._saturationHeight + 14) + "px";
        this._svListenerDivElement.style.cursor = "crosshair";
    //    this._svListenerDivElement.style.backgroundImage = "url(" + this.transparentImageSrc + ")";
        this._containerDivElement.appendChild(this._svListenerDivElement);
        
        this._hListenerDivElement = document.createElement("div");
        this._hListenerDivElement.id = this.elementId + "_hlistener";
        this._hListenerDivElement.style.position = "absolute";
        this._hListenerDivElement.style.zIndex = "1";
        this._hListenerDivElement.style.left = (this._valueWidth + 15) + "px";
        this._hListenerDivElement.style.top = "0px";
        this._hListenerDivElement.style.width = (this._hueWidth + 14) + "px";
        this._hListenerDivElement.style.height = (this._saturationHeight + 16) + "px";
        this._hListenerDivElement.style.cursor = "crosshair";
    //    this._hListenerDivElement.style.backgroundImage = "url(" + this.transparentImageSrc + ")";
        this._containerDivElement.appendChild(this._hListenerDivElement);
    
        parentElement.appendChild(this._containerDivElement);
        
        WebCore.EventProcessor.add(this._svListenerDivElement, "mousedown", Core.method(this, this._processSVMouseDown), false);
        WebCore.EventProcessor.add(this._hListenerDivElement, "mousedown", Core.method(this, this._processHMouseDown), false);
        this._setColor(this.component.get("color"));
    },
    
    renderDispose: function(update) { 
        this._containerDivElement = null;
        this._svDivElement = null;
        this._svListenerDivElement = null;
        this._hListenerDivElement = null;
        this._hLineDivElement = null;
        this._sLineDivElement = null;
        this._vLineDivElement = null;
    },
    
    renderUpdate: function(update) {
        var containerDivElement = this._containerDivElement;
        var parentElement = containerDivElement.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        parentElement.removeChild(containerDivElement);
        this.renderAdd(update, parentElement);
        return false;
    },
    
    /**
     * Sets the selected color.
     *
     * @param rgb the color to select as an 24 bit hexadecimal string color value
     * @private
     */
    _setColor: function(color) {
        var r, g, b;
        
        if (color) {
            // Remove leading #.
            color = color.substring(1); 
            r = (parseInt(parseInt(color, 16) / 0x10000)) / 255;
            g = (parseInt(parseInt(color, 16) / 0x100) % 0x100) / 255;
            b = (parseInt(color, 16) % 0x100) / 255;
        } else {
            r = g = b = 0;
        }
        
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        this._v = max;
        
        var delta = max - min;
        if (max == 0 || delta == 0) {
            this._s = 0;
            this._h = 0;
        } else {
            this._s = delta / max;
            if (r == max) {
                this._h = 60 * ((g - b) / delta);
            } else if (g == max) {
                this._h = 60 * (2 + (b - r) / delta);
            } else {
                this._h = 60 * (4 + (r - g) / delta);
            }
            if (this._h < 0) {
                this._h += 360;
            }
        }


        this._updateDisplayedColor();
    },
    
    /**
     * Stores color value in _h, _s, and _v in the component object.
     * @private
     */
    _storeColor: function() {
        var renderColor = this._hsvToRgb(this._h, this._s, this._v);
        var renderHexTriplet = renderColor.toHexTriplet();
        this.component.set("color", renderHexTriplet);
    },
    
    _updateDisplayedColor: function() {
        var baseColor;
    //    if (this.enabled) {
            baseColor = this._hsvToRgb(this._h, 1, 1);
    //    } else {
    //        baseColor = ExtrasColorSelect.hsvToRgb(this.h, 0.3, 0.7);
    //    }
        this._svDivElement.style.backgroundColor = baseColor.toHexTriplet();
    
        var renderColor = this._hsvToRgb(this._h, this._s, this._v);
        
        var renderHexTriplet = renderColor.toHexTriplet();
        this._colorDivElement.style.backgroundColor = renderHexTriplet;
        this._colorDivElement.style.borderColor = renderHexTriplet;
        this._colorDivElement.style.color = this._v < 0.67 ? "#ffffff" : "#000000";
        if (this.component.render("displayValue")) {
            this._colorDivElement.childNodes[0].nodeValue = renderHexTriplet;
        }
        
        var sLineTop = parseInt((1 - this._s) * this._saturationHeight) + 2;
        if (sLineTop < 2) {
             sLineTop = 2;
        } else if (sLineTop > this._saturationHeight + 2) {
            sLineTop = this._saturationHeight + 2;
        }
        this._sLineDivElement.style.top = sLineTop + "px";
        
        var vLineLeft = parseInt(this._v * this._valueWidth) + 2;
        if (vLineLeft < 2) {
            vLineLeft = 2;
        } else if (vLineLeft > this._valueWidth + 2) {
            vLineLeft = this._valueWidth + 2;
        }
        this._vLineDivElement.style.left = vLineLeft + "px";
        
        var hLineTop = parseInt((360 - this._h) / 360 * this._saturationHeight) + 2;
        if (hLineTop < 2) {
            hLineTop = 2;
        } else if (hLineTop > this._saturationHeight + 2) {
            hLineTop = this._saturationHeight + 2;
        }
        this._hLineDivElement.style.top = hLineTop + "px";
    }
});

ExtrasRender.ComponentSync.ColorSelect.RGB = Core.extend({

    $construct: function(r, g, b) {
        this.r = this._clean(r);
        this.g = this._clean(g);
        this.b = this._clean(b);
    },
    
    _clean: function(value) {
        value = value ? parseInt(value) : 0;
        if (value < 0) {
            return 0;
        } else if (value > 255) {
            return 255;
        } else {
            return value;
        }
    },
    
    toHexTriplet: function() {
        var rString = this.r.toString(16);
        if (rString.length == 1) {
            rString = "0" + rString;
        }
        var gString = this.g.toString(16);
        if (gString.length == 1) {
            gString = "0" + gString;
        }
        var bString = this.b.toString(16);
        if (bString.length == 1) {
            bString = "0" + bString;
        }
        return "#" + rString + gString + bString;
    },
    
    toString: function() {
        return this.toHexTriplet();
    }
});
