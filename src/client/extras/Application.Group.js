/**
 * Group component: A container which renders a border consisting of images
 * around its content. Optionally draws a title in the top border. May contain
 * one child component. May not contain a pane component as a child.
 * 
 * @sp {#FillImage} backgroundImage background image to display behind content
 * @sp {Array} borderImage an array containing the top-left, top, top-right,
 *     left, right, bottom-left, bottom, and bottom-right images that make up
 *     the border (note this an array of ImageReferences, not FillImages
 * @sp {#Number} borderInsets the inset margin used to provide space for the
 *     border (a zero inset would render the content over the border)
 * @sp {String} title
 * @sp {#FillImage} titleBackgroundImage background image to display behind 
 *     title
 * @sp {#Extent} titlePosition the title position, relative to the top-left
 *     corner of the component
 * @sp {#Font} titleFont the title font
 * @sp {#Insets} titleInsets the title inset margin
 */
Extras.Group = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.Group", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Extras.Group"
});
