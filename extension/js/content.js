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

    removeBanner: function () {
        var remove = RECLAME.remove,
            item,
            re,
            res,
            i,
            _el,
            html = document.body.innerHTML;

        for (item in remove) {
            if (!remove.hasOwnProperty(item)) {
                continue;
            }

            re = remove[item].re;

            for (i = 0; i < re.length; ++i) {
                res = re[i].exec(html);

                if (!res || !res[1]) {
                    continue;
                }

                while (!!res && !!res[1]) {
                    _el = DOM.id(res[1]);
                    if (!!_el) {
                        LIBRARY.msgBackground({action: "incStat"});
                        DOM.remove(_el);
                    }

                    res = re[i].exec(html);
                }
            }
        }
    },

    clearSites: function () {
        var _this = this,
            fixSite,
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

    clearPage: function () {
        var html = '',
            _this = this,
            frames = RECLAME.frames,
            teasers = RECLAME.teasers,

            removeFrames = function () {
                var item,
                    i,
                    re,
                    res,
                    _el;

                for (item in frames) {
                    if (!frames.hasOwnProperty(item)) {
                        continue;
                    }

                    re = frames[item].re;

                    for (i = 0; i < re.length; ++i) {
                        res = re[i].exec(html);

                        if (!res || !res[1]) {
                            continue;
                        }

                        while (!!res && !!res[1]) {
                            _el = DOM.id(res[1]);
                            if (!!_el) {
                                LIBRARY.msgBackground({action: "incStat"});
                                DOM.remove(_el);
                            }

                            res = re[i].exec(html);
                        }
                    }
                }
            },

            removeTeasers = function () {
                var item,
                    i,
                    re,
                    res,
                    _el;

                for (item in teasers) {
                    if (!teasers.hasOwnProperty(item)) {
                        continue;
                    }

                    re = teasers[item].re;

                    for (i = 0; i < re.length; ++i) {
                        res = re[i].exec(html);

                        if (!res || !res[1]) {
                            continue;
                        }

                        while (!!res && !!res[1]) {
                            _el = DOM.id(res[1]);

                            if (!!_el) {
                                DOM.remove(_el);
                            }

                            res = re[i].exec(html);
                        }
                    }
                }
            };

        if (!document.body) {
            return;
        }

        html = document.body.innerHTML;

        removeFrames();

        removeTeasers();

        _this.removeBanner();
    },

    run: function () {
        var _this = this;

        this.clearSites();
        this.clearPage();

        this.clear_interval = window.setInterval(function () {
            _this.clearPage();
        }, 1000);

        window.setTimeout(function() {
            window.clearInterval(_this.clear_interval);
        }, 10 * 1000);
    }
};

CONTENT.run();