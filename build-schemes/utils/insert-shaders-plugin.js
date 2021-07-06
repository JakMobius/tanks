
module.exports = (config) => {
    return {
        "plugin": "json-comment-replacer",
        "replacements": [{
            "comment": "@shader-loader-placeholder",
            "file": config.file
        }]
    }
}