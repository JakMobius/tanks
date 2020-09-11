
class Logger {

	static global = new Logger()

	constructor() {
		this.destinations = []
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

	log(text) {
		if(text instanceof Error) {
			let error = text
			text = error.stack
		}
		if(typeof text == "number") {
			text = String(text)
		}
		if(typeof text == "object") {
			text = String(text)
		}
		if(typeof text == "undefined") {
			text = "undefined"
		}
		if(typeof text == "function") {
			text = text.toString()
		}
		if(typeof text == "string") {
			for (let i = this.destinations.length - 1; i >= 0; i--) {
				this.destinations[i].log(text)
			}
		}
	}
}

module.exports = Logger