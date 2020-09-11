
let cache = {
    vertex: null,
    fragment: null
}

module.exports = function(vertex){

    let key = vertex ? "vertex" : "fragment"

    if(!cache[key]) {
        const resolve = require.resolve('./glsl-optimizer-asm')
        delete require.cache[resolve]
        return cache[key] = require('./glsl-optimizer-asm').cwrap('optimize_glsl', 'string', ['string', 'number', 'number'])
    } else {
        return cache[key]
    }


};
