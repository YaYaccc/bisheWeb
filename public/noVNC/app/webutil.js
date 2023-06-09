
var WebUtil = {};

/*
 * ------------------------------------------------------
 * Namespaced in WebUtil
 * ------------------------------------------------------
 */

// init log level reading the logging HTTP param
WebUtil.init_logging = function (level) {
    "use strict";
    if (typeof level !== "undefined") {
        Util._log_level = level;
    } else {
        var param = document.location.href.match(/logging=([A-Za-z0-9\._\-]*)/);
        Util._log_level = (param || ['', Util._log_level])[1];
    }
    Util.init_logging();
};


WebUtil.dirObj = function (obj, depth, parent) {
    "use strict";
    if (! depth) { depth = 2; }
    if (! parent) { parent = ""; }

    // Print the properties of the passed-in object
    var msg = "";
    for (var i in obj) {
        if ((depth > 1) && (typeof obj[i] === "object")) {
            // Recurse attributes that are objects
            msg += WebUtil.dirObj(obj[i], depth - 1, parent + "." + i);
        } else {
            //val = new String(obj[i]).replace("\n", " ");
            var val = "";
            if (typeof(obj[i]) === "undefined") {
                val = "undefined";
            } else {
                val = obj[i].toString().replace("\n", " ");
            }
            if (val.length > 30) {
                val = val.substr(0, 30) + "...";
            }
            msg += parent + "." + i + ": " + val + "\n";
        }
    }
    return msg;
};

// Read a query string variable
WebUtil.getQueryVar = function (name, defVal) {
    "use strict";
    var re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
        match = document.location.href.match(re);
    if (typeof defVal === 'undefined') { defVal = null; }
    if (match) {
        return decodeURIComponent(match[1]);
    } else {
        return defVal;
    }
};

// Read a hash fragment variable
WebUtil.getHashVar = function (name, defVal) {
    "use strict";
    var re = new RegExp('.*[&#]' + name + '=([^&]*)'),
        match = document.location.hash.match(re);
    if (typeof defVal === 'undefined') { defVal = null; }
    if (match) {
        return decodeURIComponent(match[1]);
    } else {
        return defVal;
    }
};

// Read a variable from the fragment or the query string
// Fragment takes precedence
WebUtil.getConfigVar = function (name, defVal) {
    "use strict";
    var val = WebUtil.getHashVar(name);
    if (val === null) {
        val = WebUtil.getQueryVar(name, defVal);
    }
    return val;
};

/*
 * Cookie handling. Dervied from: http://www.quirksmode.org/js/cookies.html
 */

// No days means only for this browser session
WebUtil.createCookie = function (name, value, days) {
    "use strict";
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }

    var secure;
    if (document.location.protocol === "https:") {
        secure = "; secure";
    } else {
        secure = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/" + secure;
};

WebUtil.readCookie = function (name, defaultValue) {
    "use strict";
    var nameEQ = name + "=",
        ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i += 1) {
        var c = ca[i];
        while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
        if (c.indexOf(nameEQ) === 0) { return c.substring(nameEQ.length, c.length); }
    }
    return (typeof defaultValue !== 'undefined') ? defaultValue : null;
};

WebUtil.eraseCookie = function (name) {
    "use strict";
    WebUtil.createCookie(name, "", -1);
};

/*
 * Setting handling.
 */

WebUtil.initSettings = function (callback /*, ...callbackArgs */) {
    "use strict";
    var callbackArgs = Array.prototype.slice.call(arguments, 1);
    if (window.chrome && window.chrome.storage) {
        window.chrome.storage.sync.get(function (cfg) {
            WebUtil.settings = cfg;
            console.log(WebUtil.settings);
            if (callback) {
                callback.apply(this, callbackArgs);
            }
        });
    } else {
        // No-op
        if (callback) {
            callback.apply(this, callbackArgs);
        }
    }
};

// No days means only for this browser session
WebUtil.writeSetting = function (name, value) {
    "use strict";
    if (window.chrome && window.chrome.storage) {
        //console.log("writeSetting:", name, value);
        if (WebUtil.settings[name] !== value) {
            WebUtil.settings[name] = value;
            window.chrome.storage.sync.set(WebUtil.settings);
        }
    } else {
        localStorage.setItem(name, value);
    }
};

WebUtil.readSetting = function (name, defaultValue) {
    "use strict";
    var value;
    if (window.chrome && window.chrome.storage) {
        value = WebUtil.settings[name];
    } else {
        value = localStorage.getItem(name);
    }
    if (typeof value === "undefined") {
        value = null;
    }
    if (value === null && typeof defaultValue !== undefined) {
        return defaultValue;
    } else {
        return value;
    }
};

WebUtil.eraseSetting = function (name) {
    "use strict";
    if (window.chrome && window.chrome.storage) {
        window.chrome.storage.sync.remove(name);
        delete WebUtil.settings[name];
    } else {
        localStorage.removeItem(name);
    }
};

WebUtil.injectParamIfMissing = function (path, param, value) {
    // force pretend that we're dealing with a relative path
    // (assume that we wanted an extra if we pass one in)
    path = "/" + path;

    var elem = document.createElement('a');
    elem.href = path;

    var param_eq = encodeURIComponent(param) + "=";
    var query;
    if (elem.search) {
        query = elem.search.slice(1).split('&');
    } else {
        query = [];
    }

    if (!query.some(function (v) { return v.startsWith(param_eq); })) {
        query.push(param_eq + encodeURIComponent(value));
        elem.search = "?" + query.join("&");
    }

    // some browsers (e.g. IE11) may occasionally omit the leading slash
    // in the elem.pathname string. Handle that case gracefully.
    if (elem.pathname.charAt(0) == "/") {
        return elem.pathname.slice(1) + elem.search + elem.hash;
    } else {
        return elem.pathname + elem.search + elem.hash;
    }
};

