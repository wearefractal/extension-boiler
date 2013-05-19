var Background, background,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Background = (function() {
  function Background() {
    this.onWindowReady = __bind(this.onWindowReady, this);
    this.onWindowClosed = __bind(this.onWindowClosed, this);
    this.launch = __bind(this.launch, this);    this.windows = [];
  }

  Background.prototype.ifShowFrame = function() {
    var os, version;

    version = parseInt(navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    os = "other";
    if (navigator.appVersion.indexOf("Linux") !== -1) {
      os = "linux";
    } else if (navigator.appVersion.indexOf("CrOS") !== -1) {
      os = "cros";
    } else if (navigator.appVersion.indexOf("Mac OS X") !== -1) {
      os = "mac";
    }
    if (os === "linux" && version < 27) {
      return true;
    }
    if (os === "mac" && version < 25) {
      return true;
    }
    return false;
  };

  Background.prototype.launch = function(launchData) {
    var options,
      _this = this;

    options = {
      frame: (this.ifShowFrame() ? "chrome" : "none"),
      minWidth: 400,
      minHeight: 400,
      width: 400,
      height: 400
    };
    return chrome.app.window.create("index.html", options, function(win) {
      console.log("Window opened:", win);
      return win.onClosed.addListener(_this.onWindowClosed.bind(_this, win));
    });
  };

  Background.prototype.onWindowClosed = function(win) {
    return console.log("Window closed:", win);
  };

  Background.prototype.onWindowReady = function(win) {
    this.windows.push(win);
    return win.setHasChromeFrame(this.ifShowFrame());
  };

  return Background;

})();

background = new Background;

chrome.app.runtime.onLaunched.addListener(background.launch);

window.background = background;
