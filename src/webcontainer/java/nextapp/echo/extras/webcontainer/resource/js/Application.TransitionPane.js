/**
 * Creates a new TransitionPane.
 * 
 * @constructor
 * @class TransitionPane component.
 * @base EchoApp.Component
 */
ExtrasApp.TransitionPane = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ExtrasApp.TransitionPane";
};

ExtrasApp.TransitionPane.prototype = new EchoApp.Component;

/**
 * Transition setting indicating new content should immediately 
 * final int replace old content with no visual effect.
 */
ExtrasApp.TransitionPane.TYPE_IMMEDIATE_REPLACE = 0;
    
/**
 * Transition setting describing a visual effect where the
 * viewing area pans to the left to realize the new content.
 * Old content exits to the right side of the screen.
 * New content enters from the left side of the screen. 
 */
ExtrasApp.TransitionPane.TYPE_CAMERA_PAN_LEFT = 1;

/**
 * Transition setting describing a visual effect where the
 * viewing area pans to the right to realize the new content.
 * Old content exits to the left side of the screen.
 * New content enters from the right side of the screen. 
 */
ExtrasApp.TransitionPane.TYPE_CAMERA_PAN_RIGHT = 2;

/**
 * Transition setting describing a visual effect where the
 * viewing area pans up to realize the new content.
 * Old content exits to the bottom of the screen.
 * New content enters from the top of the screen. 
 */
ExtrasApp.TransitionPane.TYPE_CAMERA_PAN_UP = 3;

/**
 * Transition setting describing a visual effect where the
 * viewing area pans to up to realize the new content.
 * Old content exits to the top of the screen.
 * New content enters from the bottom of the screen. 
 */
ExtrasApp.TransitionPane.TYPE_CAMERA_PAN_DOWN = 4;

/**
 * A horizontal blind effect with a black background.
 * Top of blinds rotate inward.
 */
ExtrasApp.TransitionPane.TYPE_BLIND_BLACK_IN = 5;

/**
 * A horizontal blind effect with a black background.
 * Top of blinds rotate outward.
 */
ExtrasApp.TransitionPane.TYPE_BLIND_BLACK_OUT = 6;

/**
 * Fades to black, fades in new content.
 */
ExtrasApp.TransitionPane.TYPE_FADE_TO_BLACK = 7;

/**
 * Fades to white, fades in new content.
 */
ExtrasApp.TransitionPane.TYPE_FADE_TO_WHITE = 8;

/**
 * Fades to new content over old content.
 */
ExtrasApp.TransitionPane.TYPE_FADE = 9;
