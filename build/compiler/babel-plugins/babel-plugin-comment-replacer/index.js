
function getReplacement(api, options) {

    let objectProperties = []

    for(let [key, value] of Object.entries(options.object)) {
        objectProperties.push(api.types.objectProperty(
            api.types.stringLiteral(key),
            api.types.stringLiteral(value)
        ))
    }

    return api.types.assignmentExpression("=",
        api.types.memberExpression(
            api.types.identifier("module"),
            api.types.identifier("exports")
        ),
        api.types.objectExpression(objectProperties)
    )
}

function replaceComments(api, options, path, commentList, replaced, isTrailing) {
    if(!commentList) return null;

    let outputComments = []

    for(let comment of commentList) {
        if (comment.value.trim() === options.replace) {
            if(replaced.indexOf(comment) === -1) {
                let replacement = getReplacement(api, options)
                if (isTrailing) {
                    path.insertAfter(replacement)
                } else {
                    path.insertBefore(replacement)
                }
                replaced.push(comment)
            }
        } else {
            outputComments.push(comment)
        }
    }

    return outputComments
}

function handleProgram(api, options, path) {
    try {
        let replaced = []
        path.traverse({
            enter(path) {
                path.node.leadingComments = replaceComments(api, options, path, path.node.leadingComments, replaced, false);
                path.node.trailingComments = replaceComments(api, options, path, path.node.trailingComments, replaced, true);
            },
        })
    } catch(error) {
        console.error(error)
    }
}

module.exports = function commentReplacer(api, options) {
    return {
        visitor: {
            Program(path) {
                handleProgram(api, options, path)
            }
        },
    };
}