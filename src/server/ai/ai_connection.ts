
class AIConnection {
	public readyState: any;
	public localHandlers: any;
	public externalHandlers: any;

	constructor() {
		this.readyState = 1
		this.localHandlers = {
			onMessage: null,
			onClose: null
		}

		this.externalHandlers = {}
	}

	tell(value) {
		this._emitExternal("message", [value])
	}

	_emitLocal(evt, args?) {
		const handler = this.localHandlers[evt];
		if(handler) {
			handler.apply(this, args)
		}
	}

	_emitExternal(evt, args?) {
		const handlers = this.externalHandlers[evt];
		if(handlers) {
			for(let handler of handlers) {
				handler.apply(this, args)
			}
		}
	}

	close() {
		this._emitLocal("onClose")
		this._emitExternal("close")
	}

	send(value) {
		this._emitLocal("onMessage", [value])
	}

	on(event, handler) {
		const handlers = this.externalHandlers[event];
		if (handlers) {
			this.externalHandlers[event].push(handler)
		} else {
			this.externalHandlers[event] = [handler]
		}
	}
}

export default AIConnection;