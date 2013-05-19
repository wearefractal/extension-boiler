;(function(){


/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("apily-guid/index.js", function(exports, require, module){

/**
 * guid
 * Simple prefixed unique id generator
 * 
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */

/**
 * Expose `guid`
 */

module.exports = guid;

/**
 * id
 */

var id = 0;

/**
 * guid
 *
 * @param {String} prefix prefix
 * @return {String} prefixed unique id
 * @api public
 */

function guid (prefix) {
  prefix = prefix || '';
  id += 1;
  return prefix + id;
};

});
require.register("mikeric-rivets/lib/rivets.js", function(exports, require, module){
// rivets.js
// version: 0.4.9
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, bindEvent, factory, getInputValue, unbindEvent,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  Rivets.Binding = (function() {

    function Binding(el, type, model, keypath, options) {
      var identifier, regexp, value, _ref;
      this.el = el;
      this.type = type;
      this.model = model;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.publish = __bind(this.publish, this);

      this.sync = __bind(this.sync, this);

      this.set = __bind(this.set, this);

      this.formattedValue = __bind(this.formattedValue, this);

      if (!(this.binder = Rivets.binders[type])) {
        _ref = Rivets.binders;
        for (identifier in _ref) {
          value = _ref[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = Rivets.binders['*']);
      if (this.binder instanceof Function) {
        this.binder = {
          routine: this.binder
        };
      }
      this.formatters = this.options.formatters || [];
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref, _ref1, _ref2, _ref3;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.model[id] instanceof Function ? this.model[id] : ((_ref1 = this.options) != null ? (_ref2 = _ref1.bindingOptions) != null ? (_ref3 = _ref2.formatters) != null ? _ref3[id] : void 0 : void 0 : void 0) instanceof Function ? this.options.bindingOptions.formatters[id] : Rivets.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.set = function(value) {
      var _ref;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      return this.set(this.options.bypass ? this.model[this.keypath] : Rivets.config.adapter.read(this.model, this.keypath));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
      value = getInputValue(this.el);
      _ref = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref1 = Rivets.formatters[id]) != null ? _ref1.publish : void 0) {
          value = (_ref2 = Rivets.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
        }
      }
      return Rivets.config.adapter.publish(this.model, this.keypath, value);
    };

    Binding.prototype.bind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
      if (this.options.bypass) {
        this.sync();
      } else {
        Rivets.config.adapter.subscribe(this.model, this.keypath, this.sync);
        if (Rivets.config.preloadData) {
          this.sync();
        }
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(Rivets.config.adapter.subscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.unbind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
      if (!this.options.bypass) {
        Rivets.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(Rivets.config.adapter.unsubscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    return Binding;

  })();

  Rivets.View = (function() {

    function View(els, models, options) {
      this.els = els;
      this.models = models;
      this.options = options;
      this.publish = __bind(this.publish, this);

      this.sync = __bind(this.sync, this);

      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.select = __bind(this.select, this);

      this.build = __bind(this.build, this);

      this.bindingRegExp = __bind(this.bindingRegExp, this);

      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      var prefix;
      prefix = Rivets.config.prefix;
      if (prefix) {
        return new RegExp("^data-" + prefix + "-");
      } else {
        return /^data-/;
      }
    };

    View.prototype.build = function() {
      var bindingRegExp, el, node, parse, skipNodes, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      parse = function(node) {
        var attribute, attributes, binder, binding, context, ctx, dependencies, identifier, keypath, model, n, options, path, pipe, pipes, regexp, splitPath, type, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
        if (__indexOf.call(skipNodes, node) < 0) {
          _ref = node.attributes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attribute = _ref[_i];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              if (!(binder = Rivets.binders[type])) {
                _ref1 = Rivets.binders;
                for (identifier in _ref1) {
                  value = _ref1[identifier];
                  if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                    regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                    if (regexp.test(type)) {
                      binder = value;
                    }
                  }
                }
              }
              binder || (binder = Rivets.binders['*']);
              if (binder.block) {
                _ref2 = node.getElementsByTagName('*');
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  n = _ref2[_j];
                  skipNodes.push(n);
                }
                attributes = [attribute];
              }
            }
          }
          _ref3 = attributes || node.attributes;
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            attribute = _ref3[_k];
            if (bindingRegExp.test(attribute.name)) {
              options = {};
              if ((_this.options != null) && typeof _this.options === 'object') {
                options.bindingOptions = _this.options;
              }
              type = attribute.name.replace(bindingRegExp, '');
              pipes = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = attribute.value.split('|');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  pipe = _ref4[_l];
                  _results.push(pipe.trim());
                }
                return _results;
              })();
              context = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = pipes.shift().split('<');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  ctx = _ref4[_l];
                  _results.push(ctx.trim());
                }
                return _results;
              })();
              path = context.shift();
              splitPath = path.split(/\.|:/);
              options.formatters = pipes;
              options.bypass = path.indexOf(':') !== -1;
              if (splitPath[0]) {
                model = _this.models[splitPath.shift()];
              } else {
                model = _this.models;
                splitPath.shift();
              }
              keypath = splitPath.join('.');
              if (model) {
                if (dependencies = context.shift()) {
                  options.dependencies = dependencies.split(/\s+/);
                }
                binding = new Rivets.Binding(node, type, model, keypath, options);
                binding.view = _this;
                _this.bindings.push(binding);
              }
            }
          }
          if (attributes) {
            attributes = null;
          }
        }
      };
      _ref = this.els;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parse(el);
        _ref1 = el.getElementsByTagName('*');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          node = _ref1[_j];
          if (node.attributes != null) {
            parse(node);
          }
        }
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    return View;

  })();

  bindEvent = function(el, event, handler, context) {
    var fn;
    fn = function(e) {
      return handler.call(context, e);
    };
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.on != null) {
        el.on(event, fn);
      } else {
        el.bind(event, fn);
      }
    } else if (window.addEventListener != null) {
      el.addEventListener(event, fn, false);
    } else {
      event = 'on' + event;
      el.attachEvent(event, fn);
    }
    return fn;
  };

  unbindEvent = function(el, event, fn) {
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.off != null) {
        return el.off(event, fn);
      } else {
        return el.unbind(event, fn);
      }
    } else if (window.removeEventListener) {
      return el.removeEventListener(event, fn, false);
    } else {
      event = 'on' + event;
      return el.detachEvent(event, fn);
    }
  };

  getInputValue = function(el) {
    var o, _i, _len, _results;
    if (window.jQuery != null) {
      el = jQuery(el);
      switch (el[0].type) {
        case 'checkbox':
          return el.is(':checked');
        default:
          return el.val();
      }
    } else {
      switch (el.type) {
        case 'checkbox':
          return el.checked;
        case 'select-multiple':
          _results = [];
          for (_i = 0, _len = el.length; _i < _len; _i++) {
            o = el[_i];
            if (o.selected) {
              _results.push(o.value);
            }
          }
          return _results;
          break;
        default:
          return el.value;
      }
    }
  };

  Rivets.binders = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) === (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !!value;
        }
      }
    },
    unchecked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) !== (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !value;
        }
      }
    },
    show: function(el, value) {
      return el.style.display = value ? '' : 'none';
    },
    hide: function(el, value) {
      return el.style.display = value ? 'none' : '';
    },
    html: function(el, value) {
      return el.innerHTML = value != null ? value : '';
    },
    value: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var o, _i, _len, _ref, _ref1, _ref2, _results;
        if (window.jQuery != null) {
          el = jQuery(el);
          if ((value != null ? value.toString() : void 0) !== ((_ref = el.val()) != null ? _ref.toString() : void 0)) {
            return el.val(value != null ? value : '');
          }
        } else {
          if (el.type === 'select-multiple') {
            if (value != null) {
              _results = [];
              for (_i = 0, _len = el.length; _i < _len; _i++) {
                o = el[_i];
                _results.push(o.selected = (_ref1 = o.value, __indexOf.call(value, _ref1) >= 0));
              }
              return _results;
            }
          } else if ((value != null ? value.toString() : void 0) !== ((_ref2 = el.value) != null ? _ref2.toString() : void 0)) {
            return el.value = value != null ? value : '';
          }
        }
      }
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    },
    "on-*": {
      "function": true,
      routine: function(el, value) {
        if (this.currentListener) {
          unbindEvent(el, this.args[0], this.currentListener);
        }
        return this.currentListener = bindEvent(el, this.args[0], value, this.model);
      }
    },
    "each-*": {
      block: true,
      bind: function(el, collection) {
        return el.removeAttribute(['data', Rivets.config.prefix, this.type].join('-').replace('--', '-'));
      },
      routine: function(el, collection) {
        var data, e, item, itemEl, m, n, previous, view, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            view.unbind();
            _ref1 = view.els;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              e = _ref1[_j];
              e.parentNode.removeChild(e);
            }
          }
        } else {
          this.marker = document.createComment(" rivets: " + this.type + " ");
          el.parentNode.insertBefore(this.marker, el);
          el.parentNode.removeChild(el);
        }
        this.iterated = [];
        if (collection) {
          _results = [];
          for (_k = 0, _len2 = collection.length; _k < _len2; _k++) {
            item = collection[_k];
            data = {};
            _ref2 = this.view.models;
            for (n in _ref2) {
              m = _ref2[n];
              data[n] = m;
            }
            data[this.args[0]] = item;
            itemEl = el.cloneNode(true);
            previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
            this.marker.parentNode.insertBefore(itemEl, (_ref3 = previous.nextSibling) != null ? _ref3 : null);
            view = new Rivets.View(itemEl, data);
            view.bind();
            _results.push(this.iterated.push(view));
          }
          return _results;
        }
      }
    },
    "class-*": function(el, value) {
      var elClass;
      elClass = " " + el.className + " ";
      if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
        return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
      }
    },
    "*": function(el, value) {
      if (value) {
        return el.setAttribute(this.type, value);
      } else {
        return el.removeAttribute(this.type);
      }
    }
  };

  Rivets.config = {
    preloadData: true
  };

  Rivets.formatters = {};

  factory = function(exports) {
    exports.binders = Rivets.binders;
    exports.formatters = Rivets.formatters;
    exports.config = Rivets.config;
    exports.configure = function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
    };
    return exports.bind = function(el, models, options) {
      var view;
      if (models == null) {
        models = {};
      }
      if (options == null) {
        options = {};
      }
      view = new Rivets.View(el, models, options);
      view.bind();
      return view;
    };
  };

  if (typeof exports === 'object') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      factory(this.rivets = exports);
      return exports;
    });
  } else {
    factory(this.rivets = {});
  }

}).call(this);

});
require.register("segmentio-extend/index.js", function(exports, require, module){

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});
require.register("anthonyshort-event-splitter/index.js", function(exports, require, module){
// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Split a string event like 'click .foo ul'
module.exports = function(str) {
  var match = str.match(delegateEventSplitter);
  return {
    name: match[1],
    selector: match[2]
  };
};
});
require.register("visionmedia-page.js/index.js", function(exports, require, module){

;(function(){

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' == typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' == typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    page.replace(location.pathname + location.search, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch){
    var ctx = new Context(path, state);
    if (false !== dispatch) page.dispatch(ctx);
    if (!ctx.unhandled) ctx.pushState();
    return ctx;
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */

  page.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state);
    ctx.init = init;
    if (null == dispatch) dispatch = true;
    if (dispatch) page.dispatch(ctx);
    ctx.save();
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var i = 0;

    function next() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, next);
    }

    next();
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    if (window.location.pathname + window.location.search == ctx.canonicalPath) return;
    page.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');
    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(path
      , this.keys = []
      , options.sensitive
      , options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn){
    var self = this;
    return function(ctx, next){
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    }
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Array} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params){
    var keys = this.keys
      , qsIndex = path.indexOf('?')
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
      , m = this.regexp.exec(pathname);

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];

      if (key) {
        params[key.name] = undefined !== params[key.name]
          ? params[key.name]
          : val;
      } else {
        params.push(val);
      }
    }

    return true;
  };

  /**
   * Normalize the given path string,
   * returning a regular expression.
   *
   * An empty array should be passed,
   * which will contain the placeholder
   * key names. For example "/user/:id" will
   * then contain ["id"].
   *
   * @param  {String|RegExp|Array} path
   * @param  {Array} keys
   * @param  {Boolean} sensitive
   * @param  {Boolean} strict
   * @return {RegExp}
   * @api private
   */

  function pathtoRegexp(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  /**
   * Handle "populate" events.
   */

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    }
  }

  /**
   * Handle "click" events.
   */

  function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash
    var href = el.href;
    var path = el.pathname + el.search;
    if (el.hash || '#' == el.getAttribute('href')) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(href)) return;

    // same page
    var orig = path;
    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null == e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

  /**
   * Expose `page`.
   */

  if ('undefined' == typeof module) {
    window.page = page;
  } else {
    module.exports = page;
  }

})();

});
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(xhr, options) {
  options = options || {};
  this.xhr = xhr;
  this.text = xhr.responseText;
  this.setStatusProperties(xhr.status);
  this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var msg = 'got ' + this.status + ' response';
  var err = new Error(msg);
  err.status = this.status;
  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.set('X-Requested-With', 'XMLHttpRequest');
  this.on('end', function(){
    var res = new Response(self.xhr);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Request.prototype = new Emitter;
Request.prototype.constructor = Request;

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("aheckmann-mpath/lib/index.js", function(exports, require, module){
/**
 * Returns the value of object `o` at the given `path`.
 *
 * ####Example:
 *
 *     var obj = {
 *         comments: [
 *             { title: 'exciting!', _doc: { title: 'great!' }}
 *           , { title: 'number dos' }
 *         ]
 *     }
 *
 *     mpath.get('comments.0.title', o)         // 'exciting!'
 *     mpath.get('comments.0.title', o, '_doc') // 'great!'
 *     mpath.get('comments.title', o)           // ['exciting!', 'number dos']
 *
 *     // summary
 *     mpath.get(path, o)
 *     mpath.get(path, o, special)
 *     mpath.get(path, o, map)
 *     mpath.get(path, o, special, map)
 *
 * @param {String} path
 * @param {Object} o
 * @param {String} [special] When this property name is present on any object in the path, walking will continue on the value of this property.
 * @param {Function} [map] Optional function which receives each individual found value. The value returned from `map` is used in the original values place.
 */

exports.get = function (path, o, special, map) {
  var lookup;

  if ('function' == typeof special) {
    if (special.length < 2) {
      map = special;
      special = undefined;
    } else {
      lookup = special;
      special = undefined;
    }
  }

  map || (map = K);

  var parts = 'string' == typeof path
    ? path.split('.')
    : path

  if (!Array.isArray(parts)) {
    throw new TypeError('Invalid `path`. Must be either string or array');
  }

  var obj = o
    , part;

  for (var i = 0; i < parts.length; ++i) {
    part = parts[i];

    if (Array.isArray(obj) && !/^\d+$/.test(part)) {
      // reading a property from the array items
      var paths = parts.slice(i);

      return obj.map(function (item) {
        return item
          ? exports.get(paths, item, special || lookup, map)
          : map(undefined);
      });
    }

    if (lookup) {
      obj = lookup(obj, part);
    } else {
      obj = special && obj[special]
        ? obj[special][part]
        : obj[part];
    }

    if (!obj) return map(obj);
  }

  return map(obj);
}

/**
 * Sets the `val` at the given `path` of object `o`.
 *
 * @param {String} path
 * @param {Anything} val
 * @param {Object} o
 * @param {String} [special] When this property name is present on any object in the path, walking will continue on the value of this property.
 * @param {Function} [map] Optional function which is passed each individual value before setting it. The value returned from `map` is used in the original values place.
 */

exports.set = function (path, val, o, special, map, _copying) {
  var lookup;

  if ('function' == typeof special) {
    if (special.length < 2) {
      map = special;
      special = undefined;
    } else {
      lookup = special;
      special = undefined;
    }
  }

  map || (map = K);

  var parts = 'string' == typeof path
    ? path.split('.')
    : path

  if (!Array.isArray(parts)) {
    throw new TypeError('Invalid `path`. Must be either string or array');
  }

  if (null == o) return;

  // the existance of $ in a path tells us if the user desires
  // the copying of an array instead of setting each value of
  // the array to the one by one to matching positions of the
  // current array.
  var copy = _copying || /\$/.test(path)
    , obj = o
    , part

  for (var i = 0, len = parts.length - 1; i < len; ++i) {
    part = parts[i];

    if ('$' == part) {
      if (i == len - 1) {
        break;
      } else {
        continue;
      }
    }

    if (Array.isArray(obj) && !/^\d+$/.test(part)) {
      var paths = parts.slice(i);
      if (!copy && Array.isArray(val)) {
        for (var j = 0; j < obj.length && j < val.length; ++j) {
          // assignment of single values of array
          exports.set(paths, val[j], obj[j], special || lookup, map, copy);
        }
      } else {
        for (var j = 0; j < obj.length; ++j) {
          // assignment of entire value
          exports.set(paths, val, obj[j], special || lookup, map, copy);
        }
      }
      return;
    }

    if (lookup) {
      obj = lookup(obj, part);
    } else {
      obj = special && obj[special]
        ? obj[special][part]
        : obj[part];
    }

    if (!obj) return;
  }

  // process the last property of the path

  part = parts[len];

  // use the special property if exists
  if (special && obj[special]) {
    obj = obj[special];
  }

  // set the value on the last branch
  if (Array.isArray(obj) && !/^\d+$/.test(part)) {
    if (!copy && Array.isArray(val)) {
      for (var item, j = 0; j < obj.length && j < val.length; ++j) {
        item = obj[j];
        if (item) {
          if (lookup) {
            lookup(item, part, map(val[j]));
          } else {
            if (item[special]) item = item[special];
            item[part] = map(val[j]);
          }
        }
      }
    } else {
      for (var j = 0; j < obj.length; ++j) {
        item = obj[j];
        if (item) {
          if (lookup) {
            lookup(item, part, map(val));
          } else {
            if (item[special]) item = item[special];
            item[part] = map(val);
          }
        }
      }
    }
  } else {
    if (lookup) {
      lookup(obj, part, map(val));
    } else {
      obj[part] = map(val);
    }
  }
}

/*!
 * Returns the value passed to it.
 */

function K (v) {
  return v;
}

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("dermis/dist/delegate.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Delegate, splitEvents;

splitEvents = require('event-splitter');

Delegate = (function() {

  Delegate.prototype._binds = [];

  function Delegate(root, events, context) {
    this.root = root;
    this.events = events != null ? events : {};
    this.context = context != null ? context : {};
  }

  Delegate.prototype.bindEvent = function(event, selector, handler) {
    if (typeof handler === "string") {
      handler = this.context[handler];
    }
    $(this.root).on(event, selector, handler);
    this._binds.push([event, selector, handler]);
    return this;
  };

  Delegate.prototype.unbindEvent = function(event, selector, handler) {
    if (typeof handler === "string") {
      handler = this.context[handler];
    }
    $(this.root).off(event, selector, handler);
    return this;
  };

  Delegate.prototype.bind = function() {
    var evhandler, handler, name, selector, str, _ref, _ref1;
    _ref = this.events;
    for (str in _ref) {
      handler = _ref[str];
      if (typeof handler === 'object') {
        for (name in handler) {
          evhandler = handler[name];
          this.bindEvent(name, str, evhandler);
        }
      } else {
        _ref1 = splitEvents(str), name = _ref1.name, selector = _ref1.selector;
        this.bindEvent(name, selector, handler);
      }
    }
    return this;
  };

  Delegate.prototype.unbind = function() {
    var z, _i, _len, _ref;
    _ref = this._binds;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      z = _ref[_i];
      this.unbindEvent.apply(this, z);
    }
    this._binds = [];
    return this;
  };

  return Delegate;

})();

module.exports = Delegate;

});
require.register("dermis/dist/makeElement.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1

module.exports = function(tagName, attributes, content) {
  var el;
  el = document.createElement(tagName);
  if (attributes) {
    $(el).attr(attributes);
  }
  if (content) {
    $(el).html(content);
  }
  return el;
};

});
require.register("dermis/dist/rivetsConfig.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var cfg, k, prevent, publishers, v, _ref,
  __slice = [].slice;

prevent = require('prevent');

cfg = {
  preloadData: true,
  formatters: {
    exists: function(v) {
      return v != null;
    },
    empty: function(v) {
      return !((v != null) && (v != null ? v.length : void 0) !== 0);
    },
    date: function(v) {
      return moment(v).format('MMM DD, YYYY');
    },
    money: function(v) {
      return accounting.formatMoney(v);
    },
    toNumber: function(v) {
      return +v;
    },
    toString: function(v) {
      return String(v);
    },
    negate: function(v) {
      return !v;
    },
    is: function(v, a) {
      return v === a;
    },
    isnt: function(v, a) {
      return v !== a;
    },
    gt: function(v, a) {
      return v > a;
    },
    lt: function(v, a) {
      return v < a;
    },
    at: function(v, a) {
      if (v == null) {
        return v;
      }
      return v[parseInt(a)];
    },
    join: function(v, a) {
      if (v == null) {
        return v;
      }
      return v.join(a);
    },
    split: function(v, a) {
      if (v == null) {
        return v;
      }
      return v.split(a);
    },
    prepend: function() {
      var a, v;
      v = arguments[0], a = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return a.join(' ') + v;
    },
    append: function() {
      var a, v;
      v = arguments[0], a = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return v + a.join(' ');
    },
    length: function(v) {
      if (v == null) {
        return v;
      }
      return v.length;
    },
    cancelEvent: function(v) {
      if (v == null) {
        return v;
      }
      return function(e) {
        prevent(e);
        v.call(this, e);
        return false;
      };
    },
    sort: function(arr, direction) {
      if (direction == null) {
        direction = 'asc';
      }
      if (direction === 'desc') {
        return arr.sort().reverse();
      }
      return arr.sort();
    },
    sortBy: function(arr, field, direction) {
      var reverse, sortFn;
      if (direction == null) {
        direction = 'asc';
      }
      reverse = direction === 'desc';
      sortFn = function(a, b) {
        var out;
        if (a[field] < b[field]) {
          out = -1;
        } else if (a[field] > b[field]) {
          out = 1;
        } else {
          out = 0;
        }
        return out * [1, -1][+(!!reverse)];
      };
      return arr.sort(sortFn);
    }
  },
  adapter: {
    subscribe: function(obj, kp, cb) {
      obj.on("change:" + kp, cb);
    },
    unsubscribe: function(obj, kp, cb) {
      obj.removeListener("change:" + kp, cb);
    },
    read: function(obj, kp) {
      return obj.get(kp);
    },
    publish: function(obj, kp, val) {
      obj.set(kp, val);
    }
  }
};

publishers = ["toNumber", "toString"];

_ref = cfg.formatters;
for (k in _ref) {
  v = _ref[k];
  if (publishers.indexOf(k) !== -1) {
    v.publish = v.read = v;
  }
}

module.exports = cfg;

});
require.register("dermis/dist/syncAdapter.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var methods, request, util;

request = require('superagent');

util = require('./util');

methods = {
  'create': 'post',
  'update': 'put',
  'patch': 'patch',
  'destroy': 'del',
  'read': 'get'
};

module.exports = function(method, mod, opt, cb) {
  var req, url, urls, verb, _ref;
  if (opt == null) {
    opt = {};
  }
  if (typeof opt === 'function' && !cb) {
    cb = opt;
    opt = {};
  }
  if (methods[method] == null) {
    throw new Error("Invalid method");
  }
  verb = methods[method];
  if (mod.urls != null) {
    urls = util.result(mod.urls, mod);
    url = util.result(urls[method], mod);
  } else if (mod.url != null) {
    url = util.result(mod.url, mod);
  }
  if (typeof url !== 'string') {
    throw new Error("Missing url");
  }
  if ((_ref = opt.type) == null) {
    opt.type = 'json';
  }
  req = request[verb](url).type(util.result(opt.type));
  if (opt.headers) {
    req.set(util.result(opt.headers));
  }
  if (opt.query) {
    req.query(util.result(opt.query));
  }
  if (opt.username && opt.password) {
    req.auth(util.result(opt.username), util.result(opt.password));
  }
  if (util.result(opt.withCredentials) === true) {
    req.withCredentials();
  }
  if (verb !== "GET") {
    req.send(util.result(opt.attrs) || mod.toJSON());
  }
  return req.end(cb);
};

});
require.register("dermis/dist/util.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1

module.exports = {
  result: function(v, scope) {
    if (typeof v === "function") {
      if (scope) {
        return v.bind(scope)();
      }
      return v();
    }
    return v;
  }
};

});
require.register("dermis/dist/toJSON.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var toJSON,
  __hasProp = {}.hasOwnProperty;

module.exports = toJSON = function(val) {
  var i, k, out, v;
  if (Array.isArray(val)) {
    return (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = val.length; _i < _len; _i++) {
        i = val[_i];
        _results.push(toJSON(i));
      }
      return _results;
    })();
  } else if ((val != null) && typeof val.toJSON === 'function') {
    return val.toJSON();
  } else if (typeof val === "object") {
    out = {};
    for (k in val) {
      if (!__hasProp.call(val, k)) continue;
      v = val[k];
      out[k] = toJSON(v);
    }
    return out;
  }
  return val;
};

});
require.register("dermis/dist/modelAdapter.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var adapter;

module.exports = adapter = {
  get: function(o, k) {
    if (o._isCollection && /^\d+$/.test(k)) {
      return o.at(k);
    }
    if (o._isModel) {
      return o.get(k);
    }
    return o[k];
  },
  set: function(silent) {
    return function(o, k, v) {
      if (typeof v !== 'undefined') {
        if (v === null) {
          return adapter.del(o, k, silent);
        }
        if (o._isCollection && /^\d+$/.test(k)) {
          o.replaceAt(parseInt(k), v, silent);
        } else if (o._isModel) {
          o.set(k, v, silent);
        } else {
          o[k] = v;
        }
      }
      return adapter.get(o, k);
    };
  },
  del: function(o, k, silent) {
    if (o._isCollection && /^\d+$/.test(k)) {
      o.removeAt(parseInt(k), silent);
    } else if (o._isModel) {
      delete o._props[k];
    } else {
      delete o[k];
    }
  }
};

});
require.register("dermis/dist/Model.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Emitter, Model, adapter, mpath, rivets, syncAdapter, toJSON,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

rivets = require('rivets');

syncAdapter = require('./syncAdapter');

Emitter = require('emitter');

mpath = require('mpath');

adapter = require('./modelAdapter');

toJSON = require('./toJSON');

Model = (function(_super) {

  __extends(Model, _super);

  Model._isModel = true;

  Model.prototype._isModel = true;

  Model.prototype.sync = syncAdapter;

  Model.prototype.casts = null;

  Model.prototype.accessors = null;

  Model.prototype.defaults = null;

  Model.prototype.format = null;

  Model.prototype._fetched = false;

  function Model(o) {
    var _ref, _ref1;
    this._props = {};
    if ((_ref = this.casts) == null) {
      this.casts = {};
    }
    if ((_ref1 = this.accessors) == null) {
      this.accessors = {};
    }
    if (this.defaults != null) {
      this.set(this.defaults);
    }
    if (this.format != null) {
      o = this.format(o);
    }
    if (!Array.isArray(o)) {
      this.set(o);
    }
  }

  Model.prototype.get = function(k) {
    var _ref;
    if ((_ref = this.accessors[k]) != null ? _ref.get : void 0) {
      return this.accessors[k].get();
    }
    return mpath.get(k, this._props, adapter.get);
  };

  Model.prototype.set = function(k, v, silent) {
    var castModel, ky, vy, _ref;
    if (k == null) {
      return;
    }
    if (typeof k === 'object') {
      silent = v;
      for (ky in k) {
        vy = k[ky];
        this.set(ky, vy, silent);
      }
      return this;
    } else {
      castModel = this.casts[k];
      if (castModel != null) {
        if (castModel._isModel) {
          v = new castModel(v);
        } else {
          v = castModel(v);
        }
      }
      if ((_ref = this.accessors[k]) != null ? _ref.set : void 0) {
        this.accessors[k].set(v);
      } else {
        mpath.set(k, v, this._props, adapter.set(silent));
      }
      if (!silent) {
        this.emit("change", k, v);
        this.emit("change:" + k, v);
      }
      return this;
    }
  };

  Model.prototype.clear = function(silent) {
    var k, v, _ref;
    _ref = this._props;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      this.remove(k, silent);
    }
    return this;
  };

  Model.prototype.has = function(k) {
    return this.get(k) != null;
  };

  Model.prototype.remove = function(k, silent) {
    this.set(k, null, true);
    if (!silent) {
      this.emit("change", k);
      this.emit("change:" + k);
      this.emit("remove", k);
      this.emit("remove:" + k);
    }
    return this;
  };

  Model.prototype.toJSON = function() {
    return toJSON(this._props);
  };

  Model.prototype.fetch = function(opt, cb) {
    var _this = this;
    if (typeof opt === 'function' && !cb) {
      cb = opt;
      opt = {};
    }
    this.emit("fetching", opt);
    this.sync('read', this, opt, function(err, res) {
      if (err != null) {
        _this.emit("fetchError", err);
        if (cb) {
          cb(err);
        }
        return;
      }
      if (_this.format != null) {
        res.body = _this.format(res.body);
      }
      if (typeof res.body === 'object') {
        _this.set(res.body);
      }
      if (cb) {
        cb(err, res);
      }
      _this._fetched = true;
      return _this.emit("fetched", res);
    });
    return this;
  };

  Model.prototype.save = function(opt, cb) {
    var _this = this;
    if (typeof opt === 'function' && !cb) {
      cb = opt;
      opt = {};
    }
    this.emit("saving", opt);
    this.sync('patch', this, opt, function(err, res) {
      if (err != null) {
        _this.emit("saveError", err);
        if (cb) {
          cb(err);
        }
        return;
      }
      if (cb) {
        cb(err, res);
      }
      return _this.emit("saved", res);
    });
    return this;
  };

  Model.prototype.create = function(opt, cb) {
    var _this = this;
    if (typeof opt === 'function' && !cb) {
      cb = opt;
      opt = {};
    }
    this.emit("creating", opt);
    this.sync('create', this, opt, function(err, res) {
      if (err != null) {
        _this.emit("createError", err);
        if (cb) {
          cb(err);
        }
        return;
      }
      if (cb) {
        cb(err, res);
      }
      return _this.emit("created", res);
    });
    return this;
  };

  Model.prototype.destroy = function(opt, cb) {
    var _this = this;
    if (typeof opt === 'function' && !cb) {
      cb = opt;
      opt = {};
    }
    this.emit("destroying", opt);
    this.sync('destroy', this, opt, function(err, res) {
      if (err != null) {
        _this.emit("destroyError", err);
        if (cb) {
          cb(err);
        }
        return;
      }
      if (cb) {
        cb(err, res);
      }
      return _this.emit("destroyed", res);
    });
    return this;
  };

  Model.prototype.fetched = function(cb) {
    if (this._fetched) {
      cb();
    } else {
      this.once("fetched", cb);
    }
    return this;
  };

  Model.prototype.bind = function(el) {
    rivets.bind(el, this);
    return this;
  };

  return Model;

})(Emitter);

