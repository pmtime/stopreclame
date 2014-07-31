var RECLAME = RECLAME || {};

(function () {
    var getRe = function (ids) {
            var res = [],
                re_str,
                i;

            for (i = 0; i < ids.length; ++i) {
                re_str = '<div[^>]*id\\s*=\\s*[\'"]*(' + ids[i] + '[^\'"]*)[\'"]*';
                res.push(new RegExp(re_str, 'gi'));
            }

            return res;
        };

    RECLAME.teasers = {
            'marketgid': {
                re: getRe(['MarketGidComposite', 'MarketGidScriptRootC', 'MarketGid'])
            },
            'directadvert': {
                re: getRe(['DIV_DA_'])
            },
            'teasernet': {
                re: getRe(['lx_'])
            },
            'pay_click': {
                re: getRe(['PC_Teaser_Block_'])
            },
            'LC_teaser': {
                re: getRe(['LC_Teaser_Block_'])
            },
            'teaser-goods': {
                re: getRe(['TGB_'])
            },
            'redtram': {
                re: getRe(['rt-n-'])
            },
            'trafmag': {
                re: getRe(['trafmag_'])
            },
            'test-grt02': {
                re: getRe(['n4p_'])
            },
            'test-adriver_banner': {
                re: getRe(['adriver_banner_'])
            },
            'test-smi2': {
                re: getRe(['smi2adblock_'])
            },
            'test-nnn.ru': {
                re: getRe(['DIV_NNN_'])
            },
            'test-adv.kp.ru': {
                re: getRe(['DIV_KP_'])
            },
            'test-novostimira': {
                re: getRe(['CNM'])
            },
            '24smile': {
                re: getRe(['smile_teaser_'])
            },
            'advmaker': {
                re: getRe(['ambn'])
            },
            'rarenok': {
                re: getRe(['b_tz_'])
            },
            'mixmarket': {
                re: getRe(['mixkt_'])
            },
            'am15': {
                re: getRe(['amcu'])
            },
            'google': {
                re: [/<ins[^>]*id\s*=\s*['"]*(aswift_\d+_anchor)['"]*[^>]*>/gi]
            },
            other: {
                re: getRe(['amsb_frame', 'banners_', 'RTBDIV_', 'bn_', 'aotzblk_', 'skin_block', 'ca-block-', 'ad_ph_'])
            }
        };
    RECLAME.frames = {
        'rmbn': {
            re: [
                /<iframe[^>]*id\s*=\s*['"]*([^'"]*)['"]*[^>]*src\s*=\s*['"]*[^'"]*post\.rmbn\.net[^'"]*/gi
            ]
        },
        'other': {
            re: [
                /<iframe[^>]*id\s*=\s*['"]*(RTBIFR_[^'"]*)['"]*[^>]*/gi
            ]
        }
    };
    RECLAME.remov = {
        other: {
            re: [
                /<div[^>]*id\s*=\s*['"]*(amsb)['"]*[^>]*>/gi,
                /<object[^>]*id\s*=\s*['"]*(AlternativeContent)['"]*[^>]*>/gi,
                /<object[^>]*id\s*=\s*['"]*(ad_ph_[^'"]*)['"]*[^>]*>/gi,
                /<object[^>]*id\s*=\s*['"]*(b_sl_[^'"]*)['"]*[^>]*>/gi
            ]
        }
    }
}());

(function () {
    if (!RECLAME.sites) {
        RECLAME.sites = {};
    }

    var adds = 'vOagqs_',
        site_el_id = adds + parseInt(Math.random() * 1000, 10);

    RECLAME.sites['vk.com'] = {
        'is': function () {
            return window.location.hostname.indexOf('vk.com') !== -1
                || window.location.hostname.indexOf('vkontakte.ru') !== -1
        },
        'fixReclame': function() {
            var el = document.getElementById("left_ads"),
                style,
                getId = function () {
                    var el = document.getElementById('l_ph'),
                        a,
                        href,
                        re = /albums(\d+)/,
                        res;

                    if (!el) {
                        return "0";
                    }

                    a = el.getElementsByTagName("a");

                    if (!a || !a[0]) {
                        return "0";
                    }

                    href = a[0].getAttribute("href");
                    res = re.exec(href);

                    if (!res || !res[1]) {
                        return "0";
                    }

                    return res[1];
                };

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
}());