
/*test*/
var fs = require('fs')
var estatic = require('node-static')
var Ira = require('../lib/ira')
var ira = Ira.createApp({})

ira.def('response:error', function ( code, error){
    if (code === 404 && !error) error = new Error('No encontrado')
    this.statusCode = code || 404 
    this.end(error.stack + '\n')
})

ira.def('env:development', {
    db: 'http://dbs.csas'
})


var file = new estatic.Server(__dirname + '/public', {serverInfo: ira.get('ipkg:name')});


ira.def('server:static', function (req, res, next){
    file.serve(req, res, next)
})

ira.def('response:render', function (file, vars){
    fs.readFile(__dirname + '/public/templates/' + file, 'utf8', function (err, fil){
        fil = fil.replace(/<%=([\s\S]+?)%>/g, function(st, match, ind, left){
            match = match.trim()
            if (vars[match]) return vars[match]
            else return void 0
        })
        this.setHeader('Content-Type', 'text/html')
        this.end(fil)
    }.bind(this))
})

ira.for('/').do(function (req, res){
    res.render('index.html.tmpl',{
        title: 'Ira: Web Framework',
        name: 'Ira',
        description: ira.get('pkg:description')
    })
})

ira.for('/hola').do(function (req, res){
    res.end('HOOOOLAAA')
})


ira.listen(8100, function(){
    console.log('[*] IRA: Server listening on', this.address().port)
})
