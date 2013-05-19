var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var Index, templ, _ref;

  templ = require('templates/index');
  Index = (function(_super) {
    __extends(Index, _super);

    function Index() {
      _ref = Index.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Index.prototype.className = "index-view";

    Index.prototype.content = templ;

    return Index;

  })(dermis.View);
  return Index;
});
