ExtrasRender.ComponentSync.ColorSelect = function() { };

ExtrasRender.ComponentSync.ColorSelect.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.ColorSelect.prototype.renderAdd = function(update, parentElement) {
    var valueWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("valueWidth", ExtrasApp.ColorSelect.DEFAULT_VALUE_WIDTH), true);
    var saturationHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("saturationHeight", ExtrasApp.ColorSelect.DEFAULT_SATURATION_HEIGHT), false);
    var hueWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("hueWidth", ExtrasApp.ColorSelect.DEFAULT_HUE_WIDTH), true);

    var svGradientImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.SVGradient");
    var hGradientImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.HGradient");
    var arrowDownImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.ArrowDown");
    var arrowUpImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.ArrowUp");
    var arrowRightImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.ArrowRight");
    var arrowLeftImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.ArrowLeft");
    
    // Create container div element, relatively positioned.
    this._containerDivElement = document.createElement("div");
    this._containerDivElement.style.position = "relative";
    this._containerDivElement.style.left = "0px";
    this._containerDivElement.style.top = "0px";
    this._containerDivElement.style.width = (valueWidth + hueWidth + 29) + "px";
    this._containerDivElement.style.height = (saturationHeight + 36) +"px";
    this._containerDivElement.style.overflow = "hidden";
    
    // Create saturation / value selector.
    this._svDivElement = document.createElement("div");
    this._svDivElement.style.position = "absolute";
    this._svDivElement.style.left = "7px";
    this._svDivElement.style.top = "7px";
    this._svDivElement.style.width = valueWidth + "px";
    this._svDivElement.style.height = saturationHeight + "px";
    this._svDivElement.style.backgroundColor = "#ff0000";
    this._containerDivElement.appendChild(this._svDivElement);
    
    if (svGradientImageSrc) {
        if (EchoWebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
            this._svDivElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader("
                    + "src='" + svGradientImageSrc + "', sizingMethod='scale');";
        } else {
            var svGradientImgElement = document.createElement("img");
            svGradientImgElement.src = svGradientImageSrc;
            svGradientImgElement.style.width = valueWidth + "px";
            svGradientImgElement.style.height = saturationHeight + "px";
            this._svDivElement.appendChild(svGradientImgElement);
        }
    }
    
    // Create container for value selecion bar.
    this._vLineDivElement = document.createElement("div");
    this._vLineDivElement.style.position = "absolute";
    this._vLineDivElement.style.left = "2px";
    this._vLineDivElement.style.top = "0px";
    this._vLineDivElement.style.width = "11px";
    this._vLineDivElement.style.height = (saturationHeight + 14) + "px";
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
    vLineBarDivElement.style.height = saturationHeight + "px";
    vLineBarDivElement.style.width = "1px";
    vLineBarDivElement.style.backgroundColor = "#000000";
    this._vLineDivElement.appendChild(vLineBarDivElement);

    // Create value selection bar bottom arrow.
    if (arrowUpImageSrc) {
        var vLineBottomImgElement = document.createElement("img");
        vLineBottomImgElement.src = arrowUpImageSrc;
        vLineBottomImgElement.style.position = "absolute";
        vLineBottomImgElement.style.left = "0px";
        vLineBottomImgElement.style.top = (saturationHeight + 7) + "px";
        this._vLineDivElement.appendChild(vLineBottomImgElement);
    }
    
    // Create saturation selection bar container.
    this._sLineDivElement = document.createElement("div");
    this._sLineDivElement.style.position = "absolute";
    this._sLineDivElement.style.left = "0px";
    this._sLineDivElement.style.top = (saturationHeight + 2) + "px";
    this._sLineDivElement.style.height = "11px";
    this._sLineDivElement.style.width = (valueWidth + 14) + "px";
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
    sLineBarDivElement.style.width = valueWidth + "px";
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
        sLineRightImgElement.style.left = valueWidth + 7 + "px";
        sLineRightImgElement.style.top = "0px";
        this._sLineDivElement.appendChild(sLineRightImgElement);
    }
    
    // Create hue selector.
    var hDivElement = document.createElement("div");
    hDivElement.style.position = "absolute";
    hDivElement.style.left = (valueWidth + 22) + "px";
    hDivElement.style.top = "7px";
    hDivElement.style.width = hueWidth + "px";
    hDivElement.style.height = saturationHeight + "px";
    this._containerDivElement.appendChild(hDivElement);

    if (hGradientImageSrc) {
        var hGradientImgElement = document.createElement("img");
        hGradientImgElement.src = hGradientImageSrc;
        hGradientImgElement.style.position = "absolute";
        hGradientImgElement.style.left = "0px";
        hGradientImgElement.style.top = "0px";
        hGradientImgElement.style.width = hueWidth + "px";
        hGradientImgElement.style.height = saturationHeight + "px";
        hDivElement.appendChild(hGradientImgElement);
    }
    
    var hLineDivElement = document.createElement("div");
    hLineDivElement.style.position = "absolute";
    hLineDivElement.style.left = (valueWidth + 15) + "px";
    hLineDivElement.style.top = (saturationHeight + 2) + "px";
    hLineDivElement.style.height = "11px";
    hLineDivElement.style.width = (hueWidth + 14) + "px";
    hLineDivElement.style.overflow = "hidden";
    this._containerDivElement.appendChild(hLineDivElement);
    
    if (arrowRightImageSrc) {
        var hLineLeftImgElement = document.createElement("img");
        hLineLeftImgElement.src = arrowRightImageSrc;
        hLineLeftImgElement.style.position = "absolute";
        hLineLeftImgElement.style.left = "0px";
        hLineLeftImgElement.style.top = "0px";
        hLineDivElement.appendChild(hLineLeftImgElement);
    }

    if (arrowLeftImageSrc) {
        var hLineRightImgElement = document.createElement("img");
        hLineRightImgElement.src = arrowLeftImageSrc;
        hLineRightImgElement.style.position = "absolute";
        hLineRightImgElement.style.left = (hueWidth + 7) + "px";
        hLineRightImgElement.style.top = "0px";
        hLineDivElement.appendChild(hLineRightImgElement);
    }
    
    var hLineBarDivElement = document.createElement("div");
    hLineBarDivElement.style.position = "absolute";
    hLineBarDivElement.style.left = "0px";
    hLineBarDivElement.style.left = "7px";
    hLineBarDivElement.style.top = "5px";
    hLineBarDivElement.style.width = hueWidth + "px";
    hLineBarDivElement.style.height = "1px";
    hLineBarDivElement.style.fontSize = "1px";
    hLineBarDivElement.style.borderTop = "1px #000000 solid";
    hLineBarDivElement.style.lineHeight = "0";
    hLineDivElement.appendChild(hLineBarDivElement);

    parentElement.appendChild(this._containerDivElement);
};

ExtrasRender.ComponentSync.ColorSelect.prototype.renderDispose = function(update) { 
    this._containerDivElement = null;
    this._svDivElement = null;
};

ExtrasRender.ComponentSync.ColorSelect.prototype.renderUpdate = function(update) {
    var containerDivElement = this._containerDivElement;
    var parentElement = containerDivElement.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    parentElement.removeChild(containerDivElement);
    this.renderAdd(update, parentElement);
    return false;
};

EchoRender.registerPeer("ExtrasApp.ColorSelect", ExtrasRender.ComponentSync.ColorSelect);
