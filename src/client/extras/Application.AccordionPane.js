/**
 * AccordionPane component: contains multiple children in vertically arranged
 * tabs that slide up and down to reveal a single child at a time. May contain
 * multiple children. May contain panes as children.
 * 
 * @sp {Number} animationTime the duration (in milliseconds) for which the
 *     animation transition effect should be rendered A value of zero indicates
 *     an instantaneous transition
 * @sp {#Insets} defaultContentInsets the default inset margin to display around
 *     child components
 * @sp {#Color} tabBackground the tab background color
 * @sp {#FillImage} tabBackgroundImage the tab background image
 * @sp {#Border} tabBorder the tab border
 * @sp {#Color} tabForeground the tab foreground color
 * @sp {#Insets} tabInsets the tab inset margin
 * @sp {#Color} tabRolloverBackground the tab rollover background color
 * @sp {#FillImage} tabRolloverBackgroundImage the tab rollover background image
 * @sp {#Border} tabRolloverBorder the tab rollover border
 * @sp {Boolean} tabRolloverEnabled flag indicating whether rollover effects are
 *     enabled
 * @sp {#Color} tabRolloverForeground the tab rollover foreground color
 * @ldp {#ImageReference} icon the icon to display within a tab
 * @ldp {String} title the text to display within a tab
 */
Extras.AccordionPane = Core.extend(Echo.Component, {
    
    $static: {
    
        /**
         * The default animation time, 350ms.
         */
        DEFAULT_ANIMATION_TIME: 350
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.AccordionPane", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.AccordionPane",

    /** @see Echo.Component#pane */
    pane: true
});

