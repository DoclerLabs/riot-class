'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.riot = exports.TagProto = undefined;
exports.TagAbstract = TagAbstract;
exports.RegisterTag = RegisterTag;

var _riot = require('riot');

var riot = _interopRequireWildcard(_riot);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The prototype of the abstract class.
 * It is exported, so your're able to extends it's 'prototype' even further.
 */
var TagProto = exports.TagProto = function TagProto(tag, options) {
    _classCallCheck(this, TagProto);

    TagProto.Constructing && TagProto.Constructing(this);
    riot.observable(this);
    this.tag = tag;
    this.options = options;
    this.onMount && this.tag.on('mount', this.onMount.bind(this));
    this.onBeforeMount && this.tag.on('before-mount', this.onBeforeMount.bind(this));
    this.onUnMount && this.tag.on('unmount', this.onUnMount.bind(this));
    this.onBeforeUnMount && this.tag.on('before-unmount', this.onBeforeUnMount.bind(this));
    this.onUpdate && this.tag.on('update', this.onUpdate.bind(this));
    this.onUpdated && this.tag.on('updated', this.onUpdated.bind(this));
    this.addEvents && this.addEvents();
};

/**
 * Return the abstract class itself, import this class in your tags.
 *
 *      class MyHeaderTag extends TagAbstract(`
 *          <my-header-tag></my-header-tag>
 *      `, { styles }) {
 *          onMount(){}
 *      }
 *
 * @param html
 * @param mixins
 * @returns {*}
 * @constructor
 */


function TagAbstract(html) {
    var mixins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var RiotTag = function (_TagProto) {
        _inherits(RiotTag, _TagProto);

        function RiotTag() {
            var _ref;

            _classCallCheck(this, RiotTag);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var _this = _possibleConstructorReturn(this, (_ref = RiotTag.__proto__ || Object.getPrototypeOf(RiotTag)).call.apply(_ref, [this].concat(args)));

            var _loop = function _loop(i) {
                var name = '_' + i;
                mixins.hasOwnProperty(i) && Object.defineProperty(_this, i, {
                    set: function set(v) {
                        this[name] = v;
                    },
                    get: function get() {
                        return this[name] = v;
                    }
                });
            };

            for (var i in mixins) {
                _loop(i);
            }
            return _this;
        }

        return RiotTag;
    }(TagProto);

    RiotTag.TEMPLATE = html;
    return RiotTag;
}

/**
 * Register a riot tag.
 * @param fn {function} Context of the tag
 * @constructor
 */
function RegisterTag(fn) {
    var html = fn.TEMPLATE;
    html = html.trim();
    var innerHtml = html.match(/(^<[\s\S]*?>)([\s\S]*?)(<.*?>$)/)[2].trim();
    var tag = html.match(/<.*?>/m)[0];
    var name = tag.match(/<(.*?)(>| )/m)[1];
    var attr = tag.match(/<.*? (.*?)>/m);
    var api = [];
    var tmpFn = fn;
    attr = attr ? attr[1] : undefined;

    do {
        Object.getOwnPropertyNames(tmpFn.prototype).forEach(function (prop) {
            if (typeof prop === 'string' && api.findIndex(function (v) {
                    return v.name === prop;
                }) === -1 && prop !== 'constructor' && prop.charAt(0) !== '_') {
                var descriptor = Object.getOwnPropertyDescriptor(tmpFn.prototype, prop);

                api.push({
                    name: prop,
                    type: descriptor.get ? 'var' : 'fn'
                });
            }
        });

        tmpFn = tmpFn.__proto__;

        if (tmpFn.prototype && tmpFn.constructor && tmpFn.constructor.name !== 'TagProto' && tmpFn.constructor.name !== 'Object') {} else {
            tmpFn = false;
        }
    } while (tmpFn);

    var ctx = function Context(opts) {
        var self = this;
        api.forEach(function (prop) {
            if (prop.type === 'var') {
                Object.defineProperty(self, prop.name, {
                    get: function get() {
                        return self.tagClass[prop.name];
                    },
                    set: function set(v) {
                        return self.tagClass[prop.name] = v;
                    }
                });
            } else {
                self[prop.name] = function () {
                    var _self$tagClass;

                    return (_self$tagClass = self.tagClass)[prop.name].apply(_self$tagClass, arguments);
                };
            }
        });
        this.tagClass = new fn(this, opts);
    };
    riot.tag(name, innerHtml, null, attr, ctx);
}

exports.riot = riot;