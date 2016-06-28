'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _riot = require('riot');

var _riot2 = _interopRequireDefault(_riot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var r = Object.assign({}, _riot2.default);

r.Abstract = function () {
    function RiotTagAbstract(tag, options) {
        _classCallCheck(this, RiotTagAbstract);

        r.observable(this);
        this.tag = tag;
        this.options = options;

        this.tag.on('mount', this.onMount.bind(this));
        this.tag.on('before-mount', this.onBeforeMount().bind(this));
        this.tag.on('unmount', this.onUnMount().bind(this));
        this.tag.on('before-unmount', this.onBeforeUnMount().bind(this));
        this.tag.on('update', this.onUpdate.bind(this));
        this.tag.on('updated', this.onUpdated.bind(this));
    }

    RiotTagAbstract.prototype.onBeforeMount = function onBeforeMount() {};

    RiotTagAbstract.prototype.onBeforeUnMount = function onBeforeUnMount() {};

    RiotTagAbstract.prototype.onMount = function onMount() {};

    RiotTagAbstract.prototype.onUnMount = function onUnMount() {};

    RiotTagAbstract.prototype.onUpdate = function onUpdate() {};

    RiotTagAbstract.prototype.onUpdated = function onUpdated() {};

    return RiotTagAbstract;
}();

/**
 * Register a riot tag.
 * @param html {string}   Template code
 * @param fn   {function} Context of the tag
 * @constructor
 */
r.Register = function RiotRegisterTag(html) {
    var fn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    html = html.trim();
    var innerHtml = html.match(/<(.*?)>([\s\S]*?)(<\/\1>)(?![\s\S])/)[2].trim();
    var tag = html.match(/<.*?>/m)[0];
    var name = tag.match(/<(.*?)(>| )/m)[1];
    var attr = tag.match(/<.*? (.*?)>/m);
    var api = [];
    var tmpFn = fn;
    attr = attr ? attr[0] : undefined;

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

        if (tmpFn.prototype && tmpFn.constructor && tmpFn.constructor.name !== 'RiotTagAbstract' && tmpFn.constructor.name !== 'Object') {} else {
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

                    (_self$tagClass = self.tagClass)[prop.name].apply(_self$tagClass, arguments);
                };
            }
        });
        this.tagClass = new fn(this, opts);
    };
    r.tag(name, innerHtml, null, attr, ctx);
};

r.Observable = r.observable;
r.Router = r.route;

exports.default = r;