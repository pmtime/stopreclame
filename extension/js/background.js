(function () {
    var _         = LIBRARY,
        config    = CONFIG,
        blocklist = BLOCKLIST,
        BACKGROUND;

    BACKGROUND = {
        blocklist     : BLOCKLIST,
        ext_id        : null,
        hash          : "background_",
        has_bad_ext   : false,
        party_cookies : false,
        report_data   : {},

        tabs        : {},

        reports     : [],
        img_opacity : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAAtJREFUCB1jYAACAAAFAAGNu5vzAAAAAElFTkSuQmCC",

        load: function (key) {
            return _.load(this.hash + key);
        },

        save: function (key, data) {
            return _.save(this.hash + key, data);
        },

        offExt: function () {
            config.ext_status = "0";

            chrome.browserAction.setIcon({path: {19:"/images/off_ext-19.png", 38:"/images/off_ext-38.png"}});


            config.saveConfig();
        },

        onExt: function () {
            config.ext_status = "1";

            chrome.browserAction.setIcon({path: {19:"/images/icon-19.png", 38:"/images/icon-38.png"}});

            config.saveConfig();
        },

        initBlocklist: function () {
            blocklist.run();
        },

        getExtVersion: function () {
            var version;

            try {
                version = chrome.runtime.getManifest().version;
            } catch (e) {
                version = "0.0.0.0";
            }

            return version;
        },

        onBeforeRequest: function (details) {
            var res;

            if (config.ext_status === "0") {
                return {cancel: false};
            }

            if (details.tabId < 1) {
                return {cancel: false};
            }

            if (details.type === "main_frame") {
                delete this.tabs[details.tabId];
            }

            res = blocklist.inList(details.url);

            if (res) {
                if (details.type === "image") {
                    return {redirectUrl: this.img_opacity};
                }

                if (details.type === "sub_frame") {
                    this.updateInfo(details.tabId);
                    return {redirectUrl: this.img_opacity};
                }

                this.updateInfo(details.tabId);

                return {cancel: true};
            }

            return {cancel: false};
        },

        setBadgeText: function (tabId, text) {
            chrome.tabs.query({}, function (tabs) {
                var i;

                for (i = 0; i < tabs.length; ++i) {
                    if (tabs[i].id === tabId) {
                        chrome.browserAction.setBadgeText({tabId: tabId, text: text});

                        break;
                    }
                }
            });
        },

        updateInfo: function (tabId) {
            var ad,
                all;

            if (config.ext_status === "0") {
                return;
            }

            if (typeof this.tabs[tabId] === "undefined") {
                this.tabs[tabId] = 0;
            }

            all = window.localStorage['all'];
            if (typeof all === "undefined") {
                all = 0;
            } else {
                all = parseInt(all, 10);
            }

            window.localStorage['all'] = ++all;

            ++this.tabs[tabId];
            ad = this.tabs[tabId];

            if (!ad) {
                ad = 0;
            }

            if (ad > 0) {
                if (ad > 99) {
                    ad = "99+"
                } else {
                    ad = ad.toString();
                }

                this.setBadgeText(tabId, ad);
            }
        },

        runSniffer: function () {
            var _this = this,
                filter = {urls: ["<all_urls>"]},
                opt_extraInfoSpec = ["blocking"];

            chrome.webRequest.onBeforeRequest.addListener(function (details) {
                    return _this.onBeforeRequest(details);
                }, filter, opt_extraInfoSpec);
        },

        runCleaner: function () {
            var _this = this;

            chrome.tabs.onRemoved.addListener(function (removeId) {
                delete _this.tabs[removeId];
            });

            chrome.tabs.onReplaced.addListener(function (addId, removeId) {
                delete _this.tabs[removeId];
            });
        },

        wasReport: function (url) {
            var url_data = _.parseURL(url);

            return (this.reports.indexOf(url_data.hostname) !== -1);
        },

        getDataForPopup: function (tabId, url) {
            var data = {},
                total;

            total = window.localStorage['all'];

            if (!total) {
                total = 0;
            }

            data.total         = total;
            data.page          = this.tabs[tabId] || 0;
            data.ext_status    = config.ext_status;
            data.was_report    = this.wasReport(url);
            data.has_bad_ext   = this.has_bad_ext;
            data.party_cookies = this.party_cookies;

            return data;
        },

        loadExtInfo: function (callback) {
            chrome.management.getAll(function (ExtensionInfo) {
                var i,
                    ext_list = [];

                for (i = 0; i < ExtensionInfo.length; ++i) {
                    ext_list.push({
                        id      : ExtensionInfo[i].id,
                        type    : ExtensionInfo[i].type,
                        name    : ExtensionInfo[i].name,
                        enabled : (ExtensionInfo[i].enabled ? '1' : '0')
                    });
                }

                if (typeof callback === "function") {
                    callback(ext_list);
                }
            });
        },

        showReport: function () {
            chrome.tabs.create({
                url: chrome.runtime.getURL("html/report.html")
            });
        },

        reportAdPage: function (url) {
            var _this = this;

            this.loadExtInfo(function (data) {
                _this.report_data.id      = config.ext_id;
                _this.report_data.url     = url;
                _this.report_data.version = _this.getExtVersion();
                _this.report_data.status  = config.ext_status;
                _this.report_data.ext     = data;

                _this.takeScreenshot(function () {
                    _this.showReport();
                });
            });
        },

        takeScreenshot: function (callback) {
            var _this = this;

            chrome.tabs.captureVisibleTab(
                null,
                {
                    format: 'jpeg',
                    quality: 50
                },
                function(screen) {
                    _this.report_data.screen = screen;

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            );
        },

        onMessage: function () {
            var _this = this;

            LIBRARY.onMessage(function(mes, sender, sendResponse) {
                switch(mes.action) {
                    case "incStat":
                        _this.updateInfo(sender.tab.id);
                        break;

                    case "getPopupData":
                        _this.checkExtension();
                        sendResponse(_this.getDataForPopup(mes.tabId, mes.url));
                        break;

                    case "changeExtStatus":
                        if (mes.enable) {
                            _this.onExt();
                        } else {
                            _this.offExt();
                        }

                        break;

                    case "adReport": 
                        _this.reportAdPage(mes.url);

                        break;

                    case "getExtList":
                        sendResponse(blocklist.getExtList());

                        break;

                    case "updExtInfo":
                        _this.checkExtension();

                        break;

                    case 'changePartyCookies':
                        _this.changePartyCookies();

                        break;

                    case 'getReportData':
                        sendResponse(_this.report_data);

                        break;

                    case 'sendReport':
                        _this.sendReport(mes.ext_flag, mes.screen_flag);

                        break;
                }
            });
        },

        sendReport: function (ext_flag, screen_flag) {
            var send_data,
                item,
                send_data_arr = [],
                url_data;

            url_data = _.parseURL(this.report_data.url);
            this.reports.push(url_data.hostname);

            send_data = {
                id  : encodeURIComponent(this.report_data.id),
                url : encodeURIComponent(this.report_data.url),
                v   : encodeURIComponent(this.report_data.version),
                s   : this.report_data.status,
                b   : config.browser
            };

            if (ext_flag) {
                send_data.ext = encodeURIComponent(JSON.stringify(this.report_data.ext));
            }

            if (screen_flag) {
                send_data.screen = encodeURIComponent(this.report_data.screen);
            }

            for (item in send_data) {
                if (!send_data.hasOwnProperty(item)) {
                    continue;
                }

                send_data_arr.push(item + '=' + send_data[item]);
            }

            _.ajax({
                url     : config.url_report,
                type    : 'POST',
                success : function (response) {
                },
                data    : send_data_arr.join('&')
            });
        },

        updateLastdate: function () {
            var cur_period = parseInt(Date.now() / 1000 / 60 / 60 / 12, 10).toString();

            this.save('lastupdate', cur_period);
        },

        runUpdater: function () {
            var _this      = this,
                lastupdate = this.load('lastupdate'),
                cur_period = parseInt(Date.now() / 1000 / 60 / 60 / 12, 10).toString();

            window.setTimeout(function () {
                _this.runUpdater();
            }, 3 * 60 * 60 * 1000);

            if (lastupdate === cur_period) {
                return;
            }

            _.ajax({
                url     : config.url_upd_blocklist,
                type    : "POST",
                success : function (response) {
                    try {
                        response = JSON.parse(response);

                        blocklist.updateConfig(response.data);
                        
                        _this.updateLastdate();
                    } catch (e) {}
                },
                data    : "id=" + encodeURIComponent(config.ext_id) + "&v=" + encodeURIComponent(_this.getExtVersion()) + "&s=" + config.ext_status + "&b=" + config.browser
            });
        },

        checkExtension: function () {
            var _this = this;

            if (config.ext_status === "0") {
                return;
            }

            chrome.management.getAll(function (ExtensionInfo) {
                var i,
                    md5_code;

                _this.has_bad_ext = false;

                for (i = 0; i < ExtensionInfo.length; ++i) {
                    if (ExtensionInfo[i].type !== "extension") {
                        continue;
                    }

                    if (!ExtensionInfo[i].enabled) {
                        continue;
                    }

                    md5_code = md5(ExtensionInfo[i].id + '_' + ExtensionInfo[i].name);

                    if (blocklist.ext_list[md5_code] === "0" || blocklist.ext_list[md5_code] === "2") {
                        _this.has_bad_ext = true;
                        break;
                    }
                }

                if (_this.has_bad_ext) {
                    chrome.browserAction.setIcon({path: {19:"/images/bad_ext-19.png", 38:"/images/bad_ext-38.png"}});
                } else {
                    chrome.browserAction.setIcon({path: {19:"/images/icon-19.png", 38:"/images/icon-38.png"}});
                }
            });
        },

        changePartyCookies: function () {
            var _this = this;

            chrome.privacy.websites.thirdPartyCookiesAllowed.set({'value': !this.party_cookies, 'scope': 'regular'}, function () {
                _this.party_cookies = !_this.party_cookies;
            });
        },

        updInfoPartyCookies: function () {
            var _this = this;

            chrome.privacy.websites.thirdPartyCookiesAllowed.get({}, function (data) {
                _this.party_cookies = data.value;
            });
        },

        checkExtStatus: function () {
            if (config.ext_status === '0') {
                chrome.browserAction.setIcon({path: {19:"/images/off_ext-19.png", 38:"/images/off_ext-38.png"}});
            } else {
                chrome.browserAction.setIcon({path: {19:"/images/icon-19.png", 38:"/images/icon-38.png"}});
            }
        },

        run: function () {
            var _this = this;

            this.updInfoPartyCookies();

            this.initBlocklist();

            this.runSniffer();

            this.runCleaner();

            this.onMessage();

            this.loadExtInfo();

            this.checkExtStatus();

            this.checkExtension();

            window.setTimeout(function () {
                _this.runUpdater();
            }, 3 * 1000);
        }
    };

    BACKGROUND.run();
}());