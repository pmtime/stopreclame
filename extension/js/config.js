var CONFIG = (function () {
	var _ = LIBRARY,
		module;

	module = {
	    saving_params: [
	        "url_blocklist",
	        "ext_id",
	    ],

	    url_upd_blocklist : "http://127.0.0.1:3000/system/blocklist.php",
	    url_period_def    : 24 * 60 * 60 * 1000,
	    ext_id            : "0",
	    hash              : "config_",

	    load: function (key) {
	    	return _.load(this.hash + key);
	    },

	    save: function (key, data) {
			return _.save(this.hash + key, data);
	    },

	    loadConfig: function () {
	        var _this = this,
	            data,
	            i;

	        data = this.load('config');

	        if (data === null) {
	            return;
	        }

	        for (i = 0; i < _this.saving_params.length; ++i) {
	            if (typeof data[_this.saving_params[i]] === "undefined") {
	                continue;
	            }

	            _this[_this.saving_params[i]] = data[_this.saving_params[i]];
	        }
	    },

	    saveConfig: function () {
	        var _this = this,
	            data = {},
	            i;

	        for (i = 0; i < _this.saving_params.length; ++i) {
	            data[_this.saving_params[i]] = this[_this.saving_params[i]];
	        }

	        this.save('config', data);
	    }, 

	    checkExtId: function () {
	    	if (this.ext_id !== "0") {
	    		return;
	    	}

	    	this.ext_id = _.createGuid();

	    	this.saveConfig()
	    },

	    init: function () {
	    	this.loadConfig();
	    	
    		this.checkExtId();

	    	return this;
	    }
	};

	module.init();

	return module;
}());