const WebSocketServer = require('ws')
const GameClient = require("./client")
const BinaryPacket = require("../networking/binarypacket")

const RoomListRequestPacket = require("../networking/packets/roomlistrequestpacket")
const RoomListPacket = require("../networking/packets/roomlistpacket")
const PlayerRoomRequestPacket = require("../networking/packets/playerroomrequestpacket")
const PlayerRoomChangePacket = require("../networking/packets/playerroomchangepacket")

const Logger = require("./log/logger")
const Preferences = require("./preferences/preferences")

class GameSocket {

    /**
     * @type {Map<string, Room>}
     */
    games = new Map()
    /**
     * @type {Map<number, GameClient>}
     */
    clients = new Map()
    /**
     * @type {string[]}
     */
    banned = []
    /**
     * @type {Logger}
     */
    logger = new Logger()

    constructor(config) {

        this.config = config || {}
        this.setupRoomsUpdate()
    }

    setupRoomsUpdate() {
        this.roomsInterval = setInterval(() => this.updateRooms(), 1000)
    }

    stopRoomUpdate() {
        clearInterval(this.roomsInterval)
    }

    updateRooms() {
        if(this.clients.size === 0) {
            return
        }

        let packet = new RoomListPacket(Array.from(this.games.values()))

        for(let client of this.clients.values()) {
            if(client.data["listeningForRooms"]) {
                packet.sendTo(client)
            }
        }
    }

    terminate() {
        this.logger.log("Closing server...")
        this.stopRoomUpdate()
        for (let client of this.clients.values()) {
            client.connection.close()
        }
        this.webSocketServer.close()
    }

    connect(client, game) {

        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
        }

        this.logger.log("Клиент " + client.id + " подключен к игре " + game.name)

        game.clientConnected(client)
        client.game = game
    }

    /**
     * @param client {GameClient}
     * @param game {Room}
     */

    configureClient(client, game) {
        this.clients.set(client.id, client)
        this.connect(client, game)

        const self = this;

        client.connection.on('message', (body) => {
            try {
                if(!(body instanceof Buffer)) {
                    Logger.global.log("Received invalid packet from client " + client.id)
                    if (body.constructor) {
                        Logger.global.log("Binary message expected, " + body.constructor.name + " received.")
                    } else {
                        Logger.global.log("Binary message expected, " + String(body) + " received.")
                    }
                }

                let decoder = BinaryPacket.binaryDecoder
                decoder.reset()
                decoder.readData(new Uint8Array(body).buffer)
                let packet = BinaryPacket.deserialize(decoder, BinaryPacket)

                if(packet instanceof RoomListRequestPacket) {
                    client.data["listeningForRooms"] = packet.request;
                } else if(packet instanceof PlayerRoomRequestPacket) {
                    const room = self.games.get(packet.room);

                    if (room) {
                        if(room.clients.size >= room.maxOnline) {
                            PlayerRoomChangePacket.deny(
                                packet.room,
                                "Эта комната переполнена"
                            ).sendTo(client)
                        } else {
                            PlayerRoomChangePacket.allow(room.name).sendTo(client)
                            this.connect(client, room)
                        }
                    } else {
                        PlayerRoomChangePacket.deny(
                            packet.room,
                            "Такой комнаты не существует. Возможно, она была закрыта"
                        ).sendTo(client)
                    }
                }
                if(packet) client.game.clientMessage(client, packet)
            } catch(e) {
                Logger.global.log(e)
            }
        })

        client.connection.on('close', function() {
            self.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
            self.clients.delete(client.id);
        });
    }

    onConnection(ws) {
        if(this.banned.indexOf(ws._socket.remoteAddress) !== -1) {
            ws.close(1000, "Администратор внёс Ваш ip в бан-лист")
            return
        }

        if(this.games.size === 0) {
            ws.close(1000, "Нет запущенных игр, попробуйте позже")
            return
        }

        let game, online = -1

        for(let eachGame of this.games.values()) {
            const eachOnline = eachGame.clients.size

            if(eachOnline < eachGame.maxOnline) {
                if(eachOnline > online) {
                    game = eachGame
                    online = eachOnline
                }
            }
        }

        if(!game) {
            ws.close(1000, "Сервер переполнен, попробуйте позже")
            return
        }

        const client = new GameClient({
            connection: ws
        });

        this.configureClient(client, game)
    }

    /**
     *
     * @param server
     */
    listen(server) {
        this.webSocketServer = new WebSocketServer.Server({
            server: server,
            binaryType: "arraybuffer"
        });

        this.webSocketServer.on('connection', (ws) => {
            this.onConnection(ws)
        })
    }
}

module.exports = GameSocket
