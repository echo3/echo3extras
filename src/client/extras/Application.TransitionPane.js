/**
 * TransitionPane component: a container pane which displays a single child pane
 * or component, rendering an animated transition effect when its content is
 * changed (when the child is removed and a new one is added). May contain zero
 * or one child components. May contain pane components as children.
 * 
 * @sp type the transition type, one of the following values:
 *     <ul>
 *     <li><code>TYPE_IMMEDIATE_REPLACE</code></li>
 *     <li><code>TYPE_CAMERA_PAN_LEFT</code></li>
 *     <li><code>TYPE_CAMERA_PAN_RIGHT</code></li>
 *     <li><code>TYPE_CAMERA_PAN_UP</code></li>
 *     <li><code>TYPE_CAMERA_PAN_DOWN</code></li>
 *     <li><code>TYPE_BLIND_BLACK_IN</code></li>
 *     <li><code>TYPE_BLIND_BLACK_OUT</code></li>
 *     <li><code>TYPE_FADE_TO_BLACK</code></li>
 *     <li><code>TYPE_FADE_TO_WHITE</code></li>
 *     <li><code>TYPE_FADE</code></li>
 *     </ul>
 * @sp {Number} duration the transition duration, in milliseconds
 */
Extras.TransitionPane = Core.extend(Echo.Component, {

    $static: {
    
        /**
         * Default duration time (350ms).
         */
        DEFAULT_DURATION: 350,
        
        /**
         * Default transition type (immediate replace).
         */
        DEFAULT_TYPE: 0,
        
        /**
         * Transition setting indicating new content should immediately 
         * final int replace old content with no visual effect.
         */
        TYPE_IMMEDIATE_REPLACE: 0,
            
        /**
         * Transition setting describing a visual effect where the
         * viewing area pans to the left to realize the new content.
         * Old content exits to the right side of the screen.
         * New content enters from the left side of the screen. 
         */
        TYPE_CAMERA_PAN_LEFT: 1,
        
        /**
         * Transition setting describing a visual effect where the
         * viewing area pans to the right to realize the new content.
         * Old content exits to the left side of the screen.
         * New content enters from the right side of the screen. 
         */
        TYPE_CAMERA_PAN_RIGHT: 2,
        
        /**
         * Transition setting describing a visual effect where the
         * viewing area pans up to realize the new content.
         * Old content exits to the bottom of the screen.
         * New content enters from the top of the screen. 
         */
        TYPE_CAMERA_PAN_UP: 3,
        
        /**
         * Transition setting describing a visual effect where the
         * viewing area pans to up to realize the new content.
         * Old content exits to the top of the screen.
         * New content enters from the bottom of the screen. 
         */
        TYPE_CAMERA_PAN_DOWN: 4,
        
        /**
         * Transition setting for a horizontal blind effect with a black background.
         * Top of blinds rotate inward.
         */
        TYPE_BLIND_BLACK_IN: 5,
        
        /**
         * Transition setting for a horizontal blind effect with a black background.
         * Top of blinds rotate outward.
         */
        TYPE_BLIND_BLACK_OUT: 6,
        
        /**
         * Transition setting to fade to black, fade in new content.
         */
        TYPE_FADE_TO_BLACK: 7,
    
        /**
         * Transition setting to fade to white, fade in new content.
         */
        TYPE_FADE_TO_WHITE: 8,

        /**
         * Fades to new content over old content.
         */
        TYPE_FADE: 9
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.TransitionPane", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.TransitionPane",

    /** @see Echo.Component#pane */
    pane: true
});
