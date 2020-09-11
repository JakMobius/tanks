// Native
const fs = require('fs');

// Vendor
const deparser = require('glsl-deparser');
const minify = require('glsl-min-stream');
const parser = require('glsl-parser');
const tokenizer = require('glsl-tokenizer/stream');
const stringToStream = require('string-to-stream');

// Optimizer
const optimizer = require('./optimizer');

const optimize = (inputSource, isVertexShader) => {

    const optimizedSourceCode = optimizer(isVertexShader)(inputSource, 100, isVertexShader);

    if (optimizedSourceCode.includes('Error:')) {
        console.error(optimizedSourceCode);
        console.error('Exiting glsl-minifier!');
        process.exit(-1);
    }

    function handleError(where, error) {
        console.error(where + " failure!")
        console.error(error)
        process.exit(-1)
    }

    return new Promise(function(resolve) {
        let result = ""
        stringToStream(optimizedSourceCode)
            .pipe(tokenizer())
            .on('error', error => handleError('Tokenizer', error))
            .pipe(parser())
            .on('error', error => handleError('Parser', error))
            .pipe(minify())
            .on('error', error => handleError('Minify', error))
            .pipe(deparser(false))
            .on('error', error => handleError('Deparser', error))
            .on('data', (data) => result += data)
            .on('end', () => resolve(result))
    })
}

module.exports = optimize
