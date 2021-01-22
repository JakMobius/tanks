
class ArgumentParser {

    static trimLastArgument(line: string, keepQuotes: boolean) {
        let escape = false
        let quoteSymbol = null
        let comment = null
        let argument = ""
        let result = ""

        for(let character of line) {

            if(comment) {
                if(character === "\n") comment = false
                continue
            }

            if (escape) {
                argument += character
            } else {
                if (character === "\\") {
                    argument += character
                    escape = true
                    continue
                }

                if (character === "#") {
                    result += character
                    comment = true
                    continue
                }

                if (quoteSymbol === null) {
                    if (character === "\"" || character === "\'") {
                        quoteSymbol = character
                        if(keepQuotes) {
                            result += character
                        }
                        result += argument
                        argument = ""
                        continue
                    }
                } else if(character == quoteSymbol) {
                    if(!keepQuotes) {
                        result += character
                    }
                    result += argument
                    result += character
                    argument = ""
                }

                if (character === " " && !quoteSymbol) {
                    if (argument) {
                        result += argument
                        argument = ""
                    }
                    result += character
                    continue
                }
            }

            argument += character

            escape = false
        }

        return result
    }

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
                        result.push(argument)
                        argument = ""
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
                argument += character
            }

            escape = false
        }

        result.push(argument)

        return result
    }
}

export default ArgumentParser;