
var http = require('http')

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
    error: function (error, code) {
        var isError = error instanceof Error

        this.statusCode = code || 500

        if (isError) {
            this.write(error.message)
            this.end(error.stack + '')
        } else {
            this.end('Internal Server Error')
        }
    }
}

Object.keys(properties).forEach(function(property){
    response[property] = properties[property]
})



// function handler(req, res, next) {
//     res.__proto__ = response
//     otherHandler.call(this, req, res)
// }

// function otherHandler(req, res) {
//     if (req.url === '/home') return res.end('hola')
//     res.redirect('/home')
// }
// var ser = http.createServer(handler)

// ser.listen(8010)
module.exports = response