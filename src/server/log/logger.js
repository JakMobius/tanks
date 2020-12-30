const Chalk = require("chalk")
const util = require("util")
const Color = require("/src/utils/color")

class Logger {

	static global = new Logger()

	constructor() {
		this.destinations = []
		this.redirectToGlobal = true
		this.prefix = null
	}

	setPrefix(prefix) {
		this.prefix = "[" + prefix + "] "
	}

	addDestination(destination) {
		this.removeDestination(destination)

		this.destinations.push(destination)
	}

	removeDestination(destination) {
		for (let i = this.destinations.length - 1; i >= 0; i--) {
			if(this.destinations[i].id === destination.id) {
				this.destinations.splice(i, 1)
				break
			}
		}
	}

	static callDestinations(destinations, text) {
		for (let i = destinations.length - 1; i >= 0; i--) {
			destinations[i].log(text)
		}
	}

	static convertChatColors(text) {
		return Color.replace(text, (color, bold, text) => {
			let chalk = bold ? Chalk.bold : Chalk
			if(color) {
				chalk = chalk.hex(color)
			}
			return chalk(text)
		})
	}

	log(text) {

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
}

module.exports = Logger