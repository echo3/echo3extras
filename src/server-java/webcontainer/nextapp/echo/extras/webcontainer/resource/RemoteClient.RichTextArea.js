/**
 * Component rendering peer: RichTextArea
 */
ExtrasApp.RemoteRichTextArea = Core.extend(ExtrasApp.RichTextArea, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RemoteRichTextArea", this);
    },
    
    componentType: "ExtrasApp.RemoteRichTextArea"
});

ExtrasRender.ComponentSync.RemoteRichTextArea = Core.extend(ExtrasRender.ComponentSync.RichTextArea, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.RemoteRichTextArea", this);
    },

    getIcons: function() {
        var icons = ExtrasRender.ComponentSync.RichTextArea.prototype.getIcons.call(this);
        return icons ? icons : this._defaultIcons;
    },
    
    renderAdd: function(update, parentElement) {
        if (!this._defaultIcons) {
            this._installIcons();
        }
        ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd.call(this, update, parentElement);
    },
    
    _installIcons: function() {
        var imageServiceUrl = this.client.getResourceUrl("Echo.Image");
        var iconNames = [
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
        ];
        this._defaultIcons = {};
        for (var i = 0; i < iconNames.length; ++i) {
            this._defaultIcons[iconNames[i]] = imageServiceUrl + "&iid=EchoExtras.RemoteRichTextArea." + iconNames[i];
        }
        
        this._defaultIcons.ok = imageServiceUrl + "&iid=EchoExtras.CommonImages.ok";
        this._defaultIcons.cancel = imageServiceUrl + "&iid=EchoExtras.CommonImages.cancel";
    }
});
