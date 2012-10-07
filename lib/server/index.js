


var qs = require('querystring')
  , url = require('url')

var request = require('./req')
  , response = require('./resp')

function Server(options) {

}

Server.prototype.onRequest = function(req, resp /*, auth*/) {
    
}

function onIncomingRequest(req, res, handler) {
    var actions, method, action, match
      , reqMethod = req.method.toLowerCase()
      , ira  = this
      , flow = this.Flow.create({
            next: next,
            args: [req, res],
            checkErrors: true
        })
      , _url = url.parse(req.url)


    res.setHeader('X-Powered-By', ira.get('pkg:name') + '/' + ira.get('pkg:version'))
    // Override the error response in case that the user defined a new one
    if (ira.error) response.error = ira.error
    // Extend the request&response methods
    ira._.extend(req.__proto__, request)
    ira._.extend(res.__proto__, response)


    // Extending Promesas#Flow with custom looper
    function next (error, data) {
        var args = this.args.concat([next.bind(this)])
          , fns = this._fns

        ira.errors.push(error)
        ira.data.push(data)

        this.called = this.total - fns.length

        if (!fns.length) throw new Error('WHATTT!')
        if (fns.length === 1 || (error && this.checkErrors)) {
            this.emit('_end')
            clearTimeout(this._timeout)
            return fns.pop().apply(this.ctx, [ira.errors, ira.data])
        } else {
            if (req.finished) {
                this.emit('_end')
                return clearTimeout(this._timeout)
            }
            this.emit('_progress')
            fns.shift().apply(this.ctx, args)    
        }
    }

    flow.once('timeout', function (){
        if (!res.finished) {
            try {
                res.statusCode = 417
                res.end('Expectation Failed')
            } catch (exc) {}
        }
        flow.destroy()
    })
    req.once('end', function (){
        try {
            req.body = JSON.parse(JSON.stringify(req.body))
        } catch (ex) {}
        

        if (req.url === '/') {
            actions = ira._.flatten(ira.get('/'))
            method = actions.pop().toLowerCase()
        } else {
            match = ira._routes.match(req.url)
            if (!match.fn) return res.error(404)
            // Extend the match with the req
            ira._.extend(req, match)

            if (match.fn && match.fn.length) {
                actions = ira._.flatten(match.fn)
                method = actions.pop().toLowerCase() 
            } else if (typeof(match.fn) === 'function') {

                return match.fn.call(match, req, res)
            } else {
                return res.error(404)
            }
        }
        if (method !== reqMethod) return res.error(404)
        else {
            flow.add(actions)
            flow.resolve(function (req, res, next){
                res.end()
            })
            return true
        } 
    })
}

module.exports = {
    onIncomingRequest: onIncomingRequest
}