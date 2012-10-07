var assert = require('assert')
var Actions = require('../lib/actions')
var actions = new Actions

var i = 1
var nested = [2, 3, [1, 3]]
var mixed = ['mundo'].concat(nested)

mixed.push('mundo')

actions.add(i, 'alejo')
actions.add(++i, {})
actions.add(++i, [{a:1}])
actions.add(++i, 21)
actions.add(++i, true)
actions.add(++i, undefined)
actions.add(++i, function test(){})


assert.equal(actions.latest, i, 'Latest should be ' + i)

actions.add(nested)

assert.ok(actions[0], 'It should act like an array')
assert.ok(actions.length, 'It should act like an array')
assert.ok(actions.forEach, 'It should act like an array')
assert.notEqual(actions.latest, i, 'Latest should now be a guid-style string')
assert.deepEqual(actions.get(actions.latest), nested, 'Should retrieve the latest added object')
assert.equal(typeof(actions.get(i)), 'function', 'The i element is function test')
assert.deepEqual(actions.get(), nested, 'Should do the same as above')
assert.ok(actions.rename(actions.latest, 'hola'))
assert.ok(actions.append(actions.latest, 'mundo'))
assert.ok(actions.prepend(actions.latest, 'mundo'))
assert.deepEqual(actions[7], mixed, 'It should prepend and append as expected')
console.log('All ok!')