(function(){
    var _   = LIBRARY,
        dom = DOM,
        REPORT;

    REPORT = {
        getData: function (callback) {
            var _this = this;

            _.msgBackground({action: 'getReportData'}, function (data) {
                if (typeof callback === "function") {
                    callback(data);
                }
            });
        },

        getExtHtml: function (ext) {
            var html = '',
                i;

            html += '<table class="table">' +
                '<thead>' +
                    '<tr class="bg-primary">' +
                        '<th>ID</th>' +
                        '<th>' + chrome.i18n.getMessage('extension') + '</th>' +
                    '</tr>' +
                '</thead><tbody>';

            for (i = 0; i < ext.length; ++i) {
                html += '' +
                    '<tr style="background-color: #ffffff;">' +
                        '<td class="alignleft">' + ext[i].id + '</td>' +
                        '<td class="alignleft">' + ext[i].name + '</td>' +
                    '</tr>';
            }

            html += '</tbody>' +
                    '<tfoot>' +
                        '<tr class="bg-primary">' +
                            '<th colspan="2">' + ext.length + '</th>' +
                        '</tr>' +
                    '</tfoot>' +
                '</table>';

            return html;
        },

        addBind: function () {
            dom.id('bn_send_report').addEventListener('click', function () {
                var data = {};

                data.action      = 'sendReport';
                data.ext_flag    = dom.id('report_ext_flag').checked;
                data.screen_flag = dom.id('report_screen_flag').checked;

                _.msgBackground(data, function () {});
                alert(chrome.i18n.getMessage('report_sended'));
                window.close();
            }, false);

            dom.id('bn_close').addEventListener('click', function () {
                window.close();
            }, false);
        },

        setI18n: function () {
            dom.id('report_header').innerHTML        = chrome.i18n.getMessage('report');
            dom.id('report_attach_screen').innerHTML = chrome.i18n.getMessage('report_attach_screen');
            dom.id('report_attach_ext').innerHTML    = chrome.i18n.getMessage('report_attach_ext');
            dom.id('bn_send_report').innerHTML       = chrome.i18n.getMessage('send');
            dom.id('bn_close').innerHTML             = chrome.i18n.getMessage('cancel');
        },

        run: function () {
            var _this = this;

            this.setI18n();
            this.getData(function (data) {
                var el_img = dom.create('img');
                el_img.setAttribute('src', data.screen);
                el_img.style.maxWidth = '600px';
                el_img.style.width = '100%';

                dom.id('report_url').innerHTML = (data.url.length > 60 ? data.url.substr(0, 60) + '...' : data.url);
                dom.id('report_screen').appendChild(el_img);
                dom.id('report_ext').innerHTML = _this.getExtHtml(data.ext);
            });

            this.addBind();
        }
    };

    window.addEventListener("load", function () {
        REPORT.run();
    }, false);

}());