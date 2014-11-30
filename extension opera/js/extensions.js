var _ = LIBRARY;

var EXTS = {
    ext_name : chrome.runtime.getManifest().name,
    list     : [],
    ext_list : {},

    view: function () {
        var _this = this,
            i,
            html = '',
            getTr = function (data) {
                var html = '';

                html += '<tr data-id="' + data.id + '">' +
                        '<td>' + _this.getInfoExtension(data.id, data.name) + '</td>' +
                        '<td class="f-weight">' + data.name + '</td>' +
                        '<td class="ta-center">' + data.version + '</td>' +
                        '<td>' + data.description + '</td>' +
                        '<td style="text-align: center;"><input data-id="' + data.id + '" type="checkbox" ' + (data.enabled ? 'checked="checked"' : "") + '/></td>' +
                        '<td><button data-id="' + data.id + '">' +
                                chrome.i18n.getMessage("remove") +
                            '</button>' +
                        '</td>' +
                    '</tr>';

                return html;
            };

        html += '<table><thead>' +
                '<tr>' +
                    '<th style="width: 50px;"></th>' +
                    '<th>' + chrome.i18n.getMessage("extension") + '</th>' +
                    '<th style="width: 150px;">' + chrome.i18n.getMessage("version") + '</th>' +
                    '<th>' + chrome.i18n.getMessage("description") + '</th>' +
                    '<th style="width: 100px;" title="' + chrome.i18n.getMessage("on_full") + '">' + chrome.i18n.getMessage("on") + '</th>' +
                    '<th style="width: 110px;"></th>' +
                '</tr>' +
            '</thead><tbody>';

        for (i = 0; i < this.list.length; ++i) {
            if (this.list[i].type !== "extension") {
                continue;
            }

            if (this.ext_name === this.list[i].name) {
                continue;
            }

            html += getTr(this.list[i]);
        }

        html += '</tbody></table>';

        document.getElementById("dv_data").innerHTML = html;

        this.addEvent();
    },

    loadInfoExtension: function (callback) {
        var _this = this;

        _.msgBackground({action: 'getExtList'}, function (data) {
            _this.ext_list = data;

            callback();
        });
    },

    getStatusTitle: function (status) {
        var status_title = "";

        switch (status) {
            case '0':
                status_title = chrome.i18n.getMessage("title_ext_inject_ad");
                break;

            case '1':
                status_title = chrome.i18n.getMessage("title_ext_can_to_inject");
                break;

            case '2':
                status_title = chrome.i18n.getMessage("title_ext_does_not_inject");

                break;

            default:
                break;
        }

        return status_title;
    },

    getInfoExtension: function (id, name) {
        var status,
            md5_code = md5(id + '_' + name);

        status = this.ext_list[md5_code] || "2";

        return '<img src="../images/ext-' + status + '.png" title="' + this.getStatusTitle(status) + '" style="width: 32px; height: 32px;"/>';
    },

    addEvent: function () {
        var _this = this,
            inputs = document.getElementById("dv_data").getElementsByTagName("input"),
            i,
            buttons;

        for (i = 0; i < inputs.length; ++i) {
            inputs[i].addEventListener("change", function(e) {
                var el = this,
                    ext_id;

                ext_id = el.getAttribute("data-id");

                _.msgBackground({action: 'updExtInfo'});

                chrome.management.setEnabled(ext_id, !!el.checked, function () {});
            }, false);
        }

        buttons = document.getElementById("dv_data").getElementsByTagName("button");

        for (i = 0; i < buttons.length; ++i) {
            buttons[i].addEventListener("click", function(e) {
                var el = this,
                    ext_id;

                ext_id = el.getAttribute("data-id");

                if (!ext_id) {
                    return;
                }

                chrome.management.uninstall(ext_id, {showConfirmDialog: true}, function () {
                    _this.reDraw();
                });
            }, false);
        }
    },

    reDraw: function () {
        var _this = this;

        this.getData(function(data) {
            _this.list = data;
            _this.view();
        });
    },

    getData: function (callback) {
        chrome.management.getAll(function (ExtensionInfo) {
            callback(ExtensionInfo);
        });
    },

    run: function () {
        var _this = this;

        _this.loadInfoExtension(function () {
            _this.reDraw();
        });
    }
};

window.addEventListener("load", function () {
    EXTS.run();
}, false);