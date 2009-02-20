/**
 * Component rendering peer: ColorSelect.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.ColorSelect = Core.extend(Echo.Render.ComponentSync, {
    
    $static: {
    
        /**
         * Representation of an RGB color.
         */
        RGB: Core.extend({
            
            /** 
             * Red value, 0-255.
             * @type Number
             */
            r: null,
            
            /** 
             * Green value, 0-255.
             * @type Number
             */
            g: null,
            
            /** 
             * Blue value, 0-255.
             * @type Number
             */
            b: null,
        
            /**
             * Creates a new RGB color.
             * 
             * @param {Number} r the red value (0-255)
             * @param {Number} g the green value (0-255)
             * @param {Number} b the blue value (0-255)
             */
            $construct: function(r, g, b) {
                this.r = this._clean(r);
                this.g = this._clean(g);
                this.b = this._clean(b);
            },
            
            /**
             * Bounds the specified value between 0 and 255.
             * 
             * @param {Number} value a color value
             * @return the bounded value
             * @type Number  
             */
            _clean: function(value) {
                value = value ? parseInt(value, 10) : 0;
                if (value < 0) {
                    return 0;
                } else if (value > 255) {
                    return 255;
                } else {
                    return value;
                }
            },
            
            /**
             * Renders the RGB value as a hexadecimal triplet, e.g., #1a2b3c.
             * 
             * @return the hex triplet
             * @type String
             */
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
            
            /** @see Object#toString */
            toString: function() {
                return this.toHexTriplet();
            }
        })
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.ColorSelect", this);
    },
    
    /**
     * Currently selected color hue.  Range: 0 <= h < 360.
     * @type Number
     */
    _h: 0,

    /**
     * Currently selected color saturation.  Range: 0 <= s <= 1
     * @type Number
     */
    _s: 0,

    /**
     * Currently selected color value.  Range: 0 <= v <= 1.
     * @type Number
     */
    _v: 0,

    /**
     * Method reference to _processHMouseMove.
     * @type Function
     */
    _processHMouseMoveRef: null,

    /**
     * Method reference to _processHMouseUp.
     * @type Function
     */
    _processHMouseUpRef: null,

    /**
     * Method reference to _processSVMouseMove.
     * @type Function
     */
    _processSVMouseMoveRef: null,

    /**
     * Method reference to _processSVMouseUp.
     * @type Function
     */
    _processSVMouseUpRef: null,

    $construct: function() {
        this._processHMouseMoveRef = Core.method(this, this._processHMouseMove);
        this._processHMouseUpRef = Core.method(this, this._processHMouseUp);
        this._processSVMouseMoveRef = Core.method(this, this._processSVMouseMove);
        this._processSVMouseUpRef = Core.method(this, this._processSVMouseUp);
    },
        
    /**
     * Converts an HSV color to an RGB color.
     * 
     * @param {Number} h the color hue
     * @param {Number} s the color saturation
     * @param {Number} v the color value
     * @return an RGB color
     * @type Extras.Sync.ColorSelect.RGB 
     */
    _hsvToRgb: function(h, s, v) {
        var r, g, b;
        if (s === 0) {
            r = g = b = v;
        } else {
            h /= 60;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));
            switch (i) {
            case 0:  r = v; g = t; b = p; break;
            case 1:  r = q; g = v; b = p; break;
            case 2:  r = p; g = v; b = t; break;
            case 3:  r = p; g = q; b = v; break;
            case 4:  r = t; g = p; b = v; break;
            default: r = v; g = p; b = q; break;
            }
        }
        return new Extras.Sync.ColorSelect.RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    },
    
    /**
     * Processes a hue selector mouse down event.
     * 
     * @param e the event
     */
    _processHMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return;
        }
        Core.Web.Event.add(this._hListenerDiv, "mousemove", this._processHMouseMoveRef, false);
        Core.Web.Event.add(this._hListenerDiv, "mouseup", this._processHMouseUpRef, false);
        this._processHUpdate(e);
    },
    
    /**
     * Processes a hue selector mouse move event.
     * 
     * @param e the event
     */
    _processHMouseMove: function(e) {
        this._processHUpdate(e);
    },
    
    /**
     * Processes a hue selector mouse up event.
     * 
     * @param e the event
     */
    _processHMouseUp: function(e) {
        Core.Web.Event.remove(this._hListenerDiv, "mousemove", this._processHMouseMoveRef, false);
        Core.Web.Event.remove(this._hListenerDiv, "mouseup", this._processHMouseUpRef, false);
        this._storeColor();
    },
    
    /**
     * Processes a mouse event which will update the selected hue (invoked by mouse/down move events).
     * 
     * @param e the event
     */
    _processHUpdate: function(e) {
        var offset = Core.Web.DOM.getEventOffset(e);
        this._h = (this._saturationHeight - (offset.y - 7)) * 360 / this._saturationHeight;
        this._updateDisplayedColor();
    },
    
    /**
     * Processes a saturation-value selector mouse down event.
     * 
     * @param e the event
     */
    _processSVMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return;
        }
        Core.Web.Event.add(this._svListenerDiv, "mousemove", this._processSVMouseMoveRef, false);
        Core.Web.Event.add(this._svListenerDiv, "mouseup", this._processSVMouseUpRef, false);
        this._processSVUpdate(e);
    },
    
    /**
     * Processes a saturation-value selector mouse move event.
     * 
     * @param e the event
     */
    _processSVMouseMove: function(e) {
        this._processSVUpdate(e);
    },
    
    /**
     * Processes a saturation-value selector mouse up event.
     * 
     * @param e the event
     */
    _processSVMouseUp: function(e) {
        Core.Web.Event.remove(this._svListenerDiv, "mousemove", this._processSVMouseMoveRef, false);
        Core.Web.Event.remove(this._svListenerDiv, "mouseup", this._processSVMouseUpRef, false);
        this._storeColor();
    },
    
    /**
     * Processes a mouse event which will update the selected saturation/value (invoked by mouse/down move events).
     * 
     * @param e the event
     */
    _processSVUpdate: function(e) {
        var offset = Core.Web.DOM.getEventOffset(e);
        this._v = (offset.x - 7) / this._valueWidth;
        this._s = 1 - ((offset.y - 7) / this._saturationHeight);
        this._updateDisplayedColor();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._valueWidth = Echo.Sync.Extent.toPixels(
                this.component.render("valueWidth", Extras.ColorSelect.DEFAULT_VALUE_WIDTH), true);
        this._saturationHeight = Echo.Sync.Extent.toPixels(
                this.component.render("saturationHeight", Extras.ColorSelect.DEFAULT_SATURATION_HEIGHT), false);
        this._hueWidth = Echo.Sync.Extent.toPixels(
                this.component.render("hueWidth", Extras.ColorSelect.DEFAULT_HUE_WIDTH), true);
        var displayHeight = Core.Web.Measure.extentToPixels("1em", false);
    
        var svGradientImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectSVGradient.png");
        var hGradientImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectHGradient.png");
        var arrowDownImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectArrowDown.gif");
        var arrowUpImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectArrowUp.gif");
        var arrowRightImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectArrowRight.gif");
        var arrowLeftImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectArrowLeft.gif");
        
        // Create main container div element, relatively positioned.
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:relative;left:0;top:0;overflow:hidden;";
        this._div.style.width = (this._valueWidth + this._hueWidth + 29) + "px";
        this._div.style.height = (this._saturationHeight + 18 + displayHeight) +"px";
        
        // Create saturation / value selector.
        this._svDiv = document.createElement("div");
        this._svDiv.style.cssText = "position:absolute;left:7px;top:7px;background-color:#ff0000";
        this._svDiv.style.width = this._valueWidth + "px";
        this._svDiv.style.height = this._saturationHeight + "px";
        this._div.appendChild(this._svDiv);
        
        if (svGradientImageSrc) {
            if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
                this._svDiv.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" +
                        "src='" + svGradientImageSrc + "', sizingMethod='scale');";
            } else {
                var svGradientImg = document.createElement("img");
                svGradientImg.src = svGradientImageSrc;
                svGradientImg.style.width = this._valueWidth + "px";
                svGradientImg.style.height = this._saturationHeight + "px";
                this._svDiv.appendChild(svGradientImg);
            }
        }
        
        // Create container for value selecion bar.
        this._vLineDiv = document.createElement("div");
        this._vLineDiv.style.cssText = "position:absolute;left:2px;top:0;width:11px;overflow:hidden;";
        this._vLineDiv.style.height = (this._saturationHeight + 14) + "px";
        this._div.appendChild(this._vLineDiv);
    
        // Create value selection bar top arrow.
        if (arrowDownImageSrc) {
            var vLineTopImg = document.createElement("img");
            vLineTopImg.src = arrowDownImageSrc;
            vLineTopImg.style.cssText = "position:absolute;left:0;top:0;";
            this._vLineDiv.appendChild(vLineTopImg);
        }
        
        // Create value selection bar line.
        var vLineBarDiv = document.createElement("div");
        vLineBarDiv.style.cssText = "position:absolute;top:7px;left:5px;width:1px;background-color:#000000;";
        vLineBarDiv.style.height = this._saturationHeight + "px";
        this._vLineDiv.appendChild(vLineBarDiv);
    
        // Create value selection bar bottom arrow.
        if (arrowUpImageSrc) {
            var vLineBottomImg = document.createElement("img");
            vLineBottomImg.src = arrowUpImageSrc;
            vLineBottomImg.style.cssText = "position:absolute;left:0;";
            vLineBottomImg.style.top = (this._saturationHeight + 7) + "px";
            this._vLineDiv.appendChild(vLineBottomImg);
        }
        
        // Create saturation selection bar container.
        this._sLineDiv = document.createElement("div");
        this._sLineDiv.style.cssText = "position:absolute;left:0;height:11px;overflow:hidden;";
        this._sLineDiv.style.top = (this._saturationHeight + 2) + "px";
        this._sLineDiv.style.width = (this._valueWidth + 14) + "px";
        this._div.appendChild(this._sLineDiv);
        
        // Create saturation selection bar left arrow.
        if (arrowRightImageSrc) {
            var sLineLeftImg = document.createElement("img");
            sLineLeftImg.src = arrowRightImageSrc;
            sLineLeftImg.style.cssText = "position:absolute;left:0;top:0;";
            this._sLineDiv.appendChild(sLineLeftImg);
        }
        
        // Create saturation selection bar line.
        var sLineBarDiv = document.createElement("div");
        sLineBarDiv.style.cssText = 
                "position:absolute;left:7px;top:5px;height:1px;font-size:1px;border-top:1px #000000 solid;line-height:0;";
        sLineBarDiv.style.width = this._valueWidth + "px";
        this._sLineDiv.appendChild(sLineBarDiv);
    
        // Create saturation selection bar right arrow.
        if (arrowLeftImageSrc) {
            var sLineRightImg = document.createElement("img");
            sLineRightImg.src = arrowLeftImageSrc;
            sLineRightImg.style.cssText = "position:absolute;top:0;";
            sLineRightImg.style.left = this._valueWidth + 7 + "px";
            this._sLineDiv.appendChild(sLineRightImg);
        }
        
        // Create hue selector.
        var hDiv = document.createElement("div");
        hDiv.style.cssText = "position:absolute;top:7px;";
        hDiv.style.left = (this._valueWidth + 22) + "px";
        hDiv.style.width = this._hueWidth + "px";
        hDiv.style.height = this._saturationHeight + "px";
        this._div.appendChild(hDiv);
    
        if (hGradientImageSrc) {
            var hGradientImg = document.createElement("img");
            hGradientImg.src = hGradientImageSrc;
            hGradientImg.style.cssText = "position:absolute;left:0;top:0;";
            hGradientImg.style.width = this._hueWidth + "px";
            hGradientImg.style.height = this._saturationHeight + "px";
            hDiv.appendChild(hGradientImg);
        }
        
        this._hLineDiv = document.createElement("div");
        this._hLineDiv.style.cssText = "position:absolute;height:11px;overflow:hidden;";
        this._hLineDiv.style.left = (this._valueWidth + 15) + "px";
        this._hLineDiv.style.top = (this._saturationHeight + 2) + "px";
        this._hLineDiv.style.width = (this._hueWidth + 14) + "px";
        this._div.appendChild(this._hLineDiv);
        
        if (arrowRightImageSrc) {
            var hLineLeftImg = document.createElement("img");
            hLineLeftImg.src = arrowRightImageSrc;
            hLineLeftImg.style.cssText = "position:absolute;left:0;top:0;";
            this._hLineDiv.appendChild(hLineLeftImg);
        }
    
        if (arrowLeftImageSrc) {
            var hLineRightImg = document.createElement("img");
            hLineRightImg.src = arrowLeftImageSrc;
            hLineRightImg.style.cssText = "position:absolute;top:0;";
            hLineRightImg.style.left = (this._hueWidth + 7) + "px";
            this._hLineDiv.appendChild(hLineRightImg);
        }
        
        var hLineBarDiv = document.createElement("div");
        hLineBarDiv.style.cssText =
                "position:absolute;left:7px;top:5px;height:1px;font-size:1px;border-top:1px #000000 solid;line-height:0;";
        hLineBarDiv.style.width = this._hueWidth + "px";
        this._hLineDiv.appendChild(hLineBarDiv);
        
        this._colorDiv = document.createElement("div");
        this._colorDiv.style.cssText = 
                "position:absolute;left:7px;color:#ffffff;background-color:#000000;text-align:center;vertical-align:middle;" +
                "overflow:hidden;border:1px #000000 outset;font-family:monospace;text-align:center;";
        this._colorDiv.style.height = displayHeight + "px";
        this._colorDiv.style.top = (this._saturationHeight + 16) + "px";
        this._colorDiv.style.width = (this._valueWidth + this._hueWidth + 13) + "px";
        if (this.component.render("displayValue")) {
            this._colorDiv.appendChild(document.createTextNode("#000000"));
        }
        this._div.appendChild(this._colorDiv);
        
        this._svListenerDiv = document.createElement("div");
        this._svListenerDiv.style.cssText = "position:absolute;z-index:1;left:0;top:0;cursor:crosshair;";
        this._svListenerDiv.style.width = (this._valueWidth + 14) + "px";
        this._svListenerDiv.style.height = (this._saturationHeight + 14) + "px";
        this._svListenerDiv.style.backgroundImage = "url(" +
                this.client.getResourceUrl("Echo", "resource/Transparent.gif") + ")";
        this._div.appendChild(this._svListenerDiv);
        
        this._hListenerDiv = document.createElement("div");
        this._hListenerDiv.style.cssText = "position:absolute;z-index:1;top:0;cursor:crosshair;";
        this._hListenerDiv.style.left = (this._valueWidth + 15) + "px";
        this._hListenerDiv.style.width = (this._hueWidth + 14) + "px";
        this._hListenerDiv.style.height = (this._saturationHeight + 16) + "px";
        this._hListenerDiv.style.backgroundImage = "url(" +
                this.client.getResourceUrl("Echo", "resource/Transparent.gif") + ")";
        this._div.appendChild(this._hListenerDiv);
    
        parentElement.appendChild(this._div);
        
        Core.Web.Event.add(this._svListenerDiv, "mousedown", Core.method(this, this._processSVMouseDown), false);
        Core.Web.Event.add(this._hListenerDiv, "mousedown", Core.method(this, this._processHMouseDown), false);
        this._setColor(this.component.get("color"));
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { 
        Core.Web.Event.removeAll(this._svListenerDiv);
        Core.Web.Event.removeAll(this._hListenerDiv);
        this._div = null;
        this._svDiv = null;
        this._svListenerDiv = null;
        this._hListenerDiv = null;
        this._hLineDiv = null;
        this._sLineDiv = null;
        this._vLineDiv = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var div = this._div;
        var parentElement = div.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        parentElement.removeChild(div);
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
            r = Math.floor(parseInt(color, 16) / 0x10000) / 255;
            g = (Math.floor(parseInt(color, 16) / 0x100) % 0x100) / 255;
            b = (parseInt(color, 16) % 0x100) / 255;
        } else {
            r = g = b = 0;
        }
        
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        this._v = max;
        
        var delta = max - min;
        if (max === 0 || delta === 0) {
            this._s = 0;
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
    
    /**
     * Updates the displayed color.
     */
    _updateDisplayedColor: function() {
        var baseColor;
        if (this.component.isRenderEnabled()) {
            baseColor = this._hsvToRgb(this._h, 1, 1);
        } else {
            // Use a dull base color to enable a disabled effect.
            baseColor = this._hsvToRgb(this._h, 0.3, 0.7);
        }
        this._svDiv.style.backgroundColor = baseColor.toHexTriplet();
    
        var renderColor = this._hsvToRgb(this._h, this._s, this._v);
        
        var renderHexTriplet = renderColor.toHexTriplet();
        this._colorDiv.style.backgroundColor = renderHexTriplet;
        this._colorDiv.style.borderColor = renderHexTriplet;
        this._colorDiv.style.color = this._v < 0.67 ? "#ffffff" : "#000000";
        if (this.component.render("displayValue")) {
            this._colorDiv.childNodes[0].nodeValue = renderHexTriplet;
        }
        
        var sLineTop = Math.floor((1 - this._s) * this._saturationHeight) + 2;
        if (sLineTop < 2) {
             sLineTop = 2;
        } else if (sLineTop > this._saturationHeight + 2) {
            sLineTop = this._saturationHeight + 2;
        }
        this._sLineDiv.style.top = sLineTop + "px";
        
        var vLineLeft = Math.floor(this._v * this._valueWidth) + 2;
        if (vLineLeft < 2) {
            vLineLeft = 2;
        } else if (vLineLeft > this._valueWidth + 2) {
            vLineLeft = this._valueWidth + 2;
        }
        this._vLineDiv.style.left = vLineLeft + "px";
        
        var hLineTop = Math.floor((360 - this._h) / 360 * this._saturationHeight) + 2;
        if (hLineTop < 2) {
            hLineTop = 2;
        } else if (hLineTop > this._saturationHeight + 2) {
            hLineTop = this._saturationHeight + 2;
        }
        this._hLineDiv.style.top = hLineTop + "px";
    }
});

