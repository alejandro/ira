
/*test*/
var fs = require('fs')
var Ira = require('../lib/ira')
var ira = Ira.createApp({})

// Error is an instance of ServerResponse, so res#* is imply on "this"

ira.define('error', function ( code, error){
    if (code === 404 && !error) error = new Error('No encontrado')
    this.statusCode = code || 404 
    this.end(error.stack + '\n')
})

ira.define('env:production', function (conf){
    conf.use('favicon')
})


ira.for('/').do(function (req, res){
    var st = fs.createReadStream(__dirname + '/index.html')
    st.on('error', function (){
        res.end('ERROR')
    })
    st.pipe(res)
})


ira.listen(8100, function(){
    console.log('[*] IRA: Server listening on', this.address().port)
})
