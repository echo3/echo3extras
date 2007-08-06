ExtrasRender.ComponentSync.ColorSelect = function() { };

ExtrasRender.ComponentSync.ColorSelect.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.ColorSelect.prototype.renderAdd = function(update, parentElement) {
    this.colorSelectDivElement = document.createElement("div");
    this.colorSelectDivElement.id = this.elementId;
    this.colorSelectDivElement.style.position = "relative";
    this.colorSelectDivElement.style.left = "0px";
    this.colorSelectDivElement.style.top = "0px";
    this.colorSelectDivElement.style.width = (this.valueWidth + this.hueWidth + 29) + "px";
    this.colorSelectDivElement.style.height = (this.saturationHeight + 36) +"px";
    this.colorSelectDivElement.style.overflow = "hidden";
    
    this.svDivElement = document.createElement("div");
    this.svDivElement.id = this.elementId + "_sv";
    this.svDivElement.style.position = "absolute";
    this.svDivElement.style.left = "7px";
    this.svDivElement.style.top = "7px";
    this.svDivElement.style.width = this.valueWidth + "px";
    this.svDivElement.style.height = this.saturationHeight + "px";
    this.svDivElement.style.backgroundColor = "#ff0000";
    this.colorSelectDivElement.appendChild(this.svDivElement);
    
    if (this.enableInternetExplorerPngWorkaround) {
        this.svDivElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader("
                + "src='" + this.svGradientImageSrc + "', sizingMethod='scale');";
    } else {
        var this.svGradientImgElement = document.createElement("img");
        this.svGradientImgElement.src = this.svGradientImageSrc;
        this.svGradientImgElement.style.width = this.valueWidth + "px";
        this.svGradientImgElement.style.height = this.saturationHeight + "px";
        this.svDivElement.appendChild(svGradientImgElement);
    }
};