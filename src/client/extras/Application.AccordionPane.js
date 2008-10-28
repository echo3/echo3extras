/**
 * AccordionPane component.
 *
 * @sp {Number} animationTime the duration (in milliseconds) for which the animation transition effect should be rendered
 *     A value of zero indicates an instantaneous transition
 * @sp {#Color} tabBackground the tab background color
 * @sp {#Color} tabBackground the tab background color
 * @sp {#FillImage} tabBackgroundImage the tab backgruond image
 * @sp {#Border} tabBorder the tab border
 * @sp {#Color} tabForeground the tab foreground color
 * @sp {#Insets} tabInsets the tab inset margin
 * @sp {#Color} tabRolloverBackground the tab rollover background color
 * @sp {#FillImage} tabRolloverBackgroundImage the tab rollover backgruond image
 * @sp {#Border} tabRolloverBorder the tab rollover border
 * @sp {Boolean} tabRolloverEnabled flag indicating whether rollover effects are enabled
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
    
    componentType: "Extras.AccordionPane",
    pane: true
});

