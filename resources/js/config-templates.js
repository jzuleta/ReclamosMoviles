var templates = (function () {
    var dataPath = 'resources/templates/',
        sourceParameters = {
            searching: {
                name: 'searching.html',
                content: ''
            },
            compatibility_error: {
                name: 'compatibily_error.html',
                content: ''
            },
            permission_denied: {
                name: 'permission_denied.html',
                content: ''
            },
            position_unavailable: {
                name: 'position_unavailable.html',
                content: ''
            },
            timeout: {
                name: 'timeout.html',
                content: ''
            },
            address_detail: {
                name: 'address_detail.html',
                content: ''
            },
            location_problem: {
                name: 'location_problem.html',
                content: ''
            }
        },
        initialize = {
            readTemplates: function () {
                $.each(sourceParameters, function (index, value) {
                    $.ajax({
                        url: dataPath + value.name,
                        async: false,
                        success: function (json) {
                            value.content = json;
                        }
                    });
                });
            }
        };
    initialize.readTemplates();

    return {
        collection: sourceParameters
    }

})();