(function () {
    var _ = LIBRARY,
        POPUP,
        dom = DOM;

    POPUP = {
        url         : null,
        ext_status  : "1",
        has_bad_ext : false,

        getData: function (callback) {
            var _this = this;

            chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (tabs) {
                var tabId;

                if (tabs.length === 0) {
                    return;
                }

                tabId = tabs[0].id;

                _this.url = tabs[0].url;
                
                _.msgBackground({action: 'getPopupData', tabId: tabId, url: _this.url}, function (data) {
                    if (typeof callback === "function") {
                        callback(data);
                    }
                });
            });    
        },

        addBind: function () {
            var _this      = this,
                el_cookies = dom.id('block_party_cookies'),
                el_onoff,
                el_report;

            el_onoff = dom.id("myonoffswitch");
            el_report = dom.id("bn_error_report");

            el_onoff.addEventListener("change", function () {
                var checked = this.checked;

                _this.ext_status = (checked ? "1" : "0");

                document.body.className = ("on-" + checked);

                _.msgBackground({action: 'changeExtStatus', enable: checked});

                if (checked) {
                    el_cookies.removeAttribute('disabled');
                } else {
                    el_cookies.setAttribute('disabled', 'disabled');
                }

                _this.checkBnReport();
            }, false);

            if (!!el_report) {
                el_report.addEventListener("click", function () {
                    if (_this.ext_status === "0") {
                        return;
                    }

                    if (_this.was_report) {
                        return;
                    }

                    _this.was_report = true;

                    _this.checkBnReport();

                    _.msgBackground({action: 'adReport', url: _this.url});
                });
            }

            dom.id('block_party_cookies').addEventListener('change', function () {
                _.msgBackground({action: 'changePartyCookies'});
            });
        },

        checkBnReport: function () {
            var _this = this,
                el_report = dom.id("bn_error_report");

            if (_this.was_report) {
                el_report.innerHTML = chrome.i18n.getMessage("was_report");
                el_report.className = "disabled";
                el_report.setAttribute("disabled", "disabled");
            } else {
                el_report.innerHTML = chrome.i18n.getMessage("create_report");

                if (_this.ext_status === "0") {
                    el_report.setAttribute("disabled", "disabled");
                } else {
                    el_report.removeAttribute("disabled");
                }
            }
        },

        setI18n: function () {
            dom.id("total_blocked_info").innerHTML       = chrome.i18n.getMessage("total_blocked");
            dom.id("page_blocked_info").innerHTML        = chrome.i18n.getMessage("page_blocked");
            dom.id("page_has_ad").innerHTML              = chrome.i18n.getMessage("page_has_ad");
            dom.id("bn_error_report").innerHTML          = chrome.i18n.getMessage("create_report");
            dom.id('block_party_cookies_text').innerHTML = chrome.i18n.getMessage("block_cookies");
            dom.id("vk_link").setAttribute("title", chrome.i18n.getMessage("vk_link"));
            dom.id("view_extensions").setAttribute("title", chrome.i18n.getMessage("view_extensions"));
        },

        setViewExtensionUrl: function () {
            dom.id("view_extensions").setAttribute("href", chrome.runtime.getURL("html/extensions.html"));
        },

        initTabs: function () {
            var tabs,
                i;

            tabs = document.querySelectorAll('.tabs>.tab');

            for (i = 0; i < tabs.length; ++i) {
                (function (tab) {
                    dom.addEvent(tab, 'click', function (e) {
                        var tabs_content,
                            link,
                            i;

                        for (i = 0; i < tabs.length; ++i) {
                            tabs[i].classList.remove('tab-active');
                        }

                        tabs_content = document.querySelectorAll('.content > .tab-content');

                        for (i = 0; i < tabs_content.length; ++i) {
                            tabs_content[i].classList.remove('tab-content-active');
                        }

                        tab.classList.add('tab-active');
                        link = tab.getAttribute('data-tab');

                        document.querySelector('.' + link).classList.add('tab-content-active');
                    });
                }(tabs[i]));
            }

        },

        run: function () {
            var _this = this;

            this.initTabs();

            this.setI18n();
            this.setViewExtensionUrl();
            this.getData(function (data) {
                var bn_onoff         = dom.id("bn_onoff_container");

                _this.ext_status  = data.ext_status;
                _this.was_report  = data.was_report;
                _this.has_bad_ext = data.has_bad_ext;

                if (data.ext_status === "0") {
                    bn_onoff.innerHTML = "" +
                        '<div class="onoffswitch">' +
                            '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch">' +
                            '<label class="onoffswitch-label" for="myonoffswitch">' +
                                '<span class="onoffswitch-inner"></span>' +
                                '<span class="onoffswitch-switch"></span>' +
                            '</label>' +
                        '</div>';

                    document.body.className = "on-false";
                } else {
                    bn_onoff.innerHTML = "" +
                        '<div class="onoffswitch">' +
                            '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked>' +
                            '<label class="onoffswitch-label" for="myonoffswitch">' +
                                '<span class="onoffswitch-inner"></span>' +
                                '<span class="onoffswitch-switch"></span>' +
                            '</label>' +
                        '</div>';
                }

                _this.checkBnReport();

                dom.id("total_blocked").innerHTML = data.total;
                dom.id("page_blocked").innerHTML = data.page;
                dom.id('block_party_cookies').checked = !data.party_cookies;

                _this.addBind();

                if (_this.has_bad_ext) {
                    dom.id("view_extensions").getElementsByTagName("img")[0].setAttribute("src", "../images/extension_bad.png")
                }
            });
        }
    };

    window.addEventListener("load", function () {
        POPUP.run();
    }, false);
} ());