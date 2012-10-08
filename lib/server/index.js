

'use strict';

var request = require('./req')
  , response = require('./resp')


function onIncomingRequest(req, res) {
    /*jshint validthis:true*/

    var actions, method, match, server = {}
      , reqMethod = req.method.toLowerCase()
      , ira  = this
      , flow = ira.Flow.create({
            next: next,
            args: [req, res],
            checkErrors: true
        })
      , _ = ira._



    res.setHeader('X-Powered-By', ira.get('pkg:name') + '/' + ira.get('pkg:version'))
    // Override the error response in case that the user defined a new one
    if (ira.error) response.error = ira.error

    if (ira.response) {
        _.keys(ira.response).forEach(function(item){
            response[item] = ira.response[item]
        })
    }

    if (ira.request) {
        _.keys(ira.request).forEach(function(item){
            request[item] = ira.request[item]
        })
    }
    // Extend the request&response methods
    req.__proto__ = request
    res.__proto__ = response
    
    req.body = ''
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

    req.on('data', function (data){
        req.body += data
    })

    server.next = function () {
        if (req.url === '/') {
            actions = _.flatten(ira.get('/'))
            method = actions.pop().toLowerCase()
        } else {
            match = ira._routes.match(req.url)
            if (!match.fn) return res.error(404)
            // Extend the match with the req
            _.extend(req, match)

            if (match.fn && match.fn.length) {
                actions = _.flatten(match.fn)
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
            flow.resolve(function (req, res){
                res.end()
            })
            return true
        }
    }

    req.once('end', function (){
        try {
            req.body = JSON.parse(req.body)
        } catch (ex) {}
        
        if (ira.server.static) {
            ira.server.static(req, res, function (error, data) {
                if (!error) return res.end()
                if (error.status !== 404) return res.end(error.message)
                server.next()
            })
        } else server.next()
    })
}

module.exports = {
    onIncomingRequest: onIncomingRequest
}