(function () {
    var _ = LIBRARY;

    var POPUP = {
        url: null,
        ext_status: "1",

        getData: function (callback) {
            var _this = this;

            chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
                var tabId;

                if (tabs.length === 0) {
                    return;
                }

                tabId = tabs[0].id;

                _this.url = tabs[0].url;
                
                _.msgBackground({action: 'getPopupData', tabId: tabId}, function (data) {
                    if (typeof callback === "function") {
                        callback(data);
                    }
                });
            });    
        },

        addBind: function () {
            var _this = this;

            document.getElementById("myonoffswitch").addEventListener("change", function () {
                var checked = this.checked;

                _this.ext_status = (checked ? "1" : "0");

                document.body.className = ("on-" + checked);

                _.msgBackground({action: 'changeExtStatus', enable: checked});
            }, false);

            document.getElementById("bn_error_report").addEventListener("click", function () {
                if (_this.ext_status === "0") {
                    return;
                }

                _.msgBackground({action: 'adReport', url: _this.url});
            });
        },

        run: function () {
            var _this = this;

            this.getData(function (data) {
                _this.ext_status = data.ext_status;

                if (data.ext_status === "0") {
                    document.body.className = "on-false";
                    document.getElementById("myonoffswitch").checked = false;
                }

                document.getElementById("total_blocked").innerHTML = data.total;
                document.getElementById("page_blocked").innerHTML = data.page;

                _this.addBind();
            });
        }
    };

    window.addEventListener("load", function () {
        POPUP.run();
    }, false);
} ());