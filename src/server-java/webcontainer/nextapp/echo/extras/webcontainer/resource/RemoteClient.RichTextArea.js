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
    
    processInsertImage: function() {
        if (this.component.render("overrideInsertImage")) {
            this.component.fireEvent({ source: this.component, type: "operation", data: "insertImage" });
        } else {
            Extras.Sync.RichTextArea.prototype.processInsertImage.call(this);
        }
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteRichTextArea", this);
    }
});

/**
 * Command peer for InsertHtmlCommand.
 */
Extras.Sync.RemoteRichTextArea.InsertHtmlCommand = Core.extend(Echo.RemoteClient.CommandExec, {
    
    $static: {

        /** @see Echo.RemoteClient.CommandExecProcessor#execute */
        execute: function(client, commandData) {
            var rta = client.application.getComponentByRenderId(commandData.renderId);
            rta.insertHtml(commandData.html);
        }
     },
     
     $load: function() {
        Echo.RemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.extras.app.richtext.InsertHtmlCommand", this);
     }
});
