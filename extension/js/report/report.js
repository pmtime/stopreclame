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

            html += '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>ID</th>' +
                        '<th>Name</th>' +
                        '<th>Status</th>' +
                    '</tr>' +
                '</thead><tbody>';

            for (i = 0; i < ext.length; ++i) {
                html += '' +
                    '<tr>' +
                        '<td>' + ext[i].id + '</td>' +
                        '<td>' + ext[i].name + '</td>' +
                        '<td>' + ext[i].enabled + '</td>' +
                    '</tr>';
            }

            html += '</tbody>' +
                    '<tfoot>' +
                        '<tr><th colspan="3">' + ext.length + '</th></tr>' +
                    '</tfoot>' +
                '</table>';

            return html;
        },

        addBind: function () {
            dom.id('bn_send_report').addEventListener('click', function () {
                var data = {};

                data.action = 'sendReport';
                data.ext_flag = dom.id('report_ext_flag').checked;
                data.screen_flag = dom.id('report_screen_flag').checked;

                _.msgBackground(data, function () {});
                alert('Отчет отправлен');
                window.close();
            }, false);

            dom.id('bn_close').addEventListener('click', function () {
                window.close();
            }, false);
        },

        run: function () {
            var _this = this;

            this.getData(function (data) {
                var el_img = dom.create('img');
                el_img.setAttribute('src', data.screen);
                el_img.style.width = '600px';

                dom.id('report_url').innerHTML = data.url;
                dom.id('report_screen').appendChild(el_img);
                dom.id('report_ext').innerHTML = _this.getExtHtml(data.ext);

                console.log(data);
            });

            this.addBind();
        }
    };

    window.addEventListener("load", function () {
        REPORT.run();
    }, false);

}());