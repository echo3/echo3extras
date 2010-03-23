/**
 * Extras viewer namespace object.
 * @namespace
 */
Extras.Viewer = { };

/**
 * Abstract base class for Viewer models.
 */
Extras.Viewer.Model = Core.extend({

    $abstract: {
    
        /**
         * Invoked to notify model of a region of data which should be made available for display.
         * This method must be invoked with paramaters <code>startIndex</code> &lt;= <code>index</code> &lt; <code>endIndex</code>
         * prior to invoking <code>get</code>(<code>index</code>). 
         * 
         * @param {Number} startIndex the first index to retrieve (inclusive)
         * @param {Number} endIndex the last index to retrieve (exclusive)
         */
        fetch: function(startIndex, endIndex) { },
        
        /**
         * Retrieves a model value.  <code>fetch()</code> will always be invoked on a range before <code>get()</code> is
         * used to retrieve individual values from that range.
         * 
         * @param {Number} index the index of the model item to retrieve
         * @return the model value
         * @type Object
         */
        get: function(index) { },
        
        /**
         * Returns the number of items contained in the model.
         * 
         * @return the number of items
         * @type Number
         */
        size: function() { }
    },
    
    /**
     * Constructor.
     * Must be invoked by derivative classes.
     */
    $construct: function() {
        this._listeners = new Core.ListenerList();
    },
    
    /**
     * Registers an <code>update</code> listener with the model.
     * Update listeners will be notified when an item within the model or the number of items within the model has changed.
     * 
     * @param {Function} l the listener to add 
     */
    addUpdateListener: function(l) {
        this._listeners.addListener("update", l);
    },
    
    /**
     * Notifies listeners that the model has fundamentally changed, possibly even including the 
     * number of items within the model.  
     */
    refresh: function() {
        this._listeners.fireEvent({ source: this, type: "update", refresh: true });
    },
    
    /**
     * Unregisters an <code>update</code> listener with the model.
     * Update listeners will be notified when an item within the model or the number of items within the model has changed.
     * 
     * @param {Function} l the listener to remove 
     */
    removeUpdateListener: function(l) {
        this._listeners.removeListener("update", l);
    },
    
    /**
     * Notifies listeners that a range of items within the model has changed, but that the size of the
     * model is unchanged.
     * 
     * @param {Number} startIndex the first index which has changed, inclusive
     * @param {Number} endIndex the last index which changed, exclusive (if unspecified, this value defaults to
     *        startIndex + 1, indicating only one value, startIndex, was changed)
     */
    update: function(startIndex, endIndex) {
        this._listeners.fireEvent({ 
            source: this, 
            type: "update", 
            startIndex: startIndex, 
            endIndex: endIndex == null ? startIndex + 1 : endIndex 
        });
    }
});

/**
 * An empty, immutable default model implementation that contains no items.
 */
Extras.Viewer.NullModel = Core.extend(Extras.Viewer.Model, {

    fetch: function(startIndex, endIndex) { },
    
    get: function(row) { 
        return null;
    },
    
    size: function() { 
        return 0;
    }
});

/**
 * Abstract Viewer model with caching support.
 */
Extras.Viewer.CachingModel = Core.extend(Extras.Viewer.Model, {
    
    _cache: null,
    _count: null,
    
    /**
     * Constructor.  Must be invoked by derivative classes.
     */
    $construct: function() {
        Extras.Viewer.Model.call(this);
        this._cache = {};
    },
    
    $abstract: {
        
        /**
         * Invoked when items are not found in cache and must be fetched.
         * Derivative classes should only override this method, rather
         * than overriding fetch() itself.
         * 
         * @param startIndex the first model item index to retrieve, inclusive
         * @param endIndex the last model item index to retrieve, exclusive
         * @return an array containing the fetched model items, with 
         *         index 0 representing the item at startIndex 
         */
        fetchImpl: function(startIndex, endIndex) { }
    },

    $virtual: {
        
        /**
         * The number of items to fetch when no data is in the model.  Generally This value
         * should be sized to be at least greater than the anticipated initial number
         * of items on the screen.
         * @type Number
         */
        emptyFetch: 20,

        /**
         * The number of extra items to fetch beyond what is absolutely required.
         * Setting this value higher can avoid roundtrip requests to the datastore.
         */
        overFetch: 10
    },
    
    /**
     * Stores values in the cache.
     *
     * @param startIndex the index of the first item to store (inclusive)
     * @param endIndex the index of the last item to store (exclusive)
     * @param items the items to store
     * @param newCount the updated item count (the pre-existing cache will be invalidated if this value
     *        does not match the current count value)
     * @param {Boolean} invalidate flag indicating whether or not the cache should be invalidated
     */
    cacheStore: function(startIndex, endIndex, items, newCount, invalidate) {
        for (var i = 0; i < items.length; ++i) {
            this._cache[startIndex + i] = items[i];
        }
        
        if (invalidate || this._count !== newCount) {
            this._count = newCount;
            this.refresh();
        } else {
            this.update(startIndex, endIndex);
        }
    },
    
    /**
     * Fetch implementation, should not be overriden.  This method will invoke
     * fetchImpl() when required.
     */
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
    
    /**
     * get() implementation, returns cached values.
     */
    get: function(index) { 
        return this._cache[index];
    },

    /**
     * size() implementation, returns size specified in most recent cacheStore() invocation.
     */
    size: function() { 
        return this._count || 0;
    }
});
