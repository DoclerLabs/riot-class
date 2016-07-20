import riot from 'riot'

export default class TagAbstract {
    constructor(tag, options){
        riot.observable(this)
        this.tag     = tag
        this.options = options

        this.onMount && this.tag.on('mount', this.onMount.bind(this))
        this.onBeforeMount && this.tag.on('before-mount', this.onBeforeMount.bind(this))
        this.onUnMount && this.tag.on('unmount', this.onUnMount.bind(this))
        this.onBeforeUnMount && this.tag.on('before-unmount', this.onBeforeUnMount.bind(this))
        this.onUpdate && this.tag.on('update', this.onUpdate.bind(this))
        this.onUpdated && this.tag.on('updated', this.onUpdated.bind(this))
    }
}

/**
 * Register a riot tag.
 * @param html {string}   Template code
 * @param fn   {function} Context of the tag
 * @constructor
 */
export function RegisterTag(html, fn = function(){}){
    html = html.trim()
    let innerHtml = html.match(/<(.*?)>([\s\S]*?)(<\/\1>)(?![\s\S])/)[2].trim()
    let tag       = html.match(/<.*?>/m)[0]
    let name      = tag.match(/<(.*?)(>| )/m)[1]
    let attr      = tag.match(/<.*? (.*?)>/m)
    let api       = []
    let tmpFn     = fn
    attr = attr ? attr[0] : undefined

    do {
        Object.getOwnPropertyNames(tmpFn.prototype).forEach((prop) => {
            if (
                typeof prop === 'string'
                && api.findIndex(v => v.name === prop) === -1
                && prop !== 'constructor'
                && prop.charAt(0) !== '_'
            ){
                let descriptor = Object.getOwnPropertyDescriptor(tmpFn.prototype, prop)

                api.push({
                    name: prop,
                    type: descriptor.get ? 'var' : 'fn'
                })
            }
        })

        tmpFn = tmpFn.__proto__

        if (
            tmpFn.prototype
            && tmpFn.constructor
            && tmpFn.constructor.name !== 'RiotTagAbstract'
            && tmpFn.constructor.name !== 'Object'
        ) {}
        else {
            tmpFn = false
        }
    } while (tmpFn)

    let ctx = function Context(opts){
        var self = this
        api.forEach(prop => {
            if (prop.type === 'var') {
                Object.defineProperty(self, prop.name, {
                    get: function(){
                        return self.tagClass[prop.name]
                    },
                    set: function(v){
                        return self.tagClass[prop.name] = v
                    }
                })
            }
            else {
                self[prop.name] = function(...args){
                    return self.tagClass[prop.name](...args)
                }
            }
        })
        this.tagClass = new fn(this, opts)
    }
    riot.tag(name, innerHtml, null, attr, ctx)
}

export { riot as riot }