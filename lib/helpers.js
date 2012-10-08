/*
 Helpers
 -------
 */

function bindFirst(wat, wit, ctx) {
    if (!ctx) ctx = wat
    return wit.bind(wat, ctx)
}


/**
 * "ev:pr" -> {ev: pr}
 * "ev:pro:eas" -> {ev: { pr : eas }}
*/
function parseProperty(str) {

    var words = str.split(':')
      , res = {}
      , word = words[0]
    if (words.length === 1) return str
    else if (words.length === 2) res.name = word, res.value = words[1]
    else {
        res.name = word
        res.value = {}
        res.value.name = words[1]
        res.value.value = words[2]
    }
    
    return res
}




module.exports = {
    bindFirst: bindFirst,
    parseProperty: parseProperty
}