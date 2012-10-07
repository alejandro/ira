/*
 * ira
 * https://github.com/alejandro/ira
 *
 * Copyright (c) 2012 Alejandro Morales
 * Licensed under the MIT license.
 */

//'use strict';

// Core libs
var http  = require('http')
  , https = require('https')
  , util  = require('util')
  , EventEmitter = require('events').EventEmitter

global.debug = void 0

try { debug = require('debug')('http') } 
catch (exc) { debug = function () {}}


// Dependencies

// Define

var Router      = require('./router')
  , QueryParser = require('./qs.parser')
  , Actions     = require('./actions')
  , h           = require('./helpers')
  , server      = require('./server')
  , slice       = Array.prototype.slice

// Others
var extend = util._extend





function Ira(options) {
    var ira = this;

    ira.extend = h.bindFirst(ira, util._extend)

    var defaults = {
        actions: []
    }

    ira.extend(defaults)
    ira.extend(options)
    ira.actions = Actions.create()
    ira.called = 0
    ira._server = http.createServer(ira._bind('_serverHandler'))
    ira.define = function (property, action) {
        if (typeof(property) === 'object') {
            return util._extend(ira, property)
        }
        return ira[property] = action
    }

    ira.Flow = require('promesas').Flow
    ira._  = require('underscore')
    ira.errors = []
    ira.data = []
    var events = { request: server.onIncomingRequest}
    Object.keys(events).forEach(function (event){
        this.ev(event, events[event].bind(this))
    }.bind(this))
}

util.inherits(Ira, EventEmitter)

// Shorthand
Ira.include = function (property, action){
    if (typeof(property) === 'object') {
        return util._extend(Ira.prototype, property)
    }
    return Ira.prototype[property] = action
}

Ira.prototype.ev = Ira.prototype.on


Ira.createServer = function createServer(options) {
    return new Ira(options)
}

Ira.include('get', function get(path) {
    return new Array(this.actions[this.actions.items[path]])
})

Ira.include({
    do: function when() {

        if (this.called === 1) {
            this.actions.append(this.cuid, slice.call(arguments))    
            ++this.called
            return this.next()
        } else if (this.called >= 2) {
            if (this.called !== 3) this.on('GET')
            this.cuid = this.actions.guid()
            this.called = 1
        } else if (this.called === 0) {
            this.cuid = this.actions.guid()
            ++this.called
        }
        this.actions.add(this.cuid, [slice.call(arguments)])
        return this.next()
    },
    for: function route(route) {  

        if (this.called > 2 || this.called == 0) {
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
        
        return this.next()
    },
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
    listen: function listen(port, cb) {
        
        if (this.called === 2) {
            this.on('GET')
        }
        this.router()
        this._server.listen(8100, cb || function (){
            console.log('_server')
        })
    },
    _bind: function (property){
        return this[property].bind(this)
    },
    _serverHandler: function (req, res) {
        this.emit('request', req, res, true)
    },
    error: function(req, res, error) {
        res.statusCode = 404
        res.end('404 ERROR')
    }
})


Ira.prototype.router = function (){
    this._routes = Router.defineRoutes(this.actions)
}
module.exports = Ira
