/**
 * Component rendering peer: RichTextArea
 */
ExtrasApp.RemoteRichTextArea = function(properties) {
    ExtrasApp.RichTextArea.call(this, properties);
    this.componentType = "ExtrasApp.RemoteRichTextArea";
};

ExtrasApp.RemoteRichTextArea.prototype = EchoCore.derive(ExtrasRender.ComponentSync.RichTextArea);

ExtrasRender.ComponentSync.RemoteRichTextArea = function() { 
    ExtrasRender.ComponentSync.RichTextArea.call(this);
};

ExtrasRender.ComponentSync.RemoteRichTextArea.prototype = EchoCore.derive(ExtrasRender.ComponentSync.RichTextArea);

ExtrasRender.ComponentSync.RemoteRichTextArea.prototype.getIcons = function() {
    var icons = ExtrasRender.ComponentSync.RichTextArea.prototype.getIcons.call(this);
    return icons ? icons : this._defaultIcons;
};

ExtrasRender.ComponentSync.RemoteRichTextArea.prototype.renderAdd = function(update, parentElement) {
    if (!this._defaultIcons) {
        this._installIcons();
    }
    ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd.call(this, update, parentElement);
};

ExtrasRender.ComponentSync.RemoteRichTextArea.prototype._installIcons = function() {
    var imageServiceUrl = this.client.getServiceUrl("Echo.Image");
    var iconNames = new Array(
        "undo",
        "redo",
        "cut",
        "copy",
        "paste",
        "bulletedList",
        "numberedList",
        "table",
        "image",
        "horizontalRule",
        "hyperlink",
        "bold", 
        "italic", 
        "underline",
        "superscript",
        "subscript",
        "indent",
        "outdent",
        "foreground",
        "background",
        "alignmentLeft",
        "alignmentCenter",
        "alignmentRight",
        "alignmentJustify"
    );
    this._defaultIcons = new Object();
    for (var i = 0; i < iconNames.length; ++i) {
        this._defaultIcons[iconNames[i]] = new EchoApp.Property.ImageReference(imageServiceUrl 
                + "&iid=EchoExtras.RemoteRichTextArea." + iconNames[i]);
    }
    
    this._defaultIcons.ok = new EchoApp.Property.ImageReference(imageServiceUrl + "&iid=EchoExtras.CommonImages.ok");
    this._defaultIcons.cancel = new EchoApp.Property.ImageReference(imageServiceUrl + "&iid=EchoExtras.CommonImages.cancel");
};

EchoApp.ComponentFactory.registerType("ExtrasApp.RemoteRichTextArea", ExtrasRender.RemoteRichTextArea);

EchoRender.registerPeer("ExtrasApp.RemoteRichTextArea", ExtrasRender.ComponentSync.RemoteRichTextArea);
