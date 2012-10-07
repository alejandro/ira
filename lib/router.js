var mapleTree = require('mapleTree') 
  , router = new mapleTree.RouteTree({'fifo' : false })


function Router(routes, cb) {
    var ro = routes.items
    Object.keys(ro).forEach(function (item){
        var ind = ro[item]
        router.define(item, routes[ind])
    })
    return router
}

module.exports = {
    defineRoutes: Router
}

// var i = [
// '/',
// '/get/pedro',
// '/get/alejo/'
// ]
// router.define(i[0], [function (){
//     debug('OJAS---')
//     this.next()
// }, function(){
//     debug('OJAS---')
//     this.next()
// }])

// var match = router.match('/')

// debug(match)