/*
  Request methods
 */

'use strict';

var http = require('http')
  , url = require('url')
  , qs  = require('querystring')

var request = {
    __proto__: http.IncomingMessage.prototype
}


request.get = function (wat) {
    if (!wat) return ''
    return this.headers[wat.toLowerCase()]
}

var properties = {

    auth:  function (){
        var auth = this.get('authorization')
        if (!auth) return {}

        auth = auth.split(' ')[1]
        if (!auth) return {}


        auth = new Buffer(auth, 'base64').toString().split(':')
        return {
            username: auth[0],
            password: auth[1]
        }

    },
    subdomains: function (){
        return this.get('host')
            .split('.')
            .slice(0, -2)
    },
    url:  function (){
        return this.path().pathname
    },
    path: function (){
        return url.parse(this)
    },
    host: function(){
        return this.get('host').split(':')[0]
    },

    xhr: function(){
        var val = this.get('X-Requested-With') || ''
        return val.toLowerCase() == 'xmlhttprequest'
    },
    query: function (){
        return qs.parse(this.path().query || '')
    }
}

Object.keys(properties).forEach(function(property){
    Object.defineProperty(request, property, {
        get: properties[property],
        enumerable: true
    })
})


module.exports = request
