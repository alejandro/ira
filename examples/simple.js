
/*test*/
var Ira = require('../lib/ira')
var ira = Ira.createServer()

function before(req, res, next) {
    console.log('BEFORE')
    next()
}

function after(req, res) {
       console.log('AFTER')
    res.end('ok')
}

// Error is an instance of ServerResponse, so res#* is imply on "this"

// ira.define('error', function (error, code){
//     this.statusCode = 500
//     this.end('...................ERROR...................')
// })

ira.for('/')
    .do(function (req, res){
        console.log('here')
        res.end('Welcome to Ira. Yet another web framework')
    })


ira.for('/hi/:mundo')
   .do(before, function (req, res){

        res.end('OK')
    })



ira.do(after, before).for('/his/:lul')
ira.for('/_get').do(before).on('PUT')
ira.do(after, before).for('/his/pedro/:l_ul')
ira.for('/get').do(after, before).on('PUT')

ira.for('/get/:id').do(function(req, res){
    console.log('BODY', req.body.a)
    res.end('OK---' + req.params.id)
}).on('POST')



ira.listen(8100)
