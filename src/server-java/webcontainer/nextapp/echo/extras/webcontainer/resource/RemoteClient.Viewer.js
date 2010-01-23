Extras.Sync.RemoteViewer = { };

Extras.Sync.RemoteViewer.Model = Core.extend(Extras.Viewer.CachingModel, {
    
    _conn: null,
    _client: null,
    _size: null,
    
    $construct: function(client, size) {
        this._client = client;
        Extras.Viewer.CachingModel.call(this);
        this.cacheStore(0, 0, [], size);
    },
    
    fetchImpl: function(startIndex, endIndex) {
        if (this._conn) {
            return;
        }
        
        var serviceUrl = this._client.getServiceUrl("EchoExtras.Viewer.Model") + "&is=" + startIndex + 
                "&ie=" + endIndex;
        Core.Debug.consoleWrite(serviceUrl);
        
    }
});

Extras.Sync.RemoteViewer.ModelTranslator = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var modelElement = pElement.firstChild;
            var size = parseInt(modelElement.getAttribute("sz"), 10);
            var model = new Extras.Sync.RemoteViewer.Model(client, size);
            return model;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.RemoteViewer.Model", this);
    }
});
