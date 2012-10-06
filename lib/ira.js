/*
 * ira
 * https://github.com/alejandro/ira
 *
 * Copyright (c) 2012 Alejandro Morales
 * Licensed under the MIT license.
 */

'use strict';

// Core libs
var http = require('http')
  , https = require('https')
  , util = require('util')

// Define

var Router = require('./router')
  , QueryParser = require('./qs.parser')

// Others
var extend = util._extend

function bindFirst(wat, wit, ctx) {
    if (!ctx) ctx = wat
    return wit.bind(wat, ctx)
}

function Ira(options) {
    this.extend = bindFirst(this, util._extend)
    this.include = bindFirst(Ira.prototype, util._extend )

}

var f = new Ira()

f.include({
    get: function () {
        return this
    }
})

console.log(f.get())

extend(exports, {
    createServer: http.createServer    
})
