/**
 * Component rendering peer: RichTextArea
 */
Extras.RemoteRichTextArea = Core.extend(Extras.RichTextArea, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteRichTextArea", this);
    },
    
    componentType: "Extras.RemoteRichTextArea"
});

Extras.Sync.RemoteRichTextArea = Core.extend(Extras.Sync.RichTextArea, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteRichTextArea", this);
    }
});
