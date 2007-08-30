ExtrasRender.ComponentSync.ColorSelect = function() { };

ExtrasRender.ComponentSync.ColorSelect.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.ColorSelect.prototype.renderAdd = function(update, parentElement) {
    // Create container div element, relatively positioned.
    this._containerDivElement = document.createElement("div");
    this._containerDivElement.style.position = "relative";
    this._containerDivElement.style.left = "0px";
    this._containerDivElement.style.top = "0px";
    this._containerDivElement.style.width = (this.valueWidth + this.hueWidth + 29) + "px";
    this._containerDivElement.style.height = (this.saturationHeight + 36) +"px";
    this._containerDivElement.style.overflow = "hidden";
    
    this._svDivElement = document.createElement("div");
    this._svDivElement.id = this.elementId + "_sv";
    this._svDivElement.style.position = "absolute";
    this._svDivElement.style.left = "7px";
    this._svDivElement.style.top = "7px";
    this._svDivElement.style.width = this.valueWidth + "px";
    this._svDivElement.style.height = this.saturationHeight + "px";
    this._svDivElement.style.backgroundColor = "#ff0000";
    this._containerDivElement.appendChild(this._svDivElement);
    
    var _svGradientImageSrc = this.client
    if (_svGradientImageSrc) {
        if (this.enableInternetExplorerPngWorkaround) {
            this._svDivElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader("
                    + "src='" + _svGradientImageSrc + "', sizingMethod='scale');";
        } else {
            var svGradientImgElement = document.createElement("img");
            svGradientImgElement.src = this._svGradientImageSrc;
            svGradientImgElement.style.width = this.valueWidth + "px";
            svGradientImgElement.style.height = this.saturationHeight + "px";
            _svDivElement.appendChild(svGradientImgElement);
        }
    }
};

ExtrasRender.ComponentSync.ColorSelect.prototype.renderDispose = function(update) { 
    this.colorSelectDivElement = null;
    this.svDivElement = null;
};