module.exports = Model;

});
require.register("dermis/dist/Collection.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Collection, Emitter, Model, rivets, rivetsConfig,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('emitter');

rivets = require('rivets');

rivetsConfig = require('./rivetsConfig');

Model = require('./Model');

Collection = (function(_super) {

  __extends(Collection, _super);

  Collection._isCollection = true;

  Collection.prototype._isCollection = true;

  function Collection(items) {
    Collection.__super__.constructor.apply(this, arguments);
    if (!this.has('models')) {
      this.set('models', []);
    }
    if (Array.isArray(items)) {
      this.add(items);
    }
  }

  Collection.prototype.model = null;

  Collection.prototype.add = function(o, silent) {
    var i, mod, _i, _len;
    if (Array.isArray(o)) {
      for (_i = 0, _len = o.length; _i < _len; _i++) {
        i = o[_i];
        this.add(i, silent);
      }
      return this;
    }
    mod = this._processModel(o);
    this.get('models').push(mod);
    this.set('models', this.get('models'), silent);
    if (!silent) {
      this.emit("add", mod);
    }
    return this;
  };

  Collection.prototype.remove = function(o, silent) {
    var i, idx, _i, _len;
    if (Array.isArray(o)) {
      for (_i = 0, _len = o.length; _i < _len; _i++) {
        i = o[_i];
        this.remove(i, silent);
      }
      return this;
    }
    idx = this.indexOf(o);
    if (idx !== -1) {
      this.get('models').splice(idx, 1);
      this.set('models', this.get('models'), silent);
      if (!silent) {
        this.emit("remove", o);
      }
    }
    return this;
  };

  Collection.prototype.removeAt = function(idx, silent) {
    return this.remove(this.at(idx), silent);
  };

  Collection.prototype.replace = function(o, nu, silent) {
    var idx;
    idx = this.indexOf(o);
    if (idx !== -1) {
      this.replaceAt(idx, nu, silent);
    }
    return this;
  };

  Collection.prototype.replaceAt = function(idx, nu, silent) {
    var mods;
    mods = this.get('models');
    mods[idx] = this._processModel(nu);
    this.set('models', mods, silent);
    return this;
  };

  Collection.prototype.reset = function(o, silent) {
    if (typeof o === 'boolean') {
      silent = o;
      o = null;
    }
    if (o) {
      this.set('models', [], true);
      this.add(o, silent);
    } else {
      this.set('models', [], silent);
    }
    if (!silent) {
      this.emit("reset");
    }
    return this;
  };

  Collection.prototype.indexOf = function(o) {
    return this.get('models').indexOf(o);
  };

  Collection.prototype.at = function(idx) {
    return this.get('models')[idx];
  };

  Collection.prototype.first = function() {
    return this.at(0);
  };

  Collection.prototype.last = function() {
    return this.at(this.size() - 1);
  };

  Collection.prototype.size = function() {
    return this.get('models').length;
  };

  Collection.prototype.each = function(fn) {
    this.get('models').forEach(fn);
    return this;
  };

  Collection.prototype.map = function(fn) {
    return this.get('models').map(fn);
  };

  Collection.prototype.filter = function(fn) {
    return this.get('models').filter(fn);
  };

  Collection.prototype.where = function(obj, raw) {
    return this.filter(function(item) {
      var k, v;
      for (k in obj) {
        if (!__hasProp.call(obj, k)) continue;
        v = obj[k];
        if (item instanceof Model && !raw) {
          if (item.get(k) !== v) {
            return false;
          }
        } else {
          if (item[k] !== v) {
            return false;
          }
        }
      }
      return true;
    });
  };

  Collection.prototype.pluck = function(attr, raw) {
    return this.map(function(v) {
      if (v instanceof Model && !raw) {
        return v.get(attr);
      } else {
        return v[attr];
      }
    });
  };

  Collection.prototype.getAll = function() {
    return this.get('models');
  };

  Collection.prototype.fetch = function(opt, cb) {
    var _this = this;
    if (typeof opt === 'function' && !cb) {
      cb = opt;
      opt = {};
    }
    this.emit("fetching", opt);
    this.sync('read', this, opt, function(err, res) {
      if (err != null) {
        _this.emit("fetchError", err);
        if (cb) {
          cb(err);
        }
        return;
      }
      if (Array.isArray(res.body)) {
        _this.reset(res.body);
      }
      if (cb) {
        cb(err, res);
      }
      _this._fetched = true;
      return _this.emit("fetched", res);
    });
    return this;
  };

  Collection.prototype._processModel = function(o) {
    var mod;
    if (this.model && !(o instanceof Model)) {
      mod = new this.model(o);
    } else {
      mod = o;
    }
    return mod;
  };

  return Collection;

})(Model);

module.exports = Collection;

});
require.register("dermis/dist/View.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Delegate, Emitter, View, extend, guid, makeElement, rivets, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('emitter');

guid = require('guid');

Delegate = require('./delegate');

extend = require('extend');

makeElement = require('./makeElement');

util = require('./util');

rivets = require('rivets');

View = (function(_super) {

  __extends(View, _super);

  function View(opt) {
    if (opt == null) {
      opt = {};
    }
    this._id = guid();
    this._configure(opt);
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.eventBindings = new Delegate(this.$el, this.events, this);
    this.delegateEvents();
  }

  View.prototype.tagName = 'div';

  View.prototype.id = null;

  View.prototype.className = null;

  View.prototype.attributes = null;

  View.prototype.$ = function(sel) {
    return this.$el.find(sel);
  };

  View.prototype.bind = function(data) {
    rivets.bind(this.$el, data);
    return this;
  };

  View.prototype.initialize = function() {
    return this;
  };

  View.prototype.render = function() {
    return this;
  };

  View.prototype.dispose = function() {
    this.undelegateEvents();
    return this;
  };

  View.prototype.remove = function() {
    this.dispose();
    this.$el.remove();
    return this;
  };

  View.prototype.setElement = function(el, delegate) {
    if (delegate == null) {
      delegate = true;
    }
    if (this.$el) {
      this.undelegateEvents();
    }
    this.$el = $(el);
    this.el = this.$el[0];
    if (delegate) {
      this.delegateEvents();
    }
    return this;
  };

  View.prototype.delegateEvents = function() {
    this.undelegateEvents();
    this.eventBindings.bind();
    return this;
  };

  View.prototype.undelegateEvents = function() {
    this.eventBindings.unbind();
    return this;
  };

  View.prototype._configure = function(opt) {
    this.options = extend({}, this.options, opt);
    return this;
  };

  View.prototype._ensureElement = function() {
    var attr, virt;
    if (this.el) {
      this.setElement(util.result(this.el), false);
    } else {
      attr = extend({}, util.result(this.attributes));
      if (this.id) {
        attr.id = util.result(this.id);
      }
      if (this.className) {
        attr["class"] = util.result(this.className);
      }
      virt = makeElement(util.result(this.tagName), attr, util.result(this.content));
      this.setElement(virt, false);
    }
    return this;
  };

  return View;

})(Emitter);

module.exports = View;

});
require.register("dermis/dist/Layout.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Emitter, Layout, Region, View, util,
  _this = this,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('emitter');

View = require('./View');

Region = require('./Region');

util = require('./util');

Layout = (function(_super) {

  __extends(Layout, _super);

  function Layout() {
    var _ref, _ref1,
      _this = this;
    this.addRegion = function(name) {
      return Layout.prototype.addRegion.apply(_this, arguments);
    };
    this._regions = {};
    if ((_ref = this.regions) == null) {
      this.regions = {};
    }
    if ((_ref1 = this.views) == null) {
      this.views = {};
    }
    Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.region = function(name) {
    return this._regions[name];
  };

  Layout.prototype.addRegion = function(name) {
    return this._regions[name] = new Region;
  };

  Layout.prototype.render = function() {
    var name, select, v, _ref, _ref1;
    Layout.__super__.render.apply(this, arguments);
    _ref = this.regions;
    for (name in _ref) {
      select = _ref[name];
      this.addRegion(name);
      this.region(name).$el = this.$(select);
    }
    _ref1 = this.views;
    for (name in _ref1) {
      v = _ref1[name];
      this.region(name).view = v;
    }
    this.emit("render", this);
    return this;
  };

  return Layout;

})(View);

module.exports = Layout;

});
require.register("dermis/dist/Region.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Emitter, Region,
  _this = this,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Emitter = require('emitter');

Region = (function(_super) {

  __extends(Region, _super);

  function Region() {
    var _this = this;
    this.clear = function() {
      return Region.prototype.clear.apply(_this, arguments);
    };
    this.set = function(nu) {
      return Region.prototype.set.apply(_this, arguments);
    };
    this.show = function() {
      var a;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Region.prototype.show.apply(_this, arguments);
    };
    return Region.__super__.constructor.apply(this, arguments);
  }

  Region.prototype.view = null;

  Region.prototype.$el = null;

  Region.prototype.show = function() {
    var a, _ref;
    a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.view) {
      this.clear();
      this.view.setElement(this.view.el);
      this.$el.html((_ref = this.view).render.apply(_ref, a).el);
      this.emit("show");
    }
    return this;
  };

  Region.prototype.set = function(nu) {
    this.view = nu;
    this.emit("change", nu);
    return this;
  };

  Region.prototype.clear = function() {
    if (this.view) {
      this.view.remove();
      this.emit("clear");
    }
    return this;
  };

  return Region;

})(Emitter);

