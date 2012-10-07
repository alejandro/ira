
var qs = require('querystring')
  , url = require('url')

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

    req.url = _url.pathname
    req.query = qs.parse(_url.query || '')
    req.body = ''
    req.on('data', function (data){
        req.body += data
    })

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
            if (!match.fn) return ira.error(req, res, '404')
            // Extend the match with the req
            ira._.extend(req, match)

            if (match.fn && match.fn.length) {
                actions = ira._.flatten(match.fn)
                method = actions.pop().toLowerCase() 
            } else if (typeof(match.fn) === 'function') {

                return match.fn.call(match, req, res)
            } else {
                return ira.error(req, res, 404)
            }
        }
        if (method !== reqMethod) return ira.error(req, res, '404')
        if (method.toLowerCase() === reqMethod){
            flow.add(actions)
            flow.resolve(function (req, res, next){
                res.end()
            })
            return true
        } else {
            return ira.error(req, res, '404')
        }
    })
}

module.exports = {
    onIncomingRequest: onIncomingRequest
}