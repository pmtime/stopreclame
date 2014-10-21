var BLOCKLIST = (function () {
    var _ = LIBRARY,
        module;

    module = {
        hash     : "blocklist_",
        re_str   : [],
        re       : [],
        str      : [],
        ext_list : {},


        load: function (key) {
            return _.load(this.hash + key);
        },

        save: function (key, data) {
            return _.save(this.hash + key, data);
        },

        initRegExp: function () {
            var i;

            this.re = [];

            for (i = 0; i < this.re_str.length; ++i) {
                this.re.push(new RegExp(this.re_str[i], 'gi'));
            }
        },

        inList: function (url) {
            var i,
                re;

            if (typeof url !== "string") {
                return false;
            }

            for (i = 0; i < this.str.length; ++i) {
                if (url.indexOf(this.str[i]) !== -1) {
                    return true;
                }
            }

            for (i = 0; i < this.re.length; ++i) {
                re = this.re[i];

                re.lastIndex = 0;

                if (re.test(url)) {
                    return true;
                }
            }

            return false;
        },

        loadConfig: function () {
            var config   = this.load("config");

            if (config === null) {
                return false;
            }

            if (typeof config.re_str !== "undefined") {
                this.re_str = config.re_str;
            }

            if (typeof config.str !== "undefined") {
                this.str = config.str;
            }

            if (typeof config.ext_list !== "undefined") {
                this.ext_list = config.ext_list;
            }

            return true;
        },

        saveConfig: function () {
            var config = {
                re_str   : this.re_str,
                str      : this.str,
                ext_list : this.ext_list
            };

            this.save("config", config);
        },

        getExtList: function () {
            return this.ext_list;
        },

        updateConfig: function (data) {
            try {
                if (typeof data.re !== "undefined") {
                    this.re_str = data.re.slice();
                }

                if (typeof data.str !== "undefined") {
                    this.str = data.str.slice();
                }

                if (typeof data.ext_list !== "undefined") {
                    this.ext_list = _.extend({}, data.ext_list);
                }

                this.saveConfig();
                this.initRegExp();
            } catch (e) {
            }
        },

        run: function () {
            this.loadConfig();
            this.initRegExp();
        }
    };
    
    return module;
}());