// Emulate Element.setCapture() when not supported

WebUtil._captureRecursion = false;
WebUtil._captureProxy = function (e) {
    // Recursion protection as we'll see our own event
    if (WebUtil._captureRecursion) return;

    // Clone the event as we cannot dispatch an already dispatched event
    var newEv = new e.constructor(e.type, e);

    WebUtil._captureRecursion = true;
    WebUtil._captureElem.dispatchEvent(newEv);
    WebUtil._captureRecursion = false;

    // Implicitly release the capture on button release
    if ((e.type === "mouseup") || (e.type === "touchend")) {
        WebUtil.releaseCapture();
    }
};

WebUtil.setCapture = function (elem) {
    if (elem.setCapture) {

        elem.setCapture();

        // IE releases capture on 'click' events which might not trigger
        elem.addEventListener('mouseup', WebUtil.releaseCapture);
        elem.addEventListener('touchend', WebUtil.releaseCapture);

    } else {
        // Safari on iOS 9 has a broken constructor for TouchEvent.
        // We are fine in this case however, since Safari seems to
        // have some sort of implicit setCapture magic anyway.
        if (window.TouchEvent !== undefined) {
            try {
                new TouchEvent("touchstart");
            } catch (TypeError) {
                return;
            }
        }

        var captureElem = document.getElementById("noVNC_mouse_capture_elem");

        if (captureElem === null) {
            captureElem = document.createElement("div");
            captureElem.id = "noVNC_mouse_capture_elem";
            captureElem.style.position = "fixed";
            captureElem.style.top = "0px";
            captureElem.style.left = "0px";
            captureElem.style.width = "100%";
            captureElem.style.height = "100%";
            captureElem.style.zIndex = 10000;
            captureElem.style.display = "none";
            document.body.appendChild(captureElem);

            captureElem.addEventListener('mousemove', WebUtil._captureProxy);
            captureElem.addEventListener('mouseup', WebUtil._captureProxy);

            captureElem.addEventListener('touchmove', WebUtil._captureProxy);
            captureElem.addEventListener('touchend', WebUtil._captureProxy);
        }

        WebUtil._captureElem = elem;
        captureElem.style.display = null;

        // We listen to events on window in order to keep tracking if it
        // happens to leave the viewport
        window.addEventListener('mousemove', WebUtil._captureProxy);
        window.addEventListener('mouseup', WebUtil._captureProxy);

        window.addEventListener('touchmove', WebUtil._captureProxy);
        window.addEventListener('touchend', WebUtil._captureProxy);
    }
};

WebUtil.releaseCapture = function () {
    if (document.releaseCapture) {

        document.releaseCapture();

    } else {
        var captureElem = document.getElementById("noVNC_mouse_capture_elem");
        WebUtil._captureElem = null;
        captureElem.style.display = "none";

        window.removeEventListener('mousemove', WebUtil._captureProxy);
        window.removeEventListener('mouseup', WebUtil._captureProxy);

        window.removeEventListener('touchmove', WebUtil._captureProxy);
        window.removeEventListener('touchend', WebUtil._captureProxy);
    }
};


// Dynamically load scripts without using document.write()
// Reference: http://unixpapa.com/js/dyna.html
//
// Handles the case where load_scripts is invoked from a script that
// itself is loaded via load_scripts. Once all scripts are loaded the
// window.onscriptsloaded handler is called (if set).
WebUtil.get_include_uri = function (root_dir) {
    return (typeof INCLUDE_URI !== "undefined") ? INCLUDE_URI + root_dir + '/' : root_dir + '/';
};
WebUtil._loading_scripts = [];
WebUtil._pending_scripts = [];
WebUtil.load_scripts = function (files_by_dir) {
    "use strict";
    var head = document.getElementsByTagName('head')[0], script,
        ls = WebUtil._loading_scripts, ps = WebUtil._pending_scripts;

    var loadFunc = function (e) {
        while (ls.length > 0 && (ls[0].readyState === 'loaded' ||
                                 ls[0].readyState === 'complete')) {
            // For IE, append the script to trigger execution
            var s = ls.shift();
            //console.log("loaded script: " + s.src);
            head.appendChild(s);
        }
        if (!this.readyState ||
            (Util.Engine.presto && this.readyState === 'loaded') ||
            this.readyState === 'complete') {
            if (ps.indexOf(this) >= 0) {
                this.onload = this.onreadystatechange = null;
                //console.log("completed script: " + this.src);
                ps.splice(ps.indexOf(this), 1);

                // Call window.onscriptsload after last script loads
                if (ps.length === 0 && window.onscriptsload) {
                    window.onscriptsload();
                }
            }
        }
    };

    var root_dirs = Object.keys(files_by_dir);

    for (var d = 0; d < root_dirs.length; d++) {
        var root_dir = root_dirs[d];
        var files = files_by_dir[root_dir];

        for (var f = 0; f < files.length; f++) {
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = WebUtil.get_include_uri(root_dir) + files[f];
            //console.log("loading script: " + script.src);
            script.onload = script.onreadystatechange = loadFunc;
            // In-order script execution tricks
            if (Util.Engine.trident) {
                // For IE wait until readyState is 'loaded' before
                // appending it which will trigger execution
                // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                ls.push(script);
            } else {
                // For webkit and firefox set async=false and append now
                // https://developer.mozilla.org/en-US/docs/HTML/Element/script
                script.async = false;
                head.appendChild(script);
            }
            ps.push(script);
        }
    }
};

/* [module] export default WebUtil; */
