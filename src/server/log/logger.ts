import Chalk from 'chalk';
import util from 'util';
import Color from 'src/utils/color';
import LoggerDestination from "./logger-destination";

class Logger implements LoggerDestination {
	public destinations: LoggerDestination[] = []
	public redirectToGlobal: boolean = true
	public prefix: string = null
	static global = new Logger()

	constructor() {

	}

	setPrefix(prefix: string) {
		this.prefix = "[" + prefix + "] "
	}

	addDestination(destination: LoggerDestination) {
		this.removeDestination(destination)

		this.destinations.push(destination)
	}

	removeDestination(destination: LoggerDestination) {
		for (let i = this.destinations.length - 1; i >= 0; i--) {
			if(this.destinations[i] === destination) {
				this.destinations.splice(i, 1)
				break
			}
		}
	}

	static callDestinations(destinations: LoggerDestination[], text: string) {
		for (let i = destinations.length - 1; i >= 0; i--) {
			destinations[i].log(text)
		}
	}

	static convertChatColors(text: string) {
		return Color.replace(text, (color, bold, text) => {
			let chalk = bold ? Chalk.bold : Chalk
			if(color) {
				chalk = chalk.hex(color)
			}
			return chalk(text)
		})
	}

	log(text: any) {

		if(typeof text == "string") {
			text = Logger.convertChatColors(text)
		} else {
			text = util.inspect(text, {
				depth: 0,
				colors: true
			})
		}

		if(this.prefix) text = this.prefix + text

		if(this.redirectToGlobal) {
			Logger.callDestinations(Logger.global.destinations, text)
		} else {
			Logger.callDestinations(this.destinations, text)
		}
	}

	close(): void {
	}
}

export default Logger;