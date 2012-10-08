
/**
 * mapleTree is the default Router for Ira
 */
'use strict';

var mapleTree = require('mapleTree') 
  , router = new mapleTree.RouteTree({'fifo' : false })


function Router(routes) {
    var ro = routes.items, ind
    Object.keys(ro).forEach(function (item){
        ind = ro[item]
        router.define(item, routes[ind])
    })
    return router
}

module.exports = {
    defineRoutes: Router
}
