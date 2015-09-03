var appController = (function() {
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
            geocoder: new google.maps.Geocoder(),
            map: null,
            userMarker: null,
            currentPosition: null,
            autocomplete: null
        },
        st = {
            topBarContent: "#app-top-bar",
            appTransition: "#app-transitions",
            searchAddressMap: "#search-address-map",
            geolocate: "#geolocate",
            topBarIcon: ".top-bar-icon",
            searchStatus: "#search-status",
            inputSearch: "#search-input",
            mapPreview: "#map-preview",
            addressConfirm: "#confirm-address",
            addressProblem: "#address-problem",
            closeAdvices: "#close_advices"
        },
        dom = {

        },
        catchDom = function() {
            dom.topBarIcon = $(st.topBarIcon);
            dom.geolocate = $(st.geolocate);
            dom.searchStatus = $(st.searchStatus);
            dom.mapPreview = $(st.mapPreview);
        },
        navigationControl = {
            createTransitions: function() {
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
            backTo: function() {
                var direction = $(this).data("direction");
                dom.panels.slide(direction);
                dom.topBar.slide(direction);
            },
            createPanelStatus: function(template) {
                dom.searchStatus.html(template);
                dom.searchStatus.css("margin-bottom", "0");
            },
            cleanPanelStatus: function (timer) {
                
                setTimeout(function() {
                    dom.searchStatus.css("margin-bottom", "-300px")
                       .empty();
                }, timer);
            },
            addressPanel: function(address) {
                mapControl.processAddress(address);
                navigationControl.createPanelStatus(
                    Mustache.render(templates.collection.address_detail.content, mapControl.processAddress(address)));


                $(st.addressProblem).on("click", navigationControl.addressProblem);
                $(st.addressConfirm).on("click", navigationControl.addressConfirm);
            },
            addressProblem: function () {
                dom.searchStatus.html(templates.collection.location_problem.content);
                $(st.closeAdvices).on("click", function () { navigationControl.cleanPanelStatus(500) });
            },
            addressConfirm: function() {
                dom.panels.slide("login");
                dom.topBar.slide("login");
                dom.mapPreview.empty();

                var mapPreview = new google.maps.Map(document.getElementById(st.mapPreview.slice(1)), {
                    center: app.currentPosition,
                    draggable: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    overviewMapControl: false,
                    panControl: false,
                    zoom: 17,
                    zoomControl: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                var d = new google.maps.Marker({
                    position: app.currentPosition
                });

                d.setMap(mapPreview);
            }
        },
        mapControl = {
            positionSearch: function() {
                if (navigator && navigator.geolocation) {
                    navigationControl.createPanelStatus(templates.collection.searching.content);
                    navigator.geolocation.getCurrentPosition(mapControl.foundPosition, mapControl.searchError, {
                        timeout: 10000
                    });

                } else {
                    navigationControl.createPanelStatus(templates.collection.compatibility_error.content);
                }
            },
            foundPosition: function(position) {
                app.currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                mapControl.addUserMarker();
                mapControl.getAddressFromCoordinates();
            },
            getAddressFromCoordinates: function() {
                app.geocoder.geocode({
                    'latLng': app.currentPosition
                }, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        navigationControl.addressPanel(results[0].formatted_address);
                    } else {
                        alert("Geocoder failed due to: " + status);
                    }
                });
            },
            addUserMarker: function() {
                app.userMarker = new google.maps.Marker({
                    animation: google.maps.Animation.DROP,
                    draggable: true,
                    position: app.currentPosition
                });

                app.userMarker.setMap(app.map);
                app.map.panTo(app.currentPosition);
                app.map.setZoom(16);

                google.maps.event.addListener(app.userMarker, "dragend", function(event) {
                    app.currentPosition = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                    mapControl.getAddressFromCoordinates();
                });
            },
            processAddress: function(address) {
                var partAddress = address.split(","),
                    cleanAddress = [];

                $.each(partAddress, function(i, el) {
                    if ($.inArray(el, cleanAddress) === -1) cleanAddress.push(el);
                });

                return {
                    primary: cleanAddress[0] + ", " + cleanAddress[1],
                    secondary: cleanAddress[2]
                };
            },
            searchError: function(error) {
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
            addressMap: function() {
                dom.panels.slide("map-register");
                dom.topBar.slide("map-register");
            },
            initializeMaps: function() {
                app.map = new google.maps.Map(document.getElementById(st.searchAddressMap.slice(1)), app.mapOptions);

                var input = document.getElementById(st.inputSearch.slice(1)),
                    options = {
                        componentRestrictions: { country: "cl" }
                    };
                app.autocomplete = new google.maps.places.Autocomplete(input, options);
                google.maps.event.addListener(app.autocomplete, "place_changed", function() {
                    var position = app.autocomplete.getPlace();
                    mapControl.foundPosition({
                        coords: {
                            latitude: position.geometry.location.G,
                            longitude: position.geometry.location.K
                        }
                    });
                });
            }
        },
        suscribeEvents = function() {
            events.initializeMaps();

            navigationControl.createTransitions();

            dom.mapPreview.on("click", events.addressMap);
            dom.topBarIcon.on("click", navigationControl.backTo);
            dom.geolocate.on("click", mapControl.positionSearch);
        };
    catchDom();
    suscribeEvents();
})();