
class ArgumentParser {

    static parseArguments(line: string, keepQuotes = false) {
        let escape = false
        let quoteSymbol = null
        let comment = null
        let argument = ""
        let result = []

        for(let character of line) {

            if(comment) {
                if(character === "\n") comment = false
                continue
            }

            if (escape) {
                argument += character
            } else {
                if (character === "\\") {
                    escape = true
                    continue
                }

                if (quoteSymbol === null) {
                    if (character === "\"" || character === "\'") {
                        quoteSymbol = character
                        if (keepQuotes) argument += character
                        continue
                    }
                } else {
                    if (character === quoteSymbol) {
                        if (keepQuotes) argument += character
                        quoteSymbol = null
                        continue
                    }
                }

                if (character === "#") {
                    comment = true
                    continue
                }

                if (character === " " && !quoteSymbol) {
                    if (argument) {
                        result.push(argument)
                        argument = ""
                    }
                    continue
                }
            }

            argument += character

            escape = false
        }

        result.push(argument)

        return result
    }
}

export default ArgumentParser;