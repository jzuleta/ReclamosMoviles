var appController = (function () {
    var app = {
        mapOptions: {
            center: new google.maps.LatLng(-33.436936630999635, -70.64826747099966),
            streetViewControl: false,
            mapTypeControl: false,
            overviewMapControl: false,
            panControl: false,
            zoom: 16,
            zoomControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map: null,
        userMarker: null,
        currentPosition: null
    },
        st = {
            topBarContent: "#app-top-bar",
            appTransition: "#app-transitions",
            searchAddress: "#search-address",
            searchAddressMap: "#search-address-map",
            geolocate: "#geolocate",
            topBarIcon: ".top-bar-icon",
            searchStatus: "#search-status"
        },
        dom = {

        },
        catchDom = function () {
            dom.searchAddress = $(st.searchAddress);
            dom.topBarIcon = $(st.topBarIcon);
            dom.geolocate = $(st.geolocate);
            dom.searchStatus = $(st.searchStatus);
        },
        navigationControl = {
            createTransitions: function () {
                dom.panels = slidr.create(st.appTransition.slice(1), {
                    controls: "none",
                    fade: true,
                    overflow: false,
                    timing: {
                        'linear': "0.4s ease-in-out 0s"
                    }
                }).start();
                dom.topBar = slidr.create(st.topBarContent.slice(1), {
                    controls: "none",
                    direction: "vertical",
                    fade: true,
                    transition: "none"
                }).start();
            },
            backTo: function () {
                var direction = $(this).data("direction");
                dom.panels.slide(direction);
                dom.topBar.slide(direction);
            },
            createPanelStatus: function (template) {
                dom.searchStatus.html(template);
                dom.searchStatus.css("margin-bottom", "0");
            },
            cleanPanelStatus: function (timer) {
                setTimeout(function () {
                    dom.searchStatus.css("margin-bottom", "-300px");
                }, timer);
            }
        },
        mapControl = {
            positionSearch: function () {
                if (navigator && navigator.geolocation) {
                    navigationControl.createPanelStatus(templates.collection.searching.content);
                    navigator.geolocation.getCurrentPosition(mapControl.foundPosition, mapControl.searchError, {
                        enableHighAccuracy: true,
                        timeout: 10000
                    });

                } else {
                    navigationControl.createPanelStatus(templates.collection.compatibility_error.content);
                }
            },
            foundPosition: function (position) {
                app.currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                mapControl.addUserMarker();
                navigationControl.cleanPanelStatus(1000);
            },
            addUserMarker: function() {
                app.userMarker = new google.maps.Marker({
                    position: app.currentPosition,
                    animation: google.maps.Animation.DROP
                });
                
                app.userMarker.setMap(app.map);
                app.map.panTo(app.currentPosition);
                app.map.setZoom(16);
            },
            searchError: function (error) {

                var errorTemplate = "";
                switch (error.code) {
                    case 1:
                        errorTemplate = "permission_denied";
                        break;
                    case 2:
                        errorTemplate = "position_unavailable";
                        break;
                    case 3:
                        errorTemplate = "timeout";
                        break;
                }
                navigationControl.createPanelStatus(templates.collection[errorTemplate].content);

                navigationControl.cleanPanelStatus(3000);
            }
        },
        events = {
            addressMap: function () {
                dom.panels.slide("map-register");
                dom.topBar.slide("map-register");
            },
            initializeMaps: function () {
                app.map = new google.maps.Map(document.getElementById(st.searchAddressMap.slice(1)), app.mapOptions);
            }
        },
        suscribeEvents = function () {
            events.initializeMaps();

            navigationControl.createTransitions();
            dom.searchAddress.on("click", events.addressMap);
            dom.topBarIcon.on("click", navigationControl.backTo);
            dom.geolocate.on("click", mapControl.positionSearch);
        };
    catchDom();
    suscribeEvents();
})();