
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

	tell(value: any) {
		this._emitExternal("message", [value])
	}

	_emitLocal(evt: string, args?: string[]) {
		const handler = this.localHandlers[evt];
		if(handler) {
			handler.apply(this, args)
		}
	}

	_emitExternal(evt: string, args?: string[]) {
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

	send(value: string) {
		this._emitLocal("onMessage", [value])
	}

	on(event: string | number, handler: () => void) {
		const handlers = this.externalHandlers[event];
		if (handlers) {
			this.externalHandlers[event].push(handler)
		} else {
			this.externalHandlers[event] = [handler]
		}
	}
}

export default AIConnection;