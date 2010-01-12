Extras.Viewer = {};

Extras.Viewer.Model = Core.extend({

    $abstract: {
    
        /**
         * Invoked to notify model of a region of data which should be made available for display.
         * 
         * @param {Number} startIndex the first index to retrieve (inclusive)
         * @param {Number} endIndex the last index to retrieve (exclusive)
         */
        fetch: function(startIndex, endIndex) { },
        
        get: function(index) { },
        
        size: function() { }
    },
    
    $construct: function() {
        this._listeners = new Core.ListenerList();
    },
    
    addUpdateListener: function(l) {
        this._listeners.addListener("update", l);
    },
    
    refresh: function() {
        this._listeners.fireEvent({ source: this, type: "update", refresh: true });
    },
    
    removeUpdateListener: function(l) {
        this._listeners.removeListener("update", l);
    },
    
    update: function(startIndex, endIndex) {
        this._listeners.fireEvent({ 
            source: this, 
            type: "update", 
            startIndex: startIndex, 
            endIndex: endIndex == null ? startIndex + 1 : endIndex 
        });
    }
});

Extras.Viewer.NullModel = Core.extend(Extras.Viewer.Model, {

    fetch: function(startIndex, endIndex) { },
    
    get: function(row) { 
        return null;
    },
    
    size: function() { 
        return 0;
    }
});

Extras.Viewer.CachingModel = Core.extend(Extras.Viewer.Model, {
    
    _cache: null,
    _count: null,
    
    $construct: function() {
        Extras.Viewer.Model.call(this);
        this._cache = {};
    },
    
    $abstract: {
        
        fetchImpl: function(startIndex, endIndex) { }
    },

    $virtual: {
        
        emptyFetch: 20,

        overFetch: 10
    },
    
    cacheStore: function(startIndex, endIndex, items, newCount) {
        for (var i = 0; i < items.length; ++i) {
            this._cache[startIndex + i] = items[i];
        }
        
        if (this._count === newCount) {
            this.update(startIndex, endIndex);
        } else {
            this._count = newCount;
            this.refresh();
        }
    },
    
    fetch: function(startIndex, endIndex) {
        startIndex = Math.max(startIndex - this.overFetch, 0);
        endIndex = Math.min(endIndex + this.overFetch, this.size());
        
        if (endIndex === 0) {
            this.fetchImpl(0, this.emptyFetch);
        } else {
            var firstMiss = null, lastMiss = null;
            for (var i = startIndex; i < endIndex; ++i) {
                if (!this._cache[i]) {
                    if (firstMiss === null) {
                        firstMiss = i;
                    }
                    lastMiss = i;
                }
            }
            
            if (firstMiss !== null) {
                this.fetchImpl(firstMiss, lastMiss + 1);
            }
        }
    },
    
    get: function(index) { 
        return this._cache[index];
    },
    
    size: function() { 
        return this._count || 0;
    }
});
