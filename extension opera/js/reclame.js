var RECLAME = {};

(function () {
    if (!RECLAME.sites) {
        RECLAME.sites = {};
    }

    var adds = 'avnevbssetd_',
        site_el_id = adds + parseInt(Math.random() * 1000, 10);

    RECLAME.sites['vk.com'] = {
        is: function () {
            return window.location.hostname.indexOf('vk.com') !== -1
                || window.location.hostname.indexOf('vkontakte.ru') !== -1
        },
        fixReclame: function() {
            var el = document.getElementById("left_ads"),
                style;

            if (!el) {
                return false;
            }

            if (!document.getElementById(site_el_id)) {
                style = document.createElement('style');
                style.innerHTML = '#left_ads > *:not(iframe) {' +
                'opacity: 0 !important; ' +
                'position: fixed !important; ' +
                'width: 6px !important;' +
                'height: 6px !important;' +
                'top: -1000px !important; ' +
                'left: -1000px !important; ' +
                '} ';

                style.setAttribute('id', site_el_id);

                if (!!document.head) {
                    document.head.appendChild(style);
                }
            }

            return {
                el: el
            };
        }
    };

    RECLAME.sites['mail.ru'] = {
        is: function () {
            return window.location.hostname.indexOf('mail.ru') !== -1;
        },
        fixReclame: function() {
            var style;

            if (!document.getElementById(site_el_id)) {
                style = document.createElement('style');
                style.innerHTML = '.w-text-banner_outer, .rb_banner, .image_banner, .banner_left {' +
                'opacity: 0 !important; ' +
                'position: fixed !important; ' +
                'width: 6px !important;' +
                'height: 6px !important;' +
                'top: -1000px !important; ' +
                'left: -1000px !important; ' +
                '} ';

                style.setAttribute('id', site_el_id);

                if (!!document.head) {
                    document.head.appendChild(style);
                }
            }
        }
    };
}());