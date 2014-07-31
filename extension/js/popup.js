(function () {
    var POPUP = {
        getStatistic: function () {
        },

        run: function () {
            var all = window.localStorage['all'];

            if (typeof all === "undefined") {
                all = 0;
            }

            document.getElementById("dv_stat").innerHTML = all;
        }
    };

    window.addEventListener("load", function () {
        POPUP.run();
    }, false);
} ());