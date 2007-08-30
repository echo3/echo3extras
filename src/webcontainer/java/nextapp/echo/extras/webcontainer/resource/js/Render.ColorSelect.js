ExtrasRender.ComponentSync.ColorSelect = function() { };

ExtrasRender.ComponentSync.ColorSelect.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.ColorSelect.prototype.renderAdd = function(update, parentElement) {
    var valueWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("valueWidth", ExtrasApp.ColorSelect.DEFAULT_VALUE_WIDTH), true);
    var saturationHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("saturationHeight", ExtrasApp.ColorSelect.DEFAULT_SATURATION_HEIGHT), false);
    var hueWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("hueWidth", ExtrasApp.ColorSelect.DEFAULT_HUE_WIDTH), true);
    
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
    
    var svGradientImageSrc = this.client.getServiceUrl("EchoExtras.ColorSelect.SVGradient");
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
