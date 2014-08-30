var DOM = {
    id: function (id) {
        return document.getElementById(id);
    },
    create: function (tag_name) {
        if (!tag_name || typeof tag_name !== "string") {
            tag_name = "div";
        }

        return document.createElement(tag_name);
    },
    remove: function (node) {
        if (!node) {
            return true;
        }

        try {
            node.parentNode.removeChild(node);
        } catch (e) {}

        return true;
    }
};

var CONTENT = {
    clear_interval : null,

    clearSites: function () {
        var fixSite,
            item,
            sites = RECLAME.sites || null;

        if (sites === null) {
            return;
        }

        fixSite = function (site) {
            var obj = site.fixReclame();

            if (!!obj) {
                LIBRARY.msgBackground({action: "incStat"});
                DOM.remove(obj.el);
            }
        };

        for (item in sites) {
            if (!sites.hasOwnProperty(item)) {
                continue;
            }

            if (sites[item].is()) {
                (function (site) {
                    fixSite(site);

                    window.setInterval(function() {
                        fixSite(site);
                    }, 400);
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