module.exports = Region;

});
require.register("dermis/dist/Router.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Emitter, Router, page,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Emitter = require('emitter');

page = require('page');

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.add = function(route, handler) {
    var fn, h, rt, _i, _len;
    if (typeof route === 'object') {
      for (rt in route) {
        if (!__hasProp.call(route, rt)) continue;
        h = route[rt];
        this.add(rt, h);
      }
      return;
    }
    if (Array.isArray(handler)) {
      for (_i = 0, _len = handler.length; _i < _len; _i++) {
        fn = handler[_i];
        this.add(route, fn);
      }
      return;
    }
    if (typeof handler === 'string') {
      handler = this[handler];
    }
    page(route, handler);
    return this;
  };

  Router.prototype.base = function() {
    page.base.apply(page, arguments);
    return this;
  };

  Router.prototype.show = function() {
    page.show.apply(page, arguments);
    return this;
  };

  Router.prototype.use = function() {
    page.apply(null, ['*'].concat(__slice.call(arguments)));
    return this;
  };

  Router.prototype.start = function() {
    page.start.apply(page, arguments);
    return this;
  };

  Router.prototype.stop = function() {
    page.stop.apply(page, arguments);
    return this;
  };

  Router.prototype.clear = function() {
    page.callbacks = [];
    return this;
  };

  return Router;

})(Emitter);

module.exports = Router;

});
require.register("dermis/dist/Channel.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Channel, Emitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('emitter');

Channel = (function(_super) {

  __extends(Channel, _super);

  function Channel() {
    return Channel.__super__.constructor.apply(this, arguments);
  }

  return Channel;

})(Emitter);

module.exports = Channel;

});
require.register("dermis/dist/dermis.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
var Channel, Router, dermis, k, rivets, rivetsConfig, v, _ref;

Router = require('./Router');

Channel = require('./Channel');

rivetsConfig = require('./rivetsConfig');

rivets = require('rivets');

rivets.configure(rivetsConfig);

_ref = rivetsConfig.formatters;
for (k in _ref) {
  v = _ref[k];
  rivets.formatters[k] = v;
}

dermis = {
  Layout: require('./Layout'),
  Region: require('./Region'),
  Model: require('./Model'),
  Collection: require('./Collection'),
  View: require('./View'),
  Channel: Channel,
  Router: Router,
  router: new Router,
  channel: new Channel,
  binding: rivets,
  sync: require('./syncAdapter'),
  http: require('superagent'),
  nextTick: function(fn) {
    return setTimeout(fn, 0);
  },
  internal: {
    bindingConfig: rivetsConfig,
    makeElement: require('./makeElement'),
    Delegate: require('./delegate'),
    util: require('./util')
  }
};

module.exports = dermis;

});
require.alias("component-emitter/index.js", "dermis/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("apily-guid/index.js", "dermis/deps/guid/index.js");

require.alias("mikeric-rivets/lib/rivets.js", "dermis/deps/rivets/lib/rivets.js");
require.alias("mikeric-rivets/lib/rivets.js", "dermis/deps/rivets/index.js");
require.alias("mikeric-rivets/lib/rivets.js", "mikeric-rivets/index.js");

require.alias("segmentio-extend/index.js", "dermis/deps/extend/index.js");

require.alias("anthonyshort-event-splitter/index.js", "dermis/deps/event-splitter/index.js");

require.alias("visionmedia-page.js/index.js", "dermis/deps/page/index.js");

require.alias("visionmedia-superagent/lib/client.js", "dermis/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "dermis/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");

require.alias("aheckmann-mpath/lib/index.js", "dermis/deps/mpath/lib/index.js");
require.alias("aheckmann-mpath/lib/index.js", "dermis/deps/mpath/index.js");
require.alias("aheckmann-mpath/lib/index.js", "aheckmann-mpath/index.js");

require.alias("yields-prevent/index.js", "dermis/deps/prevent/index.js");

require.alias("dermis/dist/dermis.js", "dermis/index.js");

if (typeof exports == "object") {
  module.exports = require("dermis");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("dermis"); });
} else {
  window["dermis"] = require("dermis");
}})();