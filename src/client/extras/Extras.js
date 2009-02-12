/**
 * Extras root namespace object.  Components are contained directly in this namespace.
 * @namespace
 */
Extras = { 

    /**
     * Maintains a unique id for the ExtrasApp namespace.
     * 
     * @type Number
     */
    uniqueId: 0
};

/**
 * Extras serialization namespace.
 * @namespace
 */
Extras.Serial = { 
    
    /**
     * Serialization type prefix for properties specific to Echo Extras.
     */
    PROPERTY_TYPE_PREFIX: "Extras.Serial."
};

/**
 * Extras components synchronization peer namespace.  Any objects in this namespace should not be accessed by application 
 * developers or extended outside of the Extras library.
 * @namespace
 */
Extras.Sync = { };

/**
 * Abstract base class for timed animated effects.
 * Animation developer provides initialization, step, and completion methods.
 */
Extras.Sync.Animation = Core.extend({

    /**
     * The current animation step index.  This value is incremented when init() is invoked and each time step() is invoked.
     * Thus, the first time step() is invoked, stepIndex will have a value of 1.
     */
    stepIndex: 0,
    
    /**
     * The actual start time of the animation (milliseconds since the epoch, i.e., value returned by new Date().getTime()).
     * @type Number
     */
    startTime: null,

    /**
     * The calculated end time of the animation (milliseconds since the epoch, i.e., value returned by new Date().getTime()).
     * This value is the sum of <code>startTime</code> and <code>runTime</code>.  The animation will run until the system time
     * reaches or first exceeds this value.
     * @type Number
     */
    endTime: null,
    
    /**
     * Listener management object.
     * @type Core.ListenerList
     */
    _listenerList: null,
    
    /**
     * Runnable used to render animation over time.
     * @type Core.Web.Scheduler.Runnable
     */
    _runnable: null,
    
    $virtual: {
    
        /**
         * The runtime, in milliseconds of the animation.
         * @type Number
         */
        runTime: 0,
        
        /**
         * Sleep interval, in milliseconds.  The interval with which the animation should sleep between frames.  
         * Default value is 10ms.
         * @type Number
         */
        sleepInterval: 10
    },

    $abstract: {
    
        /**
         * Initializes the animation.  This method will always be invoked internally, it should not be manually invoked.
         * This method will be invoked before the <code>step()</code> method.  This method may never be invoked if
         * the animation is immediately aborted or the allotted run time has expired.
         */
        init: function() { },
        
        /**
         * Completes the animation.  This method will always be invoked internally, it should not be manually invoked.
         * This method will always be invoked to finish the animation and/or clean up its resources, even if the animation 
         * was aborted.  Implementations of this method should render the animation in its completed state.
         * 
         * @param {Boolean} abort a flag indicating whether the animation aborted, true indicating it was aborted, false indicating
         *        it completed without abort
         */
        complete: function(abort) { },
        
        /**
         * Renders a step within the animation.  This method will always be invoked internally, it should not be manually invoked.
         * The implementation should not attempt to check if the animation is finished, as this work should be done in the
         * <code>complete()</codE> method.
         * 
         * @param {Number} progress a decimal value between 0 and 1 indicating the progress of the animation.
         */
        step: function(progress) { }
    },
    
    /**
     * Invoked by runnable to process a step of the animation.
     */
    _doStep: function() {
        var currentTime = new Date().getTime();
        if (currentTime < this.endTime) {
            if (this.stepIndex === 0) {
                this.init();
            } else {
                this.step((currentTime - this.startTime) / this.runTime);
            }
            ++this.stepIndex;
            Core.Web.Scheduler.add(this._runnable);
        } else {
            this.complete(false);
            if (this._completeMethod) {
                this._completeMethod(false);
            }
        }
    },
    
    /**
     * Aborts an in-progress animation.  The <code>complete()</code> method will be invoked.
     */
    abort: function() {
        Core.Web.Scheduler.remove(this._runnable);
        this.complete(true);
        if (this._completeMethod) {
            this._completeMethod(true);
        }
    },
    
    /**
     * Starts the animation.
     * 
     * @param {Function} completeMethod a function to execute when the animation has completed (it will be passed a boolean
     *        value of true or false to indicate whether animation was aborted (true) or not (false))
     */
    start: function(completeMethod) {
        this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._doStep),  this.sleepInterval, false);
        this.startTime = new Date().getTime();
        this.endTime = this.startTime + this.runTime;
        this._completeMethod = completeMethod;
        Core.Web.Scheduler.add(this._runnable);
    }
});