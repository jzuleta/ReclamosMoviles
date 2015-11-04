var screenConfig = (function() {
    var dom = {},
        catchDom = function() {
            dom.transitionPanel = $("#app-transitions, .transition-component");
            dom.document = $(window);
        },
        suscribeEvents = function () {
            $(window).resize(reziseTransitionPanel);
        },
        reziseTransitionPanel = function (e) {
            dom.transitionPanel.height(dom.document.height() - 57);
        },
        initialize = function() {
            catchDom();
            reziseTransitionPanel();
            suscribeEvents();
        };

    return {
        init: initialize
    };
})();


screenConfig.init();