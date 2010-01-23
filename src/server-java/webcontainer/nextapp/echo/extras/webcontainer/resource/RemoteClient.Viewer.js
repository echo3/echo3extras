Extras.Sync.RemoteViewer = { };

Extras.Sync.RemoteViewer.Model = Core.extend(Extras.Viewer.CachingModel, {
    
    fetchImpl: function() {
        this.cacheStore(0, 0, [], 20);
    }
});

Extras.Sync.RemoteViewer.ModelTranslator = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var modelElement = pElement.firstChild;
            var model = new Extras.Sync.RemoteViewer.Model();
            return model;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.RemoteViewer.Model", this);
    }
});