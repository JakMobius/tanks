const constants = require("./constants");
module.exports = {
    copy: function(source, target) {
        return {
            action: "copy",
            source: source,
            target: target
        }
    },
    delete: function(target) {
        return {
            action: "delete",
            target: target
        }
    },
    bundleJavascript: function(source, target, options) {
        return {
            action: "bundle-javascript",
            source: source,
            target: target,
            ...options
        }
    },
    requireTarget: function(target){
        return {
            action: "require-target",
            target: target
        }
    }
}