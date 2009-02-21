/**
 * RemoteClient-hosted RichTextArea component.
 */
Extras.RemoteRichTextArea = Core.extend(Extras.RichTextArea, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RemoteRichTextArea", this);
    },
    
    componentType: "Extras.RemoteRichTextArea"
});

/**
 * RemoteClient-hosted RichTextArea component synchronization peer.
 */
Extras.Sync.RemoteRichTextArea = Core.extend(Extras.Sync.RichTextArea, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteRichTextArea", this);
    }
});
