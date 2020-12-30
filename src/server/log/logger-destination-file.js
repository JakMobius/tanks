
const LoggerDestination = require("./logger-destination")
const fs = require("fs")

class LoggerDestinationFile extends LoggerDestination {
    constructor(file) {
        super();
        this.stream = fs.createWriteStream(file)
    }

    log(text) {
        this.stream.write(text)
    }

    close() {
        this.stream.close()
    }
}

module.exports = LoggerDestinationFile