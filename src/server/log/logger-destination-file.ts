
import LoggerDestination from './logger-destination';
import fs from 'fs';

class LoggerDestinationFile extends LoggerDestination {
	public stream: any;

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

export default LoggerDestinationFile;