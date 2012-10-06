var ira = require('../lib/ira')
  , server = ira.createServer()

server['post'] = server.when = function (){
    console.log(arguments.callee.caller)
}

server.add = function () {
    return {
        for: function () {
            return {
                on: function () {}
            }
        }
    }
}
function before(req, res) {

}

function action(req, res) {

}
function onError(req, res) {

}


server
  .when('/', {
    methods: ['POST!'],
    before: before,
    action: action,
    error: onError
  })

server.post('/', before, action, onError)


server.add(before, action, onError)
      .for('/')
      .on('GET','POST')
