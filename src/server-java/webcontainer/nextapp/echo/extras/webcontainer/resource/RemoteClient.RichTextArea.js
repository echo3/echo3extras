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
    }
});
