var LIBRARY = {
    load: function (key) {
        var data = window.localStorage[key];

        if (typeof data === "undefined") {
            return null;
        }

        return JSON.parse(data);
    },

    save: function (key, data) {
        window.localStorage[key] = JSON.stringify(data);

        return true;
    },

    msgBackground: function(data, responseCallback) {
        chrome.runtime.sendMessage(data, responseCallback);
    },

    onMessage: function(callback) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            callback(request, sender, sendResponse);
        });
    },

    msgContent: function (tab_id, data) {
            chrome.tabs.sendMessage(tab_id, mes);
    },

    addSymbol: function (str, symbol, len, side) {
        var cur_len,
            i;

        if (!str)
            str = '';

        str = str.toString();

        if (!side)
            side = 'left';

        if (symbol === undefined)
            symbol = '0';

        symbol.toString();

        cur_len = str.length;

        if (side === 'left') {
            for (i = 0; i < (len - cur_len); ++i) {
                str = symbol + str;
            }
        }
        else {
            for (i = 0; i < (len - cur_len); ++i) {
                str += symbol;
            }
        }

        return str;
    },
    
    getCurDate: function (separator) {
        var date = new Date(),
            d = date.getDate(),
            m = date.getMonth() + 1,
            y = date.getFullYear();

        if (!separator) {
            separator = '';
        }    

        d = this.addSymbol(d, '0', 2, 'left');
        m = this.addSymbol(m, '0', 2, 'left');

        return y + separator + m + separator + d;
    },

    createGuid: function () {
        var template = 'xxxxxxxx-xxxx-4xxx-yxxx-' + Date.now().toString().substr(-12);

        return template.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, 
                v = (c === 'x' ? r : (r&0x3|0x8));

            return v.toString(16);
        });
    },

    extend: function (child, parent, deep) {
        var i,
            toStr = Object.prototype.toString,
            astr = "[object Array]";

        child = child || {};

        if (typeof deep === "undefined") {
            deep = true;
        }

        for (i in parent) {
            if (!parent.hasOwnProperty(i)) {
                continue;
            }

            if (deep) {
                if (typeof parent[i] === "object") {
                    child[i] = (toStr.call(parent[i]) === astr) ? [] : {};

                    this.extend(child[i], parent[i]);
                } else {
                    child[i] = parent[i];
                }
            } else {
                child[i] = parent[i];
            }
        }

        return child;
    },

    parseURL: function (url) {
        var data = {
                href: url,
                protocol: null,
                hostname: null,
                port: null,
                host: null,
                path: null,
                search: null,
                params: {},
                hash: null
            },
            re_protocol = /^([^:\/.]+:)/gi,
            re_hash = /(#.+)$/gi,
            re_host = /(^[^\/]+)/gi,
            res,
            i;

        if (url === null || url === undefined) {
            return data;
        }

        res = re_protocol.exec(url);

        if (!!res && !!res[1]) {
            data.protocol = res[1];
        }

        url = url.replace(data.protocol, '');

        url = url.replace(/^\/\//, '');

        res = re_hash.exec(url);

        if (!!res && !!res[1]) {
            data.hash = res[1];
        }

        url = url.replace(data.hash, '');

        res = re_host.exec(url);

        if (!!res && !!res[1]) {
            data.host = res[1];
        }

        url = url.replace(data.host, '');

        if (typeof data.host === "string") {
            res = data.host.split(':');
            data.hostname = res[0];

            if (!!res[1]) {
                data.port = res[1];
            }
        }

        res = url.split('?');

        data.path = res.shift();

        if (res.length > 1) {
            data.search = res.join('?');
        } else {
            if (res.length === 1) {
                data.search = res[0];
            }
        }

        if (typeof data.search === "string") {
            res = data.search.split('&');

            for (i = 0; i < res.length; ++i) {
                try {
                    data.params[res[i].split('=')[0]] = res[i].split('=')[1];
                } catch (e) {}
            }

            data.search = '?' + data.search;
        }

        return data;
    },

    ajax: function (options) {
        var opt = {
            url      : "",
            data     : null,
            async    : true,
            success  : false,
            error    : false,
            funcdata : false,
            type     : "GET"
        };

        opt = this.extend(opt, options);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            var response;

            if (xhr.readyState == 4) {
                if (xhr.status !== 200) {
                    if (typeof opt.error === "funciton") {
                        opt.error(xhr.status);
                    }    

                    return;
                }

                response = xhr.responseText;

                if (!!response) {
                    if (typeof opt.success == "function") {
                        if (!!opt.funcdata) {
                            opt.success(response,opt.funcdata);
                        } else {
                            opt.success(response);
                        }
                    }
                }
            }
        };

        xhr.open(opt.type, opt.url, opt.async);

        if (opt.type.toLowerCase() === "post") {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        xhr.send(opt.data);
    }
};