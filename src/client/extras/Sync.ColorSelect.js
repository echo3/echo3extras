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
            
            $static: {
                
                /**
                 * Converts an HSV color to an RGB color.
                 * 
                 * @param {Number} h the color hue
                 * @param {Number} s the color saturation
                 * @param {Number} v the color value
                 * @return an RGB color
                 * @type Extras.Sync.ColorSelect.RGB 
                 */
                _fromHsv: function(h, s, v) {
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
                }
            },
            
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
    
    _cursorBorderLight: "1px solid #ffffff",
    
    _cursorBorderDark: "1px solid #cfcfcf",
    
    _cursorBorderShadow: "1px solid #000000",
    
    _lineOpacity: 0.8,
    
    _shadowOpacity: 0.3,
    
    _svXOffset: 7,
    
    _svYOffset: 7,

    _barRadius: 2,
    
    _boxRadius: 2,
    
    $construct: function() {
        this._processHMouseMoveRef = Core.method(this, this._processHMouseMove);
        this._processHMouseUpRef = Core.method(this, this._processHMouseUp);
        this._processSVMouseMoveRef = Core.method(this, this._processSVMouseMove);
        this._processSVMouseUpRef = Core.method(this, this._processSVMouseUp);
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
        this._h = (this._svHeight - (offset.y - 7)) * 360 / this._svHeight;
        this._updateDisplayedColor();
        Core.Web.DOM.preventEventDefault(e);
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
        this._v = (offset.x - this._svXOffset) / this._svWidth;
        this._s = 1 - ((offset.y - this._svYOffset) / this._svHeight);
        this._updateDisplayedColor();
        Core.Web.DOM.preventEventDefault(e);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._svWidth = Echo.Sync.Extent.toPixels(
                this.component.render("valueWidth", Extras.ColorSelect.DEFAULT_VALUE_WIDTH), true);
        this._svHeight = Echo.Sync.Extent.toPixels(
                this.component.render("saturationHeight", Extras.ColorSelect.DEFAULT_SATURATION_HEIGHT), false);
        this._hWidth = Echo.Sync.Extent.toPixels(
                this.component.render("hueWidth", Extras.ColorSelect.DEFAULT_HUE_WIDTH), true);
        var displayHeight = Core.Web.Measure.extentToPixels("1em", false);
    
        var svGradientImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectSVGradient.png");
        var hGradientImageSrc = this.client.getResourceUrl("Extras", "image/colorselect/ColorSelectHGradient.png");
        
        // Create main container div element, relatively positioned.
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:relative;left:0;top:0;overflow:hidden;";
        this._div.style.width = (this._svWidth + this._hWidth + 29) + "px";
        this._div.style.height = (this._svHeight + 18 + displayHeight) +"px";
        
        // Create saturation / value selector.
        this._svDiv = document.createElement("div");
        this._svDiv.style.cssText = "position:absolute;background-color:#ff0000;overflow:hidden;";
        this._svDiv.style.left = this._svXOffset + "px";
        this._svDiv.style.top = this._svYOffset + "px";
        this._svDiv.style.width = this._svWidth + "px";
        this._svDiv.style.height = this._svHeight + "px";
        this._div.appendChild(this._svDiv);
        
        if (svGradientImageSrc) {
            if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
                this._svDiv.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" +
                        "src='" + svGradientImageSrc + "', sizingMethod='scale');";
            } else {
                var svGradientImg = document.createElement("img");
                svGradientImg.src = svGradientImageSrc;
                svGradientImg.style.width = this._svWidth + "px";
                svGradientImg.style.height = this._svHeight + "px";
                this._svDiv.appendChild(svGradientImg);
            }
        }
        
        this._svCursorDiv = this._createSVCursor();
        this._svDiv.appendChild(this._svCursorDiv);
        
        // Create hue selector.
        var hDiv = document.createElement("div");
        hDiv.style.cssText = "position:absolute;top:7px;overflow:hidden;";
        hDiv.style.left = (this._svWidth + 22) + "px";
        hDiv.style.width = this._hWidth + "px";
        hDiv.style.height = this._svHeight + "px";
        this._div.appendChild(hDiv);
    
        if (hGradientImageSrc) {
            var hGradientImg = document.createElement("img");
            hGradientImg.src = hGradientImageSrc;
            hGradientImg.style.cssText = "position:absolute;left:0;top:0;";
            hGradientImg.style.width = this._hWidth + "px";
            hGradientImg.style.height = this._svHeight + "px";
            hDiv.appendChild(hGradientImg);
        }
        
        this._hCursorDiv = this._createHCursor();
        hDiv.appendChild(this._hCursorDiv);
        
        this._colorDiv = document.createElement("div");
        this._colorDiv.style.cssText = 
                "position:absolute;left:7px;color:#ffffff;background-color:#000000;text-align:center;vertical-align:middle;" +
                "overflow:hidden;border:1px #000000 outset;font-family:monospace;text-align:center;";
        this._colorDiv.style.height = displayHeight + "px";
        this._colorDiv.style.top = (this._svHeight + 16) + "px";
        this._colorDiv.style.width = (this._svWidth + this._hWidth + 13) + "px";
        if (this.component.render("displayValue")) {
            this._colorDiv.appendChild(document.createTextNode("#000000"));
        }
        this._div.appendChild(this._colorDiv);
        
        this._svListenerDiv = document.createElement("div");
        this._svListenerDiv.style.cssText = "position:absolute;z-index:1;left:0;top:0;cursor:crosshair;";
        this._svListenerDiv.style.width = (this._svWidth + 14) + "px";
        this._svListenerDiv.style.height = (this._svHeight + 14) + "px";
        this._svListenerDiv.style.backgroundImage = "url(" +
                this.client.getResourceUrl("Echo", "resource/Transparent.gif") + ")";
        this._div.appendChild(this._svListenerDiv);
        
        this._hListenerDiv = document.createElement("div");
        this._hListenerDiv.style.cssText = "position:absolute;z-index:1;top:0;cursor:crosshair;";
        this._hListenerDiv.style.left = (this._svWidth + 15) + "px";
        this._hListenerDiv.style.width = (this._hWidth + 14) + "px";
        this._hListenerDiv.style.height = (this._svHeight + 16) + "px";
        this._hListenerDiv.style.backgroundImage = "url(" +
                this.client.getResourceUrl("Echo", "resource/Transparent.gif") + ")";
        this._div.appendChild(this._hListenerDiv);
    
        parentElement.appendChild(this._div);
        
        Core.Web.Event.add(this._svListenerDiv, "mousedown", Core.method(this, this._processSVMouseDown), false);
        Core.Web.Event.add(this._hListenerDiv, "mousedown", Core.method(this, this._processHMouseDown), false);
        this._setColor(this.component.get("color"));
    },
    
    _createHCursor: function() {
        var container = document.createElement("div");
        container.style.cssText = "position:absolute;";
        var div;

        div = document.createElement("div");
        div.style.cssText = "position:absolute;font-size:1px;line-height:0;top:1px;";
        div.style.opacity = this._shadowOpacity;
        div.style.width = this._hWidth + "px";
        div.style.height = (this._barRadius * 2 - 1) + "px";
        div.style.borderTop = this._cursorBorderShadow;
        div.style.borderBottom = this._cursorBorderShadow;
        container.appendChild(div);
        
        div = document.createElement("div");
        div.style.cssText = "position:absolute;font-size:1px;line-height:0;";
        div.style.opacity = this._lineOpacity;
        div.style.width = this._hWidth + "px";
        div.style.height = (this._barRadius * 2 - 1) + "px";
        div.style.borderTop = this._cursorBorderLight;
        div.style.borderBottom = this._cursorBorderDark;
        container.appendChild(div);
        
        return container;
    },
    
    _createSVCursor: function() {
        var div = document.createElement("div");
        div.style.cssText = "position:absolute;";
        div.style.width = (this._svWidth * 2 - 1) + "px";
        div.style.height = (this._svHeight * 2 - 1) + "px";
        
        var light, dark, o;

        light = dark = this._cursorBorderShadow;
        
        o = this._shadowOpacity;
        
        div.appendChild(this._createSVCursorLine(1, 1, true, true, light, dark, o));
        div.appendChild(this._createSVCursorLine(1, 1, false, true, light, dark, o));
        div.appendChild(this._createSVCursorLine(1, 1, true, false, light, dark, o));
        div.appendChild(this._createSVCursorLine(1, 1, false, false, light, dark, o));

        light = this._cursorBorderLight;
        dark = this._cursorBorderDark;
        
        o = this._lineOpacity;

        div.appendChild(this._createSVCursorLine(0, 0, true, true, light, dark, o));
        div.appendChild(this._createSVCursorLine(0, 0, false, true, light, dark, o));
        div.appendChild(this._createSVCursorLine(0, 0, true, false, light, dark, o));
        div.appendChild(this._createSVCursorLine(0, 0, false, false, light, dark, o));
        
        return div;
    },
    
    _createSVCursorLine: function(x, y, leading, vertical, light, dark, opacity) {
        var line = document.createElement("div");
        line.style.cssText = "position:absolute;line-height:0;font-size:1px;";
        line.style.opacity = opacity;
        
        line.style[vertical ? "borderLeft" : "borderTop"] = light;
        line.style[vertical ? "borderRight" : "borderBottom"] = dark;
        
        if (vertical) {
            line.style.left = (x + this._svWidth - this._barRadius) + "px";
            line.style.height = (this._svHeight - this._boxRadius) + "px";
            line.style.width = (this._barRadius * 2 - 1) + "px";
            if (!leading) {
                line.style.top = (1 + y + this._svHeight + this._boxRadius) + "px";
            }
        } else {
            line.style.top = (y + this._svHeight - this._barRadius) + "px";
            line.style.width = (this._svWidth - this._boxRadius) + "px";
            line.style.height = (this._barRadius * 2 - 1) + "px";
            if (!leading) {
                line.style.left = (1 + x + this._svWidth + this._boxRadius) + "px";
            }
        }
        
        return line;
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { 
        Core.Web.Event.removeAll(this._svListenerDiv);
        Core.Web.Event.removeAll(this._hListenerDiv);
        this._div = null;
        this._svDiv = null;
        this._svListenerDiv = null;
        this._hListenerDiv = null;
        this._svCursorDiv = null;
        this._hCursorDiv = null;
        this._colorDiv = null;
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
        var renderColor = Extras.Sync.ColorSelect.RGB._fromHsv(this._h, this._s, this._v);
        var renderHexTriplet = renderColor.toHexTriplet();
        this.component.set("color", renderHexTriplet);
    },
    
    /**
     * Updates the displayed color.
     */
    _updateDisplayedColor: function() {
        var baseColor;
        if (this.component.isRenderEnabled()) {
            baseColor = Extras.Sync.ColorSelect.RGB._fromHsv(this._h, 1, 1);
        } else {
            // Use a dull base color to enable a disabled effect.
            baseColor = Extras.Sync.ColorSelect.RGB._fromHsv(this._h, 0.3, 0.7);
        }
        this._svDiv.style.backgroundColor = baseColor.toHexTriplet();
    
        var renderColor = Extras.Sync.ColorSelect.RGB._fromHsv(this._h, this._s, this._v);
        
        var renderHexTriplet = renderColor.toHexTriplet();
        this._colorDiv.style.backgroundColor = renderHexTriplet;
        this._colorDiv.style.borderColor = renderHexTriplet;
        this._colorDiv.style.color = this._v < 0.67 ? "#ffffff" : "#000000";
        if (this.component.render("displayValue")) {
            this._colorDiv.childNodes[0].nodeValue = renderHexTriplet;
        }
        
        var sy = Math.floor((1 - this._s) * this._svHeight);
        if (sy < 0) {
             sy = 0;
        } else if (sy > this._svHeight) {
            sy = this._svHeight;
        }
        
        var vx = Math.floor(this._v * this._svWidth);
        if (vx < 0) {
            vx = 0;
        } else if (vx > this._svWidth) {
            vx = this._svWidth;
        }
        
        this._svCursorDiv.style.top = (sy - this._svHeight) + "px";
        this._svCursorDiv.style.left = (vx - this._svWidth) + "px";
        
        var hy = Math.floor((360 - this._h) / 360 * this._svHeight);
        if (hy < 0) {
            hy = 0;
        } else if (hy > this._svHeight) {
            hy = this._svHeight;
        }
        this._hCursorDiv.style.top = hy - this._barRadius + "px";
    }
});
