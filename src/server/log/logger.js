
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
		for (let i = this.destinations.length - 1; i >= 0; i--) {
			this.destinations[i].log(text)
		}
	}
}

module.exports = Logger