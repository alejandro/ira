

function bindFirst(wat, wit, ctx) {
    if (!ctx) ctx = wat
    return wit.bind(wat, ctx)
}


module.exports = {
    bindFirst: bindFirst
}