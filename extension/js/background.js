(function () {
    var _         = LIBRARY,
        config    = CONFIG,
        blocklist = BLOCKLIST,
        BACKGROUND;

    BACKGROUND = {
        blocklist : BLOCKLIST,
        ext_id    : null,
        hash      : "background_",

        tabs      : {},

        reports   : [],

        load: function (key) {
            return _.load(this.hash + key);
        },

        save: function (key, data) {
            return _.save(this.hash + key, data);
        },

        offExt: function () {
            config.ext_status = "0";
            config.saveConfig();
        },

        onExt: function () {
            config.ext_status = "1";
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
                return false;
            }

            if (details.tabId < 1) {
                return false;
            }

            if (details.type === "sub_frame"
                || details.type === "image") {
                return false;
            }

            if (details.type === "main_frame") {
                delete this.tabs[details.tabId];

                return false;
            }

            res = blocklist.inList(details.url);

            if (res) {
                this.updateInfo(details.tabId);
            }

            return res;
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
                ad = ad.toString();

                chrome.browserAction.setBadgeText({tabId: tabId, text: ad});
            }
        },

        runSniffer: function () {
            var _this = this,
                filter = {urls: ["<all_urls>"]},
                opt_extraInfoSpec = ["blocking"];

            chrome.webRequest.onBeforeRequest.addListener(function (details) {
                    var cancel = _this.onBeforeRequest(details);

                    return {cancel: cancel};
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

            data.total      = total;
            data.page       = this.tabs[tabId] || 0;
            data.ext_status = config.ext_status;
            data.was_report = this.wasReport(url);

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

        reportAdPage: function (url) {
            var _this = this,
                url_data = _.parseURL(url);

            this.reports.push(url_data.hostname);

            this.loadExtInfo(function (data) {
                var send_data,
                    send_data_arr = [],
                    item;

                send_data = {
                    id  : encodeURIComponent(config.ext_id),
                    url : encodeURIComponent(url),
                    v   : encodeURIComponent(_this.getExtVersion()),
                    s   : config.ext_status,
                    ext : encodeURIComponent(JSON.stringify(data))
                };

                for (item in send_data) {
                    if (!send_data.hasOwnProperty(item)) {
                        continue;
                    }

                    send_data_arr.push(item + '=' + send_data[item]);
                }

                _.ajax({
                    url     : config.url_report,
                    type    : "POST",
                    success : function (response) {
                    },
                    data    : send_data_arr.join('&')
                });
            });
        },

        onMessage: function () {
            var _this = this;

            LIBRARY.onMessage(function(mes, sender, sendResponse) {
                switch(mes.action) {
                    case "incStat":
                        _this.updateInfo(sender.tab.id);
                        break;

                    case "getPopupData":
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
                }
            })
        },

        updateLastdate: function () {
            var cur_date = _.getCurDate();

            this.save("lastupdate", cur_date); 
        },

        runUpdater: function () {
            var _this      = this,
                lastupdate = this.load("lastupdate"),
                cur_date   = _.getCurDate();

            window.setTimeout(function () {
                _this.runUpdater();
            }, 6 * 60 * 60 * 1000);

            if (lastupdate === cur_date) {
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
                data    : "id=" + encodeURIComponent(config.ext_id) + "&v=" + encodeURIComponent(_this.getExtVersion()) + "&s=" + config.ext_status
            });
        },

        run: function () {
            var _this = this;

            this.initBlocklist();

            this.runSniffer();

            this.runCleaner();

            this.onMessage();

            this.loadExtInfo();
            
            window.setTimeout(function () {
                _this.runUpdater();
            }, 3 * 1000);
        }
    };

    BACKGROUND.run();
}());