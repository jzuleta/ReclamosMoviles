(function() {
    "use strict";
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
            autocomplete: null,
            userData: {},
            lastPanelState: null,
            lastUrl: "none"
        },
        st = {
            toast: "#toast-content",
            topBarContent: "#app-top-bar",
            appTransition: "#app-transitions",
            searchAddressMap: "#search-address-map",
            geolocate: "#geolocate",
            topBarIcon: ".top-action",
            addressSearchStatus: ".search-status",
            searchStatus: "#search-status",
            currentStatus: "#current-status",
            userStatus: "#user-status",
            inputSearch: "#search-input",
            mapPreview: "#map-preview",
            addressConfirm: "#confirm-address",
            addressProblem: "#address-problem",
            closeAdvices: "#close_advices",
            login: "#login",
            editAddress: "#edit-address",
            loginContent: "#login-form",
            addNewEvent: "#add-new-event",
            loginInputs: "#login-form input",
            userAddress: "#user-address",
            userDataContent: "#user-data-content",
            closePanel: ".alternative.close-icon",
            confirmationDetail: "#confirmation-detail #fields",
            eventCards: "#cards-content .event-card",
            submitEvent: "#submit-event"
        },
        dom = {},
        catchDom = function() {
            dom.toast = $(st.toast);
            dom.loginContent = $(st.loginContent);
            dom.topBarContent = $(st.topBarContent);
            dom.appTransition = $(st.appTransition);
            dom.topBarIcon = $(st.topBarIcon);
            dom.addressSearchStatus = $(st.addressSearchStatus);
            dom.geolocate = $(st.geolocate);
            dom.searchStatus = $(st.searchStatus);
            dom.currentStatus = $(st.currentStatus);
            dom.userStatus = $(st.userStatus);
            dom.mapPreview = $(st.mapPreview);
            dom.login = $(st.login);
            dom.editAddress = $(st.editAddress);
            dom.userAddress = $(st.userAddress);
            dom.userDataContent = $(st.userDataContent);
            dom.closePanel = $(st.closePanel);
            dom.addNewEvent = $(st.addNewEvent);
            dom.confirmationDetail = $(st.confirmationDetail);
            dom.eventCards = $(st.eventCards);
            dom.submitEvent = $(st.submitEvent);
        },
        navigationControl = {
            hideToast: function() {
                $(this).hide();
            },
            searchUser: function() {
                //$.ajax({
                //    url: "WebService.asmx/SearchUser",
                //    data: JSON.stringify({
                //        address: app.userData.primary_address + ", " + app.userData.secondary_address
                //    }),
                //    dataType: "json",
                //    type: "POST",
                //    contentType: "application/json; charset=utf-8",
                //    success: function (data) {
                //        app.userData.sec_id = data.d;
                //        localStorage.setItem("rm_user", JSON.stringify(app.userData));
                //    },
                //    error: function (xmlHttpRequest, textStatus) {
                //        alert(textStatus);
                //    }
                //});

            },
            submitNewEvent: function() {
                var submitObject = app.userData;
                $("#confirmation-detail .required").each(function(index, value) {
                    var d = $(value).text() || $(value).val();
                    submitObject[$(value).data("confirm")] = d;
                });

                console.log(JSON.stringify(submitObject));
            },
            addBrowserHistory: function(state) {
                console.info(state);
                history.pushState({
                    state: state
                }, state, "");
            },
            addressSearchStatus: function() {
                dom.topBar.slide($(this).data("direction"));
            },
            backTo: function() {
                var direction = $(this).data("direction");
                dom.panels.slide(direction);
                dom.topBar.slide(direction);
            },
            showUserStatus: function() {
                dom.panels.slide("events-content");
                dom.topBar.slide("events-content");

                navigationControl.addBrowserHistory("events-content");
                navigationControl.removeUserLayout();
                app.lastPanelState = "map";
            },
            createPanelStatus: function(template) {
                dom.searchStatus.html(template);
                dom.searchStatus.css("margin-bottom", "0");
            },
            cleanPanelStatus: function(timer) {
                setTimeout(function() {
                    dom.searchStatus.css("margin-bottom", "-300px")
                        .empty();
                }, timer);
            },
            addressPanel: function(address) {
                mapControl.processAddress(address);

                navigationControl.createPanelStatus(
                    Mustache.render(templates.collection.address_detail.content, app.userData));

                $(st.addressProblem).on("click", navigationControl.addressProblem);
                $(st.addressConfirm).on("click", navigationControl.addressConfirm);
            },
            addressProblem: function() {
                dom.searchStatus.html(templates.collection.location_problem.content);
                $(st.closeAdvices).on("click", function() {
                    navigationControl.cleanPanelStatus(10);
                });
            },
            addressConfirm: function() {
                dom.panels.slide("login");
                dom.topBar.slide("login");
                navigationControl.cleanPanelStatus(500);
                mapControl.createUserMap();
            },
            createUserLayout: function() {
                if (events.userDataValidation()) { 
                    app.currentPosition =
                        new google.maps.LatLng(app.userData.coordenada_x, app.userData.coordenada_y);

                    mapControl.addUserMarker();
                    app.userMarker.setOptions({
                        draggable: false
                    });

                    navigationControl.configUserLayout();
                    dom.userDataContent.html(
                        Mustache.render(templates.collection.user_data_content.content,
                            app.userData));

                    navigationControl.addBrowserHistory("user-map");
                }
            },
            configUserLayout: function() {
                dom.topBarContent.height(105);
                dom.panels.slide("map-content");
                dom.topBar.slide("user-map");
                dom.editAddress.show();
                dom.userStatus.show();

                navigationControl.cleanPanelStatus(500);
            },
            closeControl: function() {
                if (app.lastPanelState === "map") {
                    navigationControl.configUserLayout();
                } else {
                    dom.panels.slide("events-content");
                    dom.topBar.slide("events-content");
                    app.lastPanelState = "map";
                }
            },
            removeUserLayout: function() {
                dom.topBarContent.height(57);
                dom.editAddress.hide();
                dom.userStatus.hide();
            },
            fillUserInputs: function() {
                $.each($(st.loginInputs + ":not([type=hidden]"), function(index, value) {
                    $(value).val(app.userData[$(value).data("parameter")]);
                });
            },
            fillUserConfirm: function() {
                dom.panels.slide("event-confirm");
                dom.topBar.slide("event-confirm");
                navigationControl.removeUserLayout();
                navigationControl.addBrowserHistory("event-confirm");
            },
            confirmNewEvent: function() {
                navigationControl.fillUserConfirm();
                app.userData.users = 1;
                app.userData.time = "Evento nuevo";

                dom.confirmationDetail.html(
                    Mustache.render(templates.collection.event_confirm.content, app.userData));

                app.lastPanelState = "map";
            },
            confirmSomeEvent: function() {
                var selectedCard = db.information[$(this).attr("id")];
                selectedCard["nombre_cliente"] = app.userData.nombre_cliente;
                selectedCard["apellido_paterno"] = app.userData.apellido_paterno;
                selectedCard["email"] = app.userData.email;
                selectedCard["telefono"] = app.userData.telefono;
                selectedCard["sec_id"] = app.userData.sec_id;

                navigationControl.fillUserConfirm();
                dom.confirmationDetail.html(
                    Mustache.render(templates.collection.event_confirm.content, selectedCard));

                app.lastPanelState = "card";
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
                app.currentPosition =
                    new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                app.userData.coordenada_x = position.coords.latitude;
                app.userData.coordenada_y = position.coords.longitude;

                mapControl.addUserMarker();
                mapControl.getAddressFromCoordinates();
            },
            getAddressFromCoordinates: function() {
                app.geocoder.geocode({
                    "latLng": app.currentPosition
                }, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        navigationControl.addressPanel(results[0].formatted_address);
                    } else {
                        alert("Geocoder failed due to: " + status);
                    }
                });
            },
            addUserMarker: function() {
                if (app.userMarker !== null)
                    app.userMarker.setMap(null);

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
                    app.userData.coordenada_x = event.latLng.lat();
                    app.userData.coordenada_y = event.latLng.lng();
                    app.map.panTo(app.currentPosition);
                    mapControl.getAddressFromCoordinates();
                });
            },
            processAddress: function(address) {
                var partAddress = address.split(","),
                    cleanAddress = [];

                $.each(partAddress, function(i, el) {
                    if ($.inArray(el, cleanAddress) === -1) cleanAddress.push(el);
                });

                app.userData.primary_address = cleanAddress[0] + ", " + cleanAddress[1];
                app.userData.secondary_address = cleanAddress[2];
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
            },
            fixInfoWindow: function() {
                var set = google.maps.InfoWindow.prototype.set;
                google.maps.InfoWindow.prototype.set = function(key, val) {
                    if (key === "map") {
                        if (!this.get("noSupress")) {
                            console.log("This InfoWindow is supressed. To enable it, set \"noSupress\" option to true");
                            return;
                        }
                    }
                    set.apply(this, arguments);
                };
            },
            createUserMap: function() {
                dom.mapPreview.empty();
                dom.login.css("display", "block");
                dom.userAddress.show()
                    .html(Mustache.render(templates.collection.user_address.content, app.userData));
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
                    }),
                    d = new google.maps.Marker({
                        position: app.currentPosition,
                        map: mapPreview
                    });
            }
        },
        localDatabase = {
            checkExist: function() {
                return (localStorage.getItem("rm_user") === null) ? false : true;
            },
            saveChanges: function() {
                if (events.userDataValidation()) {
                    localStorage.setItem("rm_user", JSON.stringify(app.userData));
                    navigationControl.createUserLayout();
                }
            }
        },
        events = {
            addressMap: function() {
                if (app.userMarker !== null)
                    app.userMarker.setOptions({
                        draggable: true
                    });

                dom.panels.slide("map-content");
                dom.topBar.slide("map-content");
                navigationControl.addBrowserHistory("map-content");
            },
            userDataValidation: function() {
                var isValid = true;
                $.each($(st.loginInputs), function(index, value) {
                    var element = $(value),
                        parameter = element.data("parameter"),
                        checkElement;

                    switch (parameter) {
                        case "rut_cliente":
                            checkElement = events.validateRUT($.trim(value.value));
                            break;
                        case "email":
                            checkElement = events.validateEmail($.trim(value.value));
                            break;
                        default:
                            checkElement = $.trim(value.value).length !== 0;
                    }

                    if (!checkElement) {
                        $(value).addClass("input-error");
                        isValid = false;
                    } else {
                        app.userData[parameter] = value.value;
                        $(value).removeClass("input-error");
                    }
                });

                return isValid;
            },
            validateRUT: function(rut) {
                if (rut.toString().trim() !== "" && rut.toString().indexOf("-") > 0) {
                    var caracteres = new Array();
                    var serie = new Array(2, 3, 4, 5, 6, 7);
                    var dig = rut.toString().substr(rut.toString().length - 1, 1);
                    rut = rut.toString().substr(0, rut.toString().length - 2);

                    for (var i = 0; i < rut.length; i++) {
                        caracteres[i] = parseInt(rut.charAt((rut.length - (i + 1))));
                    }

                    var sumatoria = 0;
                    var k = 0;
                    var resto = 0;

                    for (var j = 0; j < caracteres.length; j++) {
                        if (k === 6) {
                            k = 0;
                        }
                        sumatoria += parseInt(caracteres[j]) * parseInt(serie[k]);
                        k++;
                    }

                    resto = sumatoria % 11;
                    var dv = 11 - resto;

                    if (dv === 10) {
                        dv = "K";
                    } else if (dv === 11) {
                        dv = 0;
                    }

                    if (dv.toString().trim().toUpperCase() === dig.toString().trim().toUpperCase())
                        return true;
                    else
                        return false;
                } else {
                    return false;
                }

            },
            validateEmail: function(email) {
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return re.test(email);
            },
            initializeMaps: function() {
                app.map = new google.maps.Map(document.getElementById(st.searchAddressMap.slice(1)), app.mapOptions);

                var input = document.getElementById(st.inputSearch.slice(1)),
                    options = {
                        componentRestrictions: {
                            country: "cl"
                        }
                    };
                app.autocomplete = new google.maps.places.Autocomplete(input, options);
                google.maps.event.addListener(app.autocomplete, "place_changed", function() {
                    var position = app.autocomplete.getPlace();
                    mapControl.foundPosition({
                        coords: {
                            latitude: position.geometry.location.lat(),
                            longitude: position.geometry.location.lng()
                        }
                    });
                });
                mapControl.fixInfoWindow();
            },
            initializeTransitions: function() {
                dom.panels = slidr.create(st.appTransition.slice(1), {
                    controls: "none",
                    fade: true,
                    overflow: false,
                    timing: {
                        "linear": "0.4s ease-in-out 0s"
                    }
                }).start();
                dom.topBar = slidr.create(st.topBarContent.slice(1), {
                    controls: "none",
                    direction: "vertical",
                    fade: true,
                    transition: "none"
                }).start();
            }
        },
        suscribeEvents = function() {
            events.initializeMaps();
            events.initializeTransitions();

            dom.currentStatus.on("click", navigationControl.showUserStatus);
            dom.mapPreview.on("click", events.addressMap);
            dom.geolocate.on("click", mapControl.positionSearch);
            dom.topBarIcon.on("click", navigationControl.backTo);
            dom.login.on("click", localDatabase.saveChanges);
            dom.editAddress.on("click", navigationControl.removeUserLayout);
            dom.closePanel.on("click", navigationControl.closeControl);
            dom.addNewEvent.on("click", navigationControl.confirmNewEvent);
            dom.eventCards.on("click", navigationControl.confirmSomeEvent);
            dom.submitEvent.on("click", navigationControl.submitNewEvent);
            dom.toast.on("click", navigationControl.hideToast);
        },
        checkLocalDatabase = function() {
            if (localDatabase.checkExist()) {
                app.userData = jQuery.parseJSON(localStorage.getItem("rm_user"));
                app.currentPosition =
                    new google.maps.LatLng(app.userData.coordenada_x, app.userData.coordenada_y);

                mapControl.addUserMarker();
                mapControl.createUserMap();

                navigationControl.fillUserInputs();
                navigationControl.createUserLayout();
            }
        },
        removeSplash = function() {
            $(window).load(function() {
                $("#splash").remove();
            });

            window.addEventListener("popstate", function(e) {
                if (e.state !== null) {
                    console.info(history.length);
                    window.history.go((history.length - 3) * -1);
                    console.info(history.length);

                } else {
                    console.info("Fin del historial");
                }

                dom.toast.show();
            });
        };

    catchDom();
    suscribeEvents();
    checkLocalDatabase();
    removeSplash();
})();