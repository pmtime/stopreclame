var EXTS = {
    list: [],

    view: function () {
        var i,
            html = '',
            getTr = function (data) {
                var html = '';

                html += '<tr data-id="' + data.id + '">' +
                        '<td>' + data.name + '</td>' +
                        '<td>' + data.version + '</td>' +
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
                    '<th>' + chrome.i18n.getMessage("extension") + '</th>' +
                    '<th>' + chrome.i18n.getMessage("version") + '</th>' +
                    '<th>' + chrome.i18n.getMessage("description") + '</th>' +
                    '<th title="' + chrome.i18n.getMessage("on_full") + '">' + chrome.i18n.getMessage("on") + '</th>' +
                    '<th></th>' +
                '</tr>' +
            '</thead><tbody>';


        for (i = 0; i < this.list.length; ++i) {
            if (this.list[i].type !== "extension") {
                continue;
            }

            if (chrome.runtime.getManifest().name === this.list[i].name) {
                continue;
            }

            html += getTr(this.list[i]);
        }

        html += '</tbody></table>';

        document.body.innerHTML = html;

        this.addEvent();
    },

    addEvent: function () {
        var _this = this,
            inputs = document.body.getElementsByTagName("input"),
            i;

        for (i = 0; i < inputs.length; ++i) {
            inputs[i].addEventListener("change", function(e) {
                var el = this,
                    ext_id;

                ext_id = el.getAttribute("data-id");

                chrome.management.setEnabled(ext_id, !!el.checked, function () {});
            }, false);
        }

        var buttons = document.body.getElementsByTagName("button");

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
        this.reDraw();
    }
};

window.addEventListener("load", function () {
    EXTS.run();
}, false);