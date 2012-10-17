/*
 * ira
 * https://github.com/alejandro/ira
 *
 * Copyright (c) 2012 Alejandro Morales
 * Licensed under the MIT license.
 */

'use strict';

// Core libs
var http  = require('http')
  , https = require('https')
  , util  = require('util')
  , path = require('path')
  , EventEmitter = require('events').EventEmitter


var debug

try { debug = require('debug')('http') } 
catch (exc) { debug = function () {}}


// Dependencies

// Define

var Router  = require('./router')
  , Actions = require('./actions')
  , h       = require('./helpers')
  , server  = require('./server')
  , slice   = Array.prototype.slice


function Ira(options) {
    var ira = this, serv, events = {
        request: server.onIncomingRequest,
        'route:new': function (){}
    }

    EventEmitter.call(ira)

    ira.extend = h.bindFirst(ira, util._extend)

    var defaults = {
        actions: [],
        errors:  [],
        data:    []
    }

    ira.extend(defaults)
    ira.extend(options)

    ira._setup()
    
    Object.keys(events).forEach(function (event){
        this.ev(event, events[event].bind(this))
    }.bind(this))
 
    process.nextTick(ira._bind('_setEnv'))
}


Ira.prototype = Object.create(EventEmitter.prototype, {
    constructor: Ira
})

/**
 * Ira.include
 * ------------
 *
 * Shorthand to Ira.prototype.method = ...
 *
 * @param {String|Object} name or object with actions
 * @param {Function} Method
 * @return {Ira.prototype[method]}
 * @api public
*/ 

Ira.include = function (property, action){
    var prop
    if (typeof(property) === 'object') {
        return util._extend(Ira.prototype, property)
    }
    property = property.split('&')
    while (prop = property.shift()) {
        Ira.prototype[prop] = action
    }
    return this
}

Ira.prototype.ev = Ira.prototype.on

/**
 * Ira#createApp
 *
 * Ira is about Apps not Servers
 * so no createServer this time.
 */

Ira.createApp = function createApp(options) {
    return new Ira(options)
}


/**
 * Ira.define
 * Let you define Ira options, or request options
 *
 *   ira.define('env:production', {
 *      prop: 'leas' 
 *   }) -> 'ira'
 *
 *   ira.define('error', function (code, error){
 *      this.statusCode = code  
 *   })
 *
 * @param {String} the name of the defining fn
 * @param {Object|Function} the action
 * @api public
*/

Ira.include('_setup', function (){
    var keys, env = {}, nenv, conf, ira = this, serv, handler
 
    ira.actions = Actions.create()
    ira.called = 0

    handler = ira._bind('_serverHandler')

    // Switch server protocol
    if (ira.spdy) {
        try {
            serv = require('spdy').createServer(https.Server, ira.spdy, handler)
        } catch (e) { throw new Error('Run `npm install spdy` before') }
    }
    else if (ira.https) serv = https.createServer(ira.https, handler)
    else serv = http.createServer(handler)

    // Make it private
    ira._server = serv

    ira.Flow = require('promesas').Flow
    ira._  = require('underscore')
    ira.ipkg = require('../package.json')
    ira.flnm = module.parent.filename
    ira.cwd = ira.flnm.split(path.sep).filter(function (i){ 
                return path.extname(i) === ''
            }).join(path.sep)
    
    // Load the package.json by default
    try {
        ira.pkg = require(path.resolve(ira.cwd, 'package.json'))
        ira.config = require(path.resolve(ira.cwd, 'config.json'))
    } catch (e) { debug('No config or pkg found (%s)', ira.cwd)}
})

Ira.include('_setEnv', function (){
    var keys, env = {}, nenv, conf, ira = this

    if (typeof(ira.env) === 'object') {
        keys = Object.keys(ira.env)
        env = ira._.clone(ira.env)
        nenv = process.env.NODE_ENV
        conf = env.development
    }
    

    ira.env = nenv || 'development'
    if (env[nenv]) {
       conf = env[nenv]
    } else conf = {}

    util._extend(ira.config, conf)     
})

Ira.include('define&def', function (prop, action) {
    var name, value, ira = this

    prop = h.parseProperty(prop)

    if (typeof(prop) === 'object' && !prop.name) {
        return util._extend(ira, prop)
    } else if (typeof(prop) === 'object'){
        name = prop.name
        value = prop.value
        if ('env' === name) process.nextTick(ira._bind('_setEnv'))
        ira[name] = ira[name] || {}
        var key = ira[name]
        if (typeof(value) !== 'object') {
            ira[name][value] = action || {}
            return
        }
        ira[name][value.name] = ira[name][value.name] || {}
        return ira[name][value.name][value.value] = action

    }
    return ira[prop] = action
})

/**
 * Ira.get
 * This is way MORE than what I need but it's pretty special
 * ira.get('pkg:name') -> 'ira'
 * ira.get('pkg') -> the whole package.json file
 * ira.get('/path/to/whatevs') -> Actions (aka callbacks) for /path/to/whatevs
*/

Ira.include('get', function get(path) {
    path = h.parseProperty(path)
    if (typeof(path) === 'object') {
        if (!this[path.name]) return void 0
        if (typeof(path.value) !== 'object') return this[path.name][path.value]
        else {
            if (!this[path.name][path.value.name]) return void 0
            return this[path.name][path.value.name][path.value.value]
        }
    } 
    else if (this[path]) return this[path]
    else return this.actions[this.actions.items[path]]
})



Ira.include({
    'do': function when() {
        // TODO: refactor this, this is ugly
        if (this.called === 1) {
            this.actions.append(this.cuid, slice.call(arguments));
            ++this.called
            return this.next()
        } else if (this.called >= 2) {
            if (this.called !== 3) this.on('GET')
            this.cuid = this.actions.guid()
            this.called = 1
        } else if (this.called === 0) {
            this.cuid = this.actions.guid(); // jshint ;_;
            ++this.called
        }
        this.actions.add(this.cuid, [slice.call(arguments)])
        return this.next()
    },
    'for': function (route) {  

        if (this.called > 2 || this.called === 0) {
            if (this.called >= 2) this.on('GET')
            this.cuid = route
            this.actions.add(this.cuid, [])
            this.called = 1
        }  else if (this.called >= 1) {
                        
            if (this.called >= 2) {
                this.on('GET')
                return this.for(route)
            }

            this.actions.change(this.cuid, route)
            this.cuid = route
            ++this.called
        }
        this.emit('route:new', route)
        return this.next()
    },
    /* I should probably start thinking in a new API */
    on: function on(methods) {

        if (this.called >= 2) {
            this.actions.append(this.cuid, methods)    
            this.called = 0
            return
        } else {
            throw new Error('Can\'t do that bro')
        }

    },
    next: function next() {
        return { 
            on: this._bind('on'),
            do: this._bind('do'),
            for: this._bind('for')
        }
    },
    listen: function listen() {
        if (this.called === 2) {
            this.on('GET')
        }
        this.router()
        this._server.listen.apply(this._server, arguments)
    },
    _bind: function (property){
        return this[property].bind(this)
    },
    _serverHandler: function (req, res) {
        this._startTime = +new Date
        this.emit('request', req, res, true)
    },
    router: function (){
        this._routes = Router.defineRoutes(this.actions)
    }
})


module.exports = Ira
