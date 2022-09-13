import Connection from "../../networking/connection";
import TypedEventHandler from "../../utils/typed-event-handler";
import Entity from "../../utils/ecs/entity";

export interface SocketPortalClientConfig<DataClass> {
	data: DataClass
	connection: Connection
}

export default class SocketPortalClient<DataClass = any> extends TypedEventHandler {
	static globalId = 0

	id: number
	data: DataClass
	connection: Connection

	game: Entity = null

	constructor(config?: SocketPortalClientConfig<DataClass>) {
		super()
		this.id = SocketPortalClient.globalId++
		this.data = config.data
		this.connection = config.connection
	}
}