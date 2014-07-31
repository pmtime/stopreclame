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

        load: function (key) {
            return _.load(this.hash + key);
        },

        save: function (key, data) {
            return _.save(this.hash + key, data);
        },

        executeScript: function (tabId, file) {
            try {
                chrome.tabs.executeScript(tabId, {
                    runAt: "document_start",
                    file: file
                });
            } catch(e) {}
        },

        initBlocklist: function () {
            blocklist.run();
        },

        onBeforeRequest: function (details) {
            var res;

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
                    return {cancel: _this.onBeforeRequest(details)};
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

        onMessage: function () {
            var _this = this;

            LIBRARY.onMessage(function(mes, sender, sendResponse) {
                if (mes.action === "incStat") {
                    _this.updateInfo(sender.tab.id);
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
                data    : "id=" + encodeURIComponent(config.ext_id)
            });
        },

        run: function () {
            var _this = this;

            this.initBlocklist();

            this.runSniffer();

            this.runCleaner();

            this.onMessage();
            
            window.setTimeout(function () {
                _this.runUpdater();
            }, 3 * 1000);
        }
    };

    BACKGROUND.run();
}());