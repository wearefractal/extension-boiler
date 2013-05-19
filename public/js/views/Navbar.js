var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var Navbar, templ, _ref;

  templ = require('templates/navbar');
  Navbar = (function(_super) {
    __extends(Navbar, _super);

    function Navbar() {
      _ref = Navbar.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Navbar.prototype.className = "navbar-view";

    Navbar.prototype.content = templ;

    return Navbar;

  })(dermis.View);
  return Navbar;
});
