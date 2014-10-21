(function () {
    var CONTENT = {
        check_period: 400,

        fixSite: function (site) {
            var obj = site.fixReclame();

            if (!!obj) {
                LIBRARY.msgBackground({action: "incStat"});
                DOM.remove(obj.el);
            }
        },

        clearSites: function () {
            var _this = this,
                item,
                sites = RECLAME.sites || null;

            if (sites === null) {
                return;
            }

            for (item in sites) {
                if (!sites.hasOwnProperty(item)) {
                    continue;
                }

                if (sites[item].is()) {
                    (function (site) {
                        _this.fixSite(site);

                        window.setInterval(function () {
                            _this.fixSite(site);
                        }, _this.check_period);
                    }(sites[item]));

                    break;
                }
            }
        },

        run: function () {
            this.clearSites();
        }
    };

    CONTENT.run();
}());