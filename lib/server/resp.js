'use strict';

var http = require('http')

/**
 * ServerResponse as a constructor of response
 * ht. tj
*/
var response = {
    __proto__: http.ServerResponse.prototype
}

var properties = {
    render: function() {

    },
    redirect: function (url){
        this.statusCode = 302
        this.setHeader('location', url)
        this.end(this.statusCode + ' Moved Temporaly. Redirecting to ' + url)
    },
    error: function (code, error) {
        if (code === 404 && !error) error = new Error('Not Found')
        var isError = error instanceof Error

        this.statusCode = code || 500

        if (isError) {
            this.end(error.stack + '\n')
        } else {
            this.end('Internal Server Error')
        }
    }
}

Object.keys(properties).forEach(function(property){
    response[property] = properties[property]
})

module.exports = response