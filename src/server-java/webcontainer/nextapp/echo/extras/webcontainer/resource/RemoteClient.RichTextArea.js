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
    
    $static: {

        /**
         * Serialization peer for <code>EditedHtml</code> instances.
         * The toString() method of the object is invoked.
         */
        EditedHtmlSerialPeer: Core.extend(Echo.Serial.PropertyTranslator, {
            
            $static: {
                
                /** @see Echo.Serial.PropertyTranslator#toXml */
                toXml: function(client, pElement, value) {
                    pElement.appendChild(pElement.ownerDocument.createTextNode(value.toString()));
                }
            },
            
            $load: function() {
                Echo.Serial.addPropertyTranslator("Extras.RichTextInput.EditedHtml", this);
            }
        })
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteRichTextArea", this);
    }
});
