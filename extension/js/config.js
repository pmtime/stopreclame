var CONFIG = (function () {
    var _ = LIBRARY,
        module,
        domain = "http://stopreclame.com/api",
        getBrowser;

    getBrowser = function () {
        var app;

        if (typeof navigator !== 'undefined' && !!navigator.appVersion) {
            app = navigator.appVersion.toLowerCase();

            if (app.indexOf('amigo') !== -1) {
                return 'amigo';
            }

            if (app.indexOf('yabrowser') !== -1) {
                return 'yabrowser';
            }

            if (app.indexOf('opr') !== -1) {
                return 'opera';
            }
        }

        return 'chrome';
    };

    module = {
        saving_params: [
            "url_blocklist",
            "ext_id",
            "ext_status"	// 1 - enable, 0 - disable
        ],

        ext_status        : "1",
        url_upd_blocklist : domain + "/blocklist.php",
        url_period_def    : 24 * 60 * 60 * 1000,
        url_report        : domain + "/report.php",
        ext_id            : "0",
        hash              : "config_",
        browser           : getBrowser(),

        load: function (key) {
            return _.load(this.hash + key);
        },

        save: function (key, data) {
            return _.save(this.hash + key, data);
        },

        loadConfig: function () {
            var _this = this,
                data,
                i;

            data = this.load('config');

            if (data === null) {
                return;
            }

            for (i = 0; i < _this.saving_params.length; ++i) {
                if (typeof data[_this.saving_params[i]] === "undefined") {
                    continue;
                }

                _this[_this.saving_params[i]] = data[_this.saving_params[i]];
            }
        },

        saveConfig: function () {
            var _this = this,
                data = {},
                i;

            for (i = 0; i < _this.saving_params.length; ++i) {
                data[_this.saving_params[i]] = this[_this.saving_params[i]];
            }

            this.save('config', data);
        },

        checkExtId: function () {
            if (this.ext_id !== "0") {
                return;
            }

            this.ext_id = _.createGuid();

            this.saveConfig()
        },

        init: function () {
            this.loadConfig();

            this.checkExtId();

            return this;
        }
    };

    module.init();

    return module;
}());