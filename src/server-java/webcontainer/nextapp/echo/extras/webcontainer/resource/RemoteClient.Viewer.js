Extras.Sync.RemoteViewer = { };

Extras.Sync.RemoteViewer.Model = Core.extend(Extras.Viewer.CachingModel, {
    
    _conn: null,
    _component: null,
    _size: null,
    
    _queuedStartIndex: null,
    _queuedEndIndex: null,
    
    $construct: function(component) {
        this._component = component;
        Extras.Viewer.CachingModel.call(this);
        this.cacheStore(0, 0, [], 0);
    },
    
    fetchImpl: function(startIndex, endIndex) {
        if (this._conn) {
            this._queuedStartIndex = startIndex;
            this._queuedEndIndex = endIndex;
            return;
        }
        
        var serviceUrl = this._component.peer.client.getServiceUrl("EchoExtras.Viewer.Model") +
                "&cid=" + this._component.renderId + 
                "&is=" + startIndex + 
                "&ie=" + endIndex;
        this._conn = new Core.Web.HttpConnection(serviceUrl, "GET");
        this._conn.addResponseListener(Core.method(this, function(e) {
            this._processServerData(e.source.getResponseXml());
        }));
        this._conn.connect();
    },
    
    _processServerData: function(document) {
        this._conn = null;
        
        var modelElement = document.documentElement;
        var size = parseInt(modelElement.getAttribute("sz"), 10);
        var startIndex = parseInt(modelElement.getAttribute("is"), 10);
        var endIndex = parseInt(modelElement.getAttribute("ie"), 10);
        var invalidate = modelElement.getAttribute("inv") == "1";
        var i = startIndex;
        var items = []; 
        var p = modelElement.firstChild;
        while (p) {
            var propertyType = p.getAttribute("t");
            var translator = propertyType ? Echo.Serial.getPropertyTranslator(propertyType) : Echo.Serial.String;
            if (!translator) {
                throw new Error("Translator not available for property type: " + propertyType);
            }
            items.push(translator.toProperty(this.client, p));
            p = p.nextSibling;
            ++i;
        }
        this.cacheStore(startIndex, endIndex, items, size, invalidate);
        
        if (this._queuedStartIndex != null) {
            startIndex = this._queuedStartIndex;
            endIndex = this._queuedEndIndex;
            this._queuedStartIndex = null;
            this._queuedEndIndex = null;
            this.fetchImpl(startIndex, endIndex);
        }
    }
});

