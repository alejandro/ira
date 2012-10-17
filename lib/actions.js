/** 
 * Actions
 * Silly array-like object, with prepend, append, change, methods
*/
'use strict';

module.exports = Actions

function Actions() {
    var defaultFor_latest
    Object.defineProperties(this, {
        items: {
            value : {}
        },
        _latest: {
            get: function () {
                return defaultFor_latest
            },
            set: function (val) {
                defaultFor_latest = val
                return true
            }
        }
    })
}


Actions.create = function (){
    return new Actions()
}
// Actions is an Array
Actions.prototype = Object.create(Array.prototype, {
    constructor: Actions 
})

Actions.prototype._push = Actions.prototype.push

Actions.prototype.push = void 0

Actions.prototype.add = function(guid, item /*, ...items*/) {
    if (arguments.length < 2) item = guid, guid = this.guid
    this.items[guid] = this.length
    this._latest = guid
    this._push(item)
}
Actions.prototype.get = function(id) {
    if (this.items[id]) return this[this.items[id]]
    else return this[this.items[this.latest]]
}

Actions.prototype.__defineGetter__('latest',function (){
    return this._latest
})

Actions.prototype.guid = function (){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

Actions.prototype.rename =
Actions.prototype.change = function (id, to) {
    if (this.items[id] || this.items[id] === 0) {
        this.items[to] = this.items[id]; // jshint ;_;
        delete this.items[id]
        this._latest = to
        return true
    }
    throw new Error(id + ' is not in the list')
}

Actions.prototype.append = function (id, item) {
    var current, position

    if (this.items[id] || this.items[id] === 0) {
        position = this.items[id]
        current =  this[position]
        if (!Array.isArray(current)) {
            current = [current, item]
        } else current.push(item)
        
        this[position] = current
        return true
    }
    throw new Error(id + ' is not in the list')   
}

Actions.prototype.prepend = function (id, item) {
    var current, position
    if (this.items[id] || this.items[id] === 0) {
        position = this.items[id]
        current =  this[position]
        if (!Array.isArray(current)) {
            current = [item, current]
        } else current = [item].concat(current)
        
        this[position] = current
        return true
    }
    throw new Error(id + ' is not in the list')   
}

Actions.prototype.valid = function () {
    var valid = Object.keys(this.items).map(function(item) {
        return this.items[item]
    }.bind(this))
    
    return this.filter(function(item, index){
        return valid.indexOf(index) > -1
    })
}