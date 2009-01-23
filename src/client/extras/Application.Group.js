/**
 * Group component: A container which renders a border consisting of images
 * around its content. Optionally draws a title in the top border. May contain
 * one child component. May not contain a pane component as a child.
 * 
 * @sp {#FillImage} backgroundImage background image to display behind content
 * @sp {Array} borderImage an array containing the top-left, top, top-right,
 *     left, right, bottom-left, bottom, and bottom-right images that make up
 *     the border (note this an array of ImageReferences, not FillImages
 * @sp {Number} borderInsets the inset margin used to provide space for the
 *     border (if the left border were 6 pixels wide, the left portion of the
 *     inset should be also be configured to 6 pixels; a zero inset would render
 *     the content over the border)
 * @sp {#Insets} insets the inset margin around the content.
 * @sp {String} title
 * @sp {#FillImage} titleBackgroundImage background image to display behind
 *     title
 * @sp {#Font} titleFont the title font
 * @sp {#Insets} titleInsets the title inset margin
 * @sp {#Extent} titlePosition the title position, relative to the top-left
 *     corner of the component
 */
Extras.Group = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Group", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Extras.Group"
});
