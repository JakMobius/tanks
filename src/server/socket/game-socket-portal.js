const GameClient = require("../client")
const SocketPortal = require("./socket-portal")

const RoomListRequestPacket = require("../../networking/packets/game-packets/roomlistrequestpacket")
const RoomListPacket = require("../../networking/packets/game-packets/roomlistpacket")
const PlayerRoomRequestPacket = require("../../networking/packets/game-packets/playerroomrequestpacket")
const PlayerRoomChangePacket = require("../../networking/packets/game-packets/playerroomchangepacket")

class GameSocketPortal extends SocketPortal {

    /**
     * @type {Map<string, Room>}
     */
    games = new Map()

    constructor(config) {
        super(config)
        this.config = config || {}
        this.setupRoomsUpdate()
    }

    setupRoomsUpdate() {
        this.roomsInterval = setInterval(() => this.updateRooms(), 1000)
    }

    stopRoomUpdate() {
        clearInterval(this.roomsInterval)
    }

    handleRequest(request) {

        // Only handling /game-socket requests

        if(request.resourceURL.path === "/game-socket") {
            super.handleRequest(request);
        }
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
        super.terminate()
    }

    /**
     * @param client {GameClient}
     * @param game {Room}
     */

    configureClient(client, game) {
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
        }

        this.logger.log("Клиент " + client.id + " подключен к игре " + game.name)

        game.clientConnected(client)
        client.game = game
    }

    clientDisconnected(client) {
        super.clientDisconnected(client);
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
        }
    }

    handlePacket(packet, client) {
        super.handlePacket(packet, client)

        if(packet instanceof RoomListRequestPacket) {
            client.data["listeningForRooms"] = packet.request;
        } else if(packet instanceof PlayerRoomRequestPacket) {
            const room = this.games.get(packet.room);

            if (room) {
                if(room.clients.size >= room.maxOnline) {
                    PlayerRoomChangePacket.deny(
                        packet.room,
                        "Эта комната переполнена"
                    ).sendTo(client.connection)
                } else {
                    PlayerRoomChangePacket.allow(room.name).sendTo(client.connection)
                    this.configureClient(client, room)
                }
            } else {
                PlayerRoomChangePacket.deny(
                    packet.room,
                    "Такой комнаты не существует. Возможно, она была закрыта"
                ).sendTo(client.connection)
            }
        }
        if(packet) client.game.clientMessage(client, packet)
    }

    getFreeGame() {
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

        return game
    }

    clientConnected(client) {
        let connection = client.connection

        if(this.banned.indexOf(connection.remoteAddress) !== -1) {
            connection.close(1000, "Администратор внёс Ваш ip в бан-лист")
            return
        }

        if(this.games.size === 0) {
            connection.close(1000, "Нет запущенных игр, попробуйте позже")
            return
        }

        let game = this.getFreeGame();

        if(!game) {
            connection.close(1000, "Сервер переполнен, попробуйте позже")
            return
        }

        this.configureClient(client, game)
    }
}

module.exports = GameSocketPortal
