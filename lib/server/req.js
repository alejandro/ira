
/*
  Request methods
 */

var http = require('http')
  , url = require('url')
  , qs  = require('querystring')

var request = {
    __proto__: http.IncomingMessage.prototype
}


var properties = {
    body: '',
    get: function (wat) {
        return this.headers[wat.toLowerCase()]
    },
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
        return this.get('host').split(':')[0];
    },

    xhr: function(){
        var val = this.get('X-Requested-With') || '';
        return 'xmlhttprequest' == val.toLowerCase();
    },
    query: function (){
        return qs.parse(this.path().query || '')
    }
}
    
request.on('data', function (data){
    request.body += data
})

Object.keys(properties).forEach(function(property){
    request[property] = properties[property]
})


exports = request

// function handler(req, res, next) {
//     req.__proto__ = request
//     res.__proto__ = response
//     otherHandler.call(this, req, res)
// }

// function otherHandler(req, res) {
//     console.log(req.auth)
//     res.end('ok')
// }
// var ser = http.createServer(handler)

// ser.listen(8010